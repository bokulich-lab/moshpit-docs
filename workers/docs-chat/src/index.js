import { Agent } from "agents";
import { generateText, stepCountIs, streamText, tool } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { z } from "zod";

const CHAT_COMPLETIONS_PATH = "/chat/completions";
const STATUS_PATH = "/status";
const DEFAULT_AGENT_INSTANCE = "public-docs";
const DEFAULT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEFAULT_MAX_RESULTS = 6;
const DEFAULT_SCORE_THRESHOLD = 0.2;
const MAX_TOOL_STEPS = 6;
const MAX_EXCERPT_LENGTH = 1400;

export class DocsChatAgent extends Agent {
  async onStart() {
    await ensureMcpConnection(this);
  }

  async onRequest(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === STATUS_PATH)) {
      return Response.json(await buildAgentStatus(this));
    }

    if (request.method === "POST" && url.pathname === CHAT_COMPLETIONS_PATH) {
      return handleChatRequest(this, request);
    }

    return json({ error: "Not found." }, { status: 404 });
  }
}

export default {
  async fetch(request, env) {
    if (!isOriginAllowed(request, env)) {
      return withCors(
        json({ error: "Origin not allowed." }, { status: 403 }),
        request,
        env,
      );
    }

    if (request.method === "OPTIONS") {
      return createPreflightResponse(request, env);
    }

    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === STATUS_PATH)) {
      const response = await forwardToAgent(request, env, STATUS_PATH);
      return withCors(response, request, env);
    }

    if (request.method === "POST" && url.pathname === CHAT_COMPLETIONS_PATH) {
      const response = await forwardToAgent(request, env, CHAT_COMPLETIONS_PATH);
      return withCors(response, request, env);
    }

    return withCors(json({ error: "Not found." }, { status: 404 }), request, env);
  },
};

async function handleChatRequest(agent, request) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const messages = normalizeMessages(payload && payload.messages);
  if (messages.length === 0) {
    return json({ error: "The request must include at least one chat message." }, { status: 400 });
  }

  try {
    const toolset = await buildToolset(agent, payload);
    const workersAI = createWorkersAI({ binding: agent.env.AI });
    const model = workersAI(trimmedEnv(agent.env.WORKERS_AI_MODEL) || DEFAULT_MODEL);
    const system = buildSystemPrompt({
      docsSearchConfigured: Boolean(trimmedEnv(agent.env.AI_SEARCH_INSTANCE)),
      mcpConfigured: Boolean(trimmedEnv(agent.env.MCP_SERVER_URL)),
    });
    const temperature = normalizeTemperature(payload && payload.temperature);
    const generationOptions = {
      model,
      system,
      messages,
      tools: toolset,
      stopWhen: stepCountIs(MAX_TOOL_STEPS),
      abortSignal: request.signal,
    };

    if (typeof temperature === "number") {
      generationOptions.temperature = temperature;
    }

    const wantsStreaming = payload && payload.stream !== false;

    if (!wantsStreaming) {
      const result = await generateText(generationOptions);
      return json({
        choices: [
          {
            message: {
              role: "assistant",
              content: result.text || "",
            },
          },
        ],
      });
    }

    const result = streamText(generationOptions);
    return createSseResponse(result);
  } catch (error) {
    console.error("Chat completion failed", error);
    return json({ error: normalizeError(error) }, { status: 500 });
  }
}

async function buildToolset(agent, payload) {
  const tools = {};
  const searchTool = createSearchDocsTool(agent, payload);

  if (searchTool) {
    tools.search_docs = searchTool;
  }

  if (trimmedEnv(agent.env.MCP_SERVER_URL)) {
    const connection = await ensureMcpConnection(agent);
    if (connection.state !== "failed" && connection.state !== "authenticating") {
      try {
        await agent.mcp.waitForConnections({ timeout: 10_000 });
        const mcpTools = filterAllowedTools(
          agent.mcp.getAITools(),
          parseCsv(agent.env.MCP_ALLOWED_TOOLS),
        );
        Object.assign(tools, mcpTools);
      } catch (error) {
        console.error("MCP tools unavailable for this request", error);
      }
    }
  }

  return tools;
}

