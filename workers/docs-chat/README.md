# docs-chat Worker

This Worker keeps the current docs chatbot frontend unchanged while moving the
backend to Cloudflare. It exposes a `POST /chat/completions` endpoint that the
existing widget can call instead of calling AI Search directly from the browser.

## What it adds

- Cloudflare Worker endpoint with CORS handling
- Cloudflare Agent-backed MCP connectivity
- AI Search as a `search_docs` tool against one specific index
- Workers AI text generation with tool calling and streaming
- A `GET /status` endpoint for checking model, docs search, and MCP readiness

## Architecture

Browser widget -> Worker `/chat/completions` -> Agent -> Workers AI + `search_docs` + MCP tools

The current frontend still keeps per-browser chat history in `localStorage`.
This Worker does not yet persist per-user conversations server-side. The shared
Agent instance is used mainly so MCP server connections survive across requests.

## Deploy

1. Install dependencies.

```shell
cd workers/docs-chat
npm install
```

2. Create local env vars.

```shell
cp .dev.vars.example .dev.vars
```

3. Fill in at least `AI_SEARCH_INSTANCE` if you want docs retrieval.

4. Run locally.

```shell
npm run dev
```

5. Deploy.

```shell
npm run deploy
```

## Point the docs widget at the Worker

Set `MOSHPIT_CHATBOT_URL` to the Worker base URL before building the docs.
For example:

```shell
export MOSHPIT_CHATBOT_URL=https://moshpit-docs-chat.<your-subdomain>.workers.dev
make preview
```

The existing post-processing step already appends `/chat/completions`, so the
frontend code does not need to change.

## MCP notes

- `MCP_SERVER_URL` is optional. If unset, the Worker still works with
  `search_docs` only.
- Use service credentials or another non-interactive auth mechanism for public
  docs chat. Interactive OAuth is the wrong fit for this deployment shape.
- Only expose safe tools. This endpoint is public. Prefer read-only MCP tools,
  and use `MCP_ALLOWED_TOOLS` to narrow what the model can call.
- Cloudflare blocks MCP HTTP connections to private/internal IP ranges. If your
  MCP server is internal, bind it through Cloudflare Durable Objects / Agents
  instead of using a private URL.
