(function () {
  if (window.__MOSHPIT_CHATBOT_INITIALIZED) {
    return;
  }
  window.__MOSHPIT_CHATBOT_INITIALIZED = true;

  const SCRIPT_SELECTOR = 'script[data-moshpit-chatbot="true"]';
  const STORAGE_KEY = 'moshpit-chatbot:v1';
  const MAX_STORED_MESSAGES = 40;
  const MAX_CONTEXT_MESSAGES = 20;
  const EMPTY_STATE_TITLE = 'Ask about MOSHPIT docs';
  const EMPTY_STATE_BODY = 'Chat history stays on this device and follows you between pages.';
  const script = document.currentScript || document.querySelector(SCRIPT_SELECTOR);
  const endpoint = normalizeEndpoint(script && script.dataset ? script.dataset.moshpitChatbotEndpoint : '');

  if (!endpoint) {
    console.error('MOSHPIT chatbot endpoint is missing.');
    return;
  }

  const state = loadState();
  let isSending = false;
  let streamingMessageIndex = -1;
  let root;
  let toggleButton;
  let backdrop;
  let panel;
  let messagesContainer;
  let form;
  let textarea;
  let sendButton;
  let clearButton;
  let closeButton;
  let liveRegion;

  const icons = {
    bubble:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.75 5.5A2.75 2.75 0 0 1 7.5 2.75h9A2.75 2.75 0 0 1 19.25 5.5v6A2.75 2.75 0 0 1 16.5 14.25H11l-3.99 3.17c-.83.66-2.01.07-2.01-.99V14.1A2.74 2.74 0 0 1 4.75 11.5v-6Zm4 2.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5H13a.75.75 0 0 0 0-1.5H8.75Z"/></svg>',
    send:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.7 11.29 18.44 4.6c1.2-.54 2.42.67 1.88 1.88L13.63 21.22c-.56 1.24-2.39 1.09-2.74-.22L9.5 15.4 3.9 14.1c-1.3-.3-1.43-2.1-.2-2.81Zm6.65 2.44.93 3.97 5.5-12.12-12.1 5.5 3.96.93 3.28-3.28a.75.75 0 0 1 1.06 1.06l-3.29 3.29Z"/></svg>',
    clear:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.25 3.5A2.75 2.75 0 0 1 12 6.25h5a.75.75 0 0 1 0 1.5h-.48l-.62 10.44A2.75 2.75 0 0 1 13.15 20.75h-2.3A2.75 2.75 0 0 1 8.1 18.19L7.48 7.75H7a.75.75 0 0 1 0-1.5h5A2.75 2.75 0 0 1 9.25 3.5Zm4.8 3.25h-4.1l.54 10.35c.04.64.57 1.15 1.21 1.15h.6c.64 0 1.17-.51 1.2-1.15l.55-10.35ZM10.75 6.25h2.5v-.1a1.25 1.25 0 0 0-2.5 0v.1Z"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.53 5.47a.75.75 0 0 1 1.06 0L12 9.88l4.41-4.41a.75.75 0 1 1 1.06 1.06L13.06 10.94l4.41 4.41a.75.75 0 1 1-1.06 1.06L12 12l-4.41 4.41a.75.75 0 0 1-1.06-1.06l4.41-4.41-4.41-4.41a.75.75 0 0 1 0-1.06Z"/></svg>',
    copy:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.25 3.75A2.25 2.25 0 0 0 7 6v8.75A2.25 2.25 0 0 0 9.25 17h7.5A2.25 2.25 0 0 0 19 14.75V6a2.25 2.25 0 0 0-2.25-2.25h-7.5Zm-.75 2.25c0-.41.34-.75.75-.75h7.5c.41 0 .75.34.75.75v8.75c0 .41-.34.75-.75.75h-7.5a.75.75 0 0 1-.75-.75V6Zm-3.25 3a.75.75 0 0 1 1.5 0v8.25c0 .41.34.75.75.75h7.75a.75.75 0 0 1 0 1.5H7.5a2.25 2.25 0 0 1-2.25-2.25V9Z"/></svg>'
  };

  function normalizeEndpoint(value) {
    if (typeof value !== 'string') {
      return '';
    }

    let normalized = value.trim();
    if (!normalized) {
      return '';
    }

    normalized = normalized.replace(/\/+$/, '');

    if (/\/assets\/[^/]+\/search-snippet\.es\.js$/.test(normalized)) {
      normalized = normalized.replace(/\/assets\/[^/]+\/search-snippet\.es\.js$/, '');
    }

    if (normalized.endsWith('/chat/completions')) {
      return normalized;
    }

    return normalized + '/chat/completions';
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { open: false, messages: [] };
      }

      const parsed = JSON.parse(raw);
      const messages = Array.isArray(parsed.messages)
        ? parsed.messages
            .filter(function (message) {
              return (
                message &&
                (message.role === 'user' || message.role === 'assistant') &&
                typeof message.content === 'string' &&
                message.content.trim() !== ''
              );
            })
            .slice(-MAX_STORED_MESSAGES)
        : [];

      return {
        open: Boolean(parsed.open),
        messages: messages
      };
    } catch (error) {
      console.warn('Could not restore MOSHPIT chat history.', error);
      return { open: false, messages: [] };
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          open: state.open,
          messages: state.messages.slice(-MAX_STORED_MESSAGES)
        })
      );
    } catch (error) {
      console.warn('Could not persist MOSHPIT chat history.', error);
    }
  }

  function trimStoredMessages() {
    const overflow = state.messages.length - MAX_STORED_MESSAGES;
    if (overflow <= 0) {
      return;
    }

    state.messages = state.messages.slice(-MAX_STORED_MESSAGES);

    if (streamingMessageIndex >= 0) {
      streamingMessageIndex = Math.max(-1, streamingMessageIndex - overflow);
    }
  }

  function init() {
    if (!document.body) {
      return;
    }

    if (document.querySelector('.moshpit-chatbot')) {
      return;
    }

    root = document.createElement('div');
    root.className = 'moshpit-chatbot';
    root.dataset.state = 'closed';
    root.innerHTML = [
      '<button class="moshpit-chatbot__toggle" type="button" aria-expanded="false" aria-label="Open documentation chat">',
      icons.bubble,
      '</button>',
      '<div class="moshpit-chatbot__backdrop" hidden></div>',
      '<section class="moshpit-chatbot__panel" hidden role="dialog" aria-modal="false" aria-label="Documentation chat">',
      '<div class="moshpit-chatbot__chrome"></div>',
      '<div class="moshpit-chatbot__header">',
      '<div class="moshpit-chatbot__actions">',
      '<button class="moshpit-chatbot__icon-button" type="button" data-action="clear" aria-label="Clear conversation" title="Clear conversation">',
      icons.clear,
      '</button>',
      '<button class="moshpit-chatbot__icon-button" type="button" data-action="close" aria-label="Close chat" title="Close chat">',
      icons.close,
      '</button>',
      '</div>',
      '</div>',
      '<div class="moshpit-chatbot__messages"></div>',
      '<form class="moshpit-chatbot__composer">',
      '<label class="moshpit-chatbot__sr-only" for="moshpit-chatbot-input">Ask about MOSHPIT docs</label>',
      '<textarea id="moshpit-chatbot-input" class="moshpit-chatbot__input" rows="1" placeholder="Ask about MOSHPIT docs"></textarea>',
      '<button class="moshpit-chatbot__send" type="submit" aria-label="Send message">',
      icons.send,
      '</button>',
      '</form>',
      '</section>',
      '<div class="moshpit-chatbot__sr-only" aria-live="polite" aria-atomic="true"></div>'
    ].join('');

    document.body.appendChild(root);

    toggleButton = root.querySelector('.moshpit-chatbot__toggle');
    backdrop = root.querySelector('.moshpit-chatbot__backdrop');
    panel = root.querySelector('.moshpit-chatbot__panel');
    messagesContainer = root.querySelector('.moshpit-chatbot__messages');
    form = root.querySelector('.moshpit-chatbot__composer');
    textarea = root.querySelector('.moshpit-chatbot__input');
    sendButton = root.querySelector('.moshpit-chatbot__send');
    clearButton = root.querySelector('[data-action="clear"]');
    closeButton = root.querySelector('[data-action="close"]');
    liveRegion = root.querySelector('[aria-live="polite"]');

    bindEvents();
    renderMessages();
    setOpen(Boolean(state.open), false);
    autoResizeTextarea();
    updateActions();
  }

  function bindEvents() {
    toggleButton.addEventListener('click', function () {
      setOpen(!state.open, true);
    });

    backdrop.addEventListener('click', function () {
      setOpen(false, true);
    });

    closeButton.addEventListener('click', function () {
      setOpen(false, true);
    });

    clearButton.addEventListener('click', function () {
      state.messages = [];
      saveState();
      renderMessages();
      announce('Conversation cleared.');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      void submitMessage();
    });

    textarea.addEventListener('input', function () {
      autoResizeTextarea();
      updateActions();
    });

    textarea.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void submitMessage();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.open) {
        setOpen(false, true);
      }
    });

    window.addEventListener('pagehide', saveState);
  }

  function setOpen(nextOpen, shouldFocus) {
    state.open = Boolean(nextOpen);
    root.dataset.state = state.open ? 'open' : 'closed';
    panel.hidden = !state.open;
    backdrop.hidden = !state.open;
    toggleButton.setAttribute('aria-expanded', String(state.open));
    saveState();

    if (state.open) {
      scrollMessagesToBottom();
      if (shouldFocus) {
        window.setTimeout(function () {
          textarea.focus();
        }, 0);
      }
    }
  }

  function updateActions() {
    const hasPrompt = textarea && textarea.value.trim() !== '';
    sendButton.disabled = !hasPrompt || isSending;
    clearButton.disabled = isSending || state.messages.length === 0;
  }

  function autoResizeTextarea() {
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 132) + 'px';
  }

  async function submitMessage() {
    if (isSending) {
      return;
    }

    const content = textarea.value.trim();
    if (!content) {
      return;
    }

    state.messages.push({ role: 'user', content: content });
    trimStoredMessages();
    const requestMessages = buildRequestMessages();
    textarea.value = '';
    autoResizeTextarea();
    renderMessages();
    saveState();
    setOpen(true, false);

    isSending = true;
    streamingMessageIndex = state.messages.length;
    state.messages.push({ role: 'assistant', content: '' });
    updateActions();
    renderMessages();
    announce('Waiting for a response.');

    try {
      const response = await window.fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: requestMessages,
          stream: true,
          ai_search_options: {
            retrieval: {
              max_num_results: 6
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed with status ' + response.status + '.');
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      let assistantReply = '';

      if (response.body && contentType.includes('text/event-stream')) {
        assistantReply = await consumeEventStream(response.body, appendStreamingChunk);
      } else {
        const payload = await response.json();
        assistantReply = extractAssistantReply(payload);
        replaceStreamingMessage(assistantReply);
      }

      if (!assistantReply.trim()) {
        throw new Error('The AI Search endpoint returned an empty response.');
      }

      trimStoredMessages();
      saveState();
      renderMessages();
      announce('Response received.');
    } catch (error) {
      console.error('MOSHPIT chatbot request failed.', error);
      applyStreamingError(error);
      trimStoredMessages();
      saveState();
      renderMessages();
      announce('The request failed.');
    } finally {
      isSending = false;
      streamingMessageIndex = -1;
      renderMessages();
      updateActions();
      if (state.open) {
        textarea.focus();
      }
    }
  }

  function buildRequestMessages() {
    return state.messages.slice(-MAX_CONTEXT_MESSAGES).map(function (message) {
      return {
        role: message.role,
        content: message.content
      };
    });
  }

  function extractAssistantReply(payload) {
    const choice = payload && payload.choices && payload.choices[0] ? payload.choices[0] : null;
    const message = choice && choice.message ? choice.message : null;

    if (message) {
      if (typeof message.content === 'string') {
        return message.content.trim();
      }

      return flattenContentParts(message.content, '\n').trim();
    }

    if (typeof payload.response === 'string') {
      return payload.response.trim();
    }

    if (payload && payload.result && typeof payload.result.response === 'string') {
      return payload.result.response.trim();
    }

    return '';
  }

  function flattenContentParts(content, separator) {
    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .map(function (part) {
        if (typeof part === 'string') {
          return part;
        }
        if (part && typeof part.text === 'string') {
          return part.text;
        }
        if (part && typeof part.content === 'string') {
          return part.content;
        }
        return '';
      })
      .join(typeof separator === 'string' ? separator : '');
  }

  function normalizeErrorMessage(error) {
    if (!error) {
      return 'Unknown error.';
    }
    if (typeof error.message === 'string' && error.message.trim() !== '') {
      return error.message.trim();
    }
    return String(error);
  }

  async function consumeEventStream(stream, onChunk) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const result = await reader.read();
      const value = result.value;
      const done = result.done;

      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      while (true) {
        const boundary = findEventBoundary(buffer);
        if (!boundary) {
          break;
        }

        const rawEvent = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary.length);

        const parsed = parseServerSentEvent(rawEvent);
        if (!parsed || !parsed.data) {
          continue;
        }

        if (parsed.data === '[DONE]') {
          return fullText;
        }

        if (parsed.event === 'chunks') {
          continue;
        }

        let payload;
        try {
          payload = JSON.parse(parsed.data);
        } catch (error) {
          console.warn('Could not parse streamed chatbot payload.', error);
          continue;
        }

        const chunkText = extractStreamingChunk(payload);
        if (!chunkText) {
          continue;
        }

        fullText += chunkText;
        onChunk(chunkText);
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      const parsed = parseServerSentEvent(buffer);
      if (parsed && parsed.data && parsed.data !== '[DONE]') {
        try {
          const payload = JSON.parse(parsed.data);
          const chunkText = extractStreamingChunk(payload);
          if (chunkText) {
            fullText += chunkText;
            onChunk(chunkText);
          }
        } catch (error) {
          console.warn('Could not parse final streamed chatbot payload.', error);
        }
      }
    }

    return fullText;
  }

  function findEventBoundary(buffer) {
    const match = buffer.match(/\r?\n\r?\n/);
    if (!match || typeof match.index !== 'number') {
      return null;
    }

    return {
      index: match.index,
      length: match[0].length
    };
  }

  function parseServerSentEvent(rawEvent) {
    const lines = rawEvent.split(/\r?\n/);
    let eventName = '';
    const dataLines = [];

    lines.forEach(function (line) {
      if (!line || line.charAt(0) === ':') {
        return;
      }

      const separatorIndex = line.indexOf(':');
      const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
      let value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);

      if (value.charAt(0) === ' ') {
        value = value.slice(1);
      }

      if (field === 'event') {
        eventName = value;
      } else if (field === 'data') {
        dataLines.push(value);
      }
    });

    return {
      event: eventName,
      data: dataLines.join('\n')
    };
  }

  function extractStreamingChunk(payload) {
    const choice = payload && payload.choices && payload.choices[0] ? payload.choices[0] : null;
    const delta = choice && choice.delta ? choice.delta : null;

    if (!delta) {
      return '';
    }

    if (typeof delta.content === 'string') {
      return delta.content;
    }

    if (delta.content && typeof delta.content.text === 'string') {
      return delta.content.text;
    }

    if (delta.content && typeof delta.content.content === 'string') {
      return delta.content.content;
    }

    return flattenContentParts(delta.content, '');
  }

  function renderMessages() {
    messagesContainer.textContent = '';

    if (state.messages.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'moshpit-chatbot__empty';
      emptyState.innerHTML =
        '<strong>' +
        escapeHtml(EMPTY_STATE_TITLE) +
        '</strong><span>' +
        escapeHtml(EMPTY_STATE_BODY) +
        '</span>';
      messagesContainer.appendChild(emptyState);
    } else {
      state.messages.forEach(function (message, messageIndex) {
        if (
          messageIndex === streamingMessageIndex &&
          message.role === 'assistant' &&
          message.content.trim() === ''
        ) {
          return;
        }
        messagesContainer.appendChild(renderMessage(message));
      });
    }

    if (isSending && !streamingMessageHasContent()) {
      messagesContainer.appendChild(renderTypingIndicator());
    }

    scrollMessagesToBottom();
    updateActions();
  }

  function streamingMessageHasContent() {
    const message = getStreamingMessage();
    return Boolean(message && message.content.trim() !== '');
  }

  function getStreamingMessage() {
    if (streamingMessageIndex < 0 || streamingMessageIndex >= state.messages.length) {
      return null;
    }

    return state.messages[streamingMessageIndex] || null;
  }

  function appendStreamingChunk(chunk) {
    if (!chunk) {
      return;
    }

    const message = getStreamingMessage();
    if (!message) {
      return;
    }

    message.content += chunk;
    renderMessages();
  }

  function replaceStreamingMessage(content) {
    const message = getStreamingMessage();
    if (!message) {
      return;
    }

    message.content = content;
  }

  function applyStreamingError(error) {
    const fallbackMessage =
      'I could not reach the documentation chat just now.\n\n```text\n' +
      normalizeErrorMessage(error) +
      '\n```';

    const message = getStreamingMessage();
    if (!message) {
      state.messages.push({
        role: 'assistant',
        content: fallbackMessage
      });
      trimStoredMessages();
      return;
    }

    if (message.content.trim()) {
      message.content += '\n\nConnection interrupted before the response finished.';
    } else {
      message.content = fallbackMessage;
    }
  }

  function renderMessage(message) {
    const wrapper = document.createElement('article');
    wrapper.className =
      'moshpit-chatbot__message ' +
      (message.role === 'user'
        ? 'moshpit-chatbot__message--user'
        : 'moshpit-chatbot__message--assistant');

    const bubble = document.createElement('div');
    bubble.className = 'moshpit-chatbot__bubble';
    bubble.appendChild(renderMarkdown(message.content));

    wrapper.appendChild(bubble);
    return wrapper;
  }

  function renderTypingIndicator() {
    const wrapper = document.createElement('article');
    wrapper.className = 'moshpit-chatbot__message moshpit-chatbot__message--assistant';

    const bubble = document.createElement('div');
    bubble.className = 'moshpit-chatbot__bubble';

    const indicator = document.createElement('div');
    indicator.className = 'moshpit-chatbot__typing';
    indicator.setAttribute('aria-label', 'Assistant is typing');

    for (let index = 0; index < 3; index += 1) {
      const dot = document.createElement('span');
      dot.className = 'moshpit-chatbot__typing-dot';
      indicator.appendChild(dot);
    }

    bubble.appendChild(indicator);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function renderMarkdown(markdown) {
    const fragment = document.createDocumentFragment();
    const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];

      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines = [];
        index += 1;

        while (index < lines.length && !lines[index].startsWith('```')) {
          codeLines.push(lines[index]);
          index += 1;
        }

        if (index < lines.length && lines[index].startsWith('```')) {
          index += 1;
        }

        fragment.appendChild(renderCodeBlock(codeLines.join('\n'), language));
        continue;
      }

      if (!line.trim()) {
        index += 1;
        continue;
      }

      const headingMatch = line.trim().match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        fragment.appendChild(renderHeading(headingMatch[2], headingMatch[1].length));
        index += 1;
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        const list = document.createElement('ul');
        while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
          const item = document.createElement('li');
          appendInlineContent(item, lines[index].replace(/^\s*[-*]\s+/, ''));
          list.appendChild(item);
          index += 1;
        }
        fragment.appendChild(list);
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const list = document.createElement('ol');
        while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
          const item = document.createElement('li');
          appendInlineContent(item, lines[index].replace(/^\s*\d+\.\s+/, ''));
          list.appendChild(item);
          index += 1;
        }
        fragment.appendChild(list);
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'moshpit-chatbot__blockquote';
        const quoteLines = [];
        while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^\s*>\s?/, ''));
          index += 1;
        }
        appendInlineContent(blockquote, quoteLines.join('\n'));
        fragment.appendChild(blockquote);
        continue;
      }

      const paragraphLines = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        !lines[index].startsWith('```') &&
        !/^\s*[-*]\s+/.test(lines[index]) &&
        !/^\s*\d+\.\s+/.test(lines[index]) &&
        !/^\s*>\s?/.test(lines[index])
      ) {
        paragraphLines.push(lines[index]);
        index += 1;
      }

      const paragraphSource = paragraphLines.join('\n');
      if (isStandaloneLabelParagraph(paragraphSource)) {
        fragment.appendChild(renderStandaloneLabel(paragraphSource));
        continue;
      }

      const paragraph = document.createElement('p');
      appendInlineContent(paragraph, paragraphSource);
      fragment.appendChild(paragraph);
    }

    return fragment;
  }

  function renderHeading(text, level) {
    const heading = document.createElement('p');
    heading.className = 'moshpit-chatbot__heading moshpit-chatbot__heading--level-' + level;
    appendInlineContent(heading, text);
    return heading;
  }

  function isStandaloneLabelParagraph(text) {
    const normalized = String(text).trim();
    return /^\*\*[^*][\s\S]*:\*\*$/.test(normalized) || /^__[^_][\s\S]*:__$/.test(normalized);
  }

  function renderStandaloneLabel(text) {
    const heading = document.createElement('p');
    heading.className = 'moshpit-chatbot__heading moshpit-chatbot__heading--label';

    const normalized = String(text)
      .trim()
      .replace(/^\*\*([\s\S]*?)\*\*$/, '$1')
      .replace(/^__([\s\S]*?)__$/, '$1');

    heading.textContent = normalized;
    return heading;
  }

  function renderCodeBlock(code, language) {
    const wrapper = document.createElement('div');
    wrapper.className = 'moshpit-chatbot__code';

    const toolbar = document.createElement('div');
    toolbar.className = 'moshpit-chatbot__code-toolbar';

    const label = document.createElement('span');
    label.className = 'moshpit-chatbot__code-label';
    label.textContent = language || 'snippet';
    toolbar.appendChild(label);

    const copyButton = document.createElement('button');
    copyButton.className = 'moshpit-chatbot__code-copy';
    copyButton.type = 'button';
    copyButton.innerHTML = icons.copy + '<span>Copy</span>';
    copyButton.setAttribute('aria-label', 'Copy code snippet');
    copyButton.addEventListener('click', function () {
      void copyCodeBlock(code, copyButton);
    });
    toolbar.appendChild(copyButton);

    wrapper.appendChild(toolbar);

    const pre = document.createElement('pre');
    const codeNode = document.createElement('code');
    codeNode.textContent = code;
    pre.appendChild(codeNode);
    wrapper.appendChild(pre);
    return wrapper;
  }

  async function copyCodeBlock(code, button) {
    const label = button.querySelector('span');
    const originalLabel = label ? label.textContent : 'Copy';

    try {
      await navigator.clipboard.writeText(code);
      if (label) {
        label.textContent = 'Copied';
      }
      button.disabled = true;
      announce('Code copied to clipboard.');
    } catch (error) {
      console.error('Could not copy code snippet.', error);
      if (label) {
        label.textContent = 'Failed';
      }
      announce('Could not copy the code snippet.');
    }

    window.setTimeout(function () {
      if (label) {
        label.textContent = originalLabel;
      }
      button.disabled = false;
    }, 1400);
  }

  function appendInlineContent(parent, text) {
    const lines = String(text).split('\n');

    lines.forEach(function (line, lineIndex) {
      appendInlineTokens(parent, line);
      if (lineIndex < lines.length - 1) {
        parent.appendChild(document.createElement('br'));
      }
    });
  }

  function appendInlineTokens(parent, text) {
    const pattern = /(\`[^`]+\`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const token = match[0];
      if (token.charAt(0) === '`') {
        const code = document.createElement('code');
        code.textContent = token.slice(1, -1);
        parent.appendChild(code);
      } else if (token.slice(0, 2) === '**' && token.slice(-2) === '**') {
        const strong = document.createElement('strong');
        strong.textContent = token.slice(2, -2);
        parent.appendChild(strong);
      } else {
        const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (linkMatch) {
          const link = document.createElement('a');
          link.href = linkMatch[2];
          link.rel = 'noreferrer noopener';
          link.target = '_blank';
          link.textContent = linkMatch[1];
          parent.appendChild(link);
        } else {
          parent.appendChild(document.createTextNode(token));
        }
      }

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function scrollMessagesToBottom() {
    window.requestAnimationFrame(function () {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function announce(message) {
    if (!liveRegion) {
      return;
    }
    liveRegion.textContent = '';
    window.setTimeout(function () {
      liveRegion.textContent = message;
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