function createSearchDocsTool(agent, payload) {
  const instanceName = trimmedEnv(agent.env.AI_SEARCH_INSTANCE);
  if (!instanceName) {
    return null;
  }

  const defaultMaxResults = clampInteger(
    payload && payload.ai_search_options && payload.ai_search_options.retrieval
      ? payload.ai_search_options.retrieval.max_num_results
      : undefined,
    1,
    10,
    parseInteger(agent.env.AI_SEARCH_MAX_RESULTS, DEFAULT_MAX_RESULTS),
  );
  const scoreThreshold = parseNumber(agent.env.AI_SEARCH_SCORE_THRESHOLD, DEFAULT_SCORE_THRESHOLD);

  return tool({
    description:
      "Search the MOSHPIT documentation index and return the most relevant snippets with filenames and metadata.",
    inputSchema: z.object({
      query: z.string().min(2).describe("The documentation question or search query."),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe("Optional number of snippets to retrieve. Defaults to the server setting."),
    }),
    execute: async ({ query, maxResults }) => {
      try {
        const result = await agent.env.AI.autorag(instanceName).search({
          query,
          rewrite_query: true,
          max_num_results: clampInteger(maxResults, 1, 10, defaultMaxResults),
          ranking_options: {
            score_threshold: scoreThreshold,
          },
        });

        return {
          ok: true,
          query,
          results: Array.isArray(result && result.data)
            ? result.data.map(formatSearchResult)
            : [],
        };
      } catch (error) {
        console.error("search_docs failed", error);
        return {
          ok: false,
          query,
          error: normalizeError(error),
          results: [],
        };
      }
    },
  });
}

async function ensureMcpConnection(agent) {
  const url = trimmedEnv(agent.env.MCP_SERVER_URL);
  if (!url) {
    return { state: "disabled" };
  }

  const serverId = trimmedEnv(agent.env.MCP_SERVER_NAME) || "tools";
  const headers = buildMcpHeaders(agent.env);
  const transport = { type: "auto" };
  if (Object.keys(headers).length > 0) {
    transport.headers = headers;
  }

  try {
    const result = await agent.addMcpServer(serverId, url, { transport });
    if (result.state === "authenticating") {
      console.warn(
        "MCP server requires interactive OAuth. Use service credentials for a public docs chatbot.",
      );
      return result;
    }

    await agent.mcp.waitForConnections({ timeout: 10_000 });
    return result;
  } catch (error) {
    console.error("Failed to initialize MCP server", error);
    return { state: "failed", error: normalizeError(error) };
  }
}

async function buildAgentStatus(agent) {
  const mcpConnection = await ensureMcpConnection(agent);
  const mcpState = typeof agent.getMcpServers === "function" ? agent.getMcpServers() : null;
  let availableToolNames = [];

  if (
    trimmedEnv(agent.env.MCP_SERVER_URL) &&
    mcpConnection.state !== "failed" &&
    mcpConnection.state !== "authenticating"
  ) {
    try {
      await agent.mcp.waitForConnections({ timeout: 2_000 });
      availableToolNames = Object.keys(agent.mcp.getAITools());
    } catch (error) {
      console.error("Could not inspect MCP tools", error);
    }
  }

  const allowedTools = parseCsv(agent.env.MCP_ALLOWED_TOOLS);
  const enabledToolNames = allowedTools.length > 0
    ? availableToolNames.filter((toolName) => allowedTools.includes(toolName))
    : availableToolNames;

  return {
    service: "moshpit-docs-chat",
    endpoint: CHAT_COMPLETIONS_PATH,
    chatInstance: trimmedEnv(agent.env.CHAT_INSTANCE_NAME) || DEFAULT_AGENT_INSTANCE,
    workersAiModel: trimmedEnv(agent.env.WORKERS_AI_MODEL) || DEFAULT_MODEL,
    aiSearch: {
      configured: Boolean(trimmedEnv(agent.env.AI_SEARCH_INSTANCE)),
      instance: trimmedEnv(agent.env.AI_SEARCH_INSTANCE) || null,
      defaultMaxResults: parseInteger(agent.env.AI_SEARCH_MAX_RESULTS, DEFAULT_MAX_RESULTS),
      scoreThreshold: parseNumber(agent.env.AI_SEARCH_SCORE_THRESHOLD, DEFAULT_SCORE_THRESHOLD),
    },
    mcp: {
      configured: Boolean(trimmedEnv(agent.env.MCP_SERVER_URL)),
      serverUrl: trimmedEnv(agent.env.MCP_SERVER_URL) || null,
      serverName: trimmedEnv(agent.env.MCP_SERVER_NAME) || "tools",
      connection: mcpConnection,
      availableTools: availableToolNames,
      enabledTools: enabledToolNames,
      servers: mcpState && mcpState.servers ? mcpState.servers : {},
    },
  };
}

function buildSystemPrompt({ docsSearchConfigured, mcpConfigured }) {
  const parts = [
    "You are the MOSHPIT documentation assistant.",
    "Prefer evidence from tool calls over unsupported recollection.",
    "Use the search_docs tool for questions about MOSHPIT documentation, commands, workflows, or configuration details before you answer.",
    "If tool results are incomplete, say what is missing instead of inventing details.",
    "Use fenced code blocks for commands, code, or file content whenever that improves readability.",
  ];

  if (!docsSearchConfigured) {
    parts.push(
      "The docs retrieval tool is not configured in this deployment. If a question depends on the MOSHPIT docs, say that docs retrieval is unavailable right now.",
    );
  }

  if (mcpConfigured) {
    parts.push(
      "Additional MCP tools may be available for external systems. Use them only when they materially improve the answer.",
    );
  }

  return parts.join("\n\n");
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const role = typeof message.role === "string" ? message.role.trim() : "";
      if (!["system", "user", "assistant", "tool"].includes(role)) {
        return null;
      }

      const content = normalizeContent(message.content);
      if (!content) {
        return null;
      }

      return {
        role,
        content,
      };
    })
    .filter(Boolean);
}

function normalizeContent(content) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part.text === "string") {
          return part.text;
        }
        if (part && typeof part.content === "string") {
          return part.content;
        }
        if (part && typeof part.input === "string") {
          return part.input;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  if (content && typeof content === "object") {
    if (typeof content.text === "string") {
      return content.text.trim();
    }
    if (typeof content.content === "string") {
      return content.content.trim();
    }
  }

  return "";
}

function formatSearchResult(item) {
  const excerpt = flattenTextParts(item && item.content);
  return {
    filename: item && typeof item.filename === "string" ? item.filename : null,
    score: item && typeof item.score === "number" ? item.score : null,
    excerpt: excerpt.length > MAX_EXCERPT_LENGTH ? excerpt.slice(0, MAX_EXCERPT_LENGTH) + "..." : excerpt,
    attributes: item && item.attributes && typeof item.attributes === "object" ? item.attributes : {},
  };
}

function flattenTextParts(content) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (part && typeof part.text === "string") {
        return part.text;
      }
      if (part && typeof part.content === "string") {
        return part.content;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function filterAllowedTools(tools, allowlist) {
  if (!tools || typeof tools !== "object") {
    return {};
  }

  if (!Array.isArray(allowlist) || allowlist.length === 0) {
    return tools;
  }

  return Object.fromEntries(
    Object.entries(tools).filter(([toolName]) => allowlist.includes(toolName)),
  );
}

function buildMcpHeaders(env) {
  const headers = {};
  const bearerToken = trimmedEnv(env.MCP_BEARER_TOKEN);
  const accessClientId = trimmedEnv(env.MCP_ACCESS_CLIENT_ID);
  const accessClientSecret = trimmedEnv(env.MCP_ACCESS_CLIENT_SECRET);

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  if (accessClientId) {
    headers["CF-Access-Client-Id"] = accessClientId;
  }

  if (accessClientSecret) {
    headers["CF-Access-Client-Secret"] = accessClientSecret;
  }

  return headers;
}

async function forwardToAgent(request, env, path) {
  const stub = env.DOCS_CHAT.getByName(trimmedEnv(env.CHAT_INSTANCE_NAME) || DEFAULT_AGENT_INSTANCE);
  const proxyUrl = new URL("https://docs-chat.internal");
  proxyUrl.pathname = path;
  return stub.fetch(new Request(proxyUrl.toString(), request));
}

function createSseResponse(result) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(formatSseData({ choices: [{ delta: { content: chunk } }] })));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Streaming chat response failed", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

function formatSseData(payload) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function createPreflightResponse(request, env) {
  return withCors(new Response(null, { status: 204 }), request, env);
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  const origin = request.headers.get("Origin");
  const allowedOrigin = resolveAllowedOrigin(origin, env);

  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", appendVary(headers.get("Vary"), "Origin"));

  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isOriginAllowed(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return true;
  }

  const allowedOrigins = parseCsv(env.ALLOWED_ORIGINS);
  if (allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

function resolveAllowedOrigin(origin, env) {
  const allowedOrigins = parseCsv(env.ALLOWED_ORIGINS);

  if (allowedOrigins.length === 0) {
    return origin || "*";
  }

  if (!origin) {
    return allowedOrigins[0];
  }

  return allowedOrigins.includes(origin) ? origin : null;
}

function appendVary(existing, value) {
  if (!existing) {
    return value;
  }

  const parts = existing.split(",").map((part) => part.trim());
  if (parts.includes(value)) {
    return existing;
  }

  return `${existing}, ${value}`;
}

function parseCsv(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function trimmedEnv(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function normalizeTemperature(value) {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.min(2, Math.max(0, parsed));
}

function normalizeError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

function json(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(payload, null, 2), {
    ...init,
    headers,
  });
}
