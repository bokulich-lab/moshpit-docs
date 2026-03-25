#!/usr/bin/env bash

set -euo pipefail

build_dir="${1:-docs/_build/html}"
chatbot_url="${MOSHPIT_CHATBOT_URL:-}"

if [[ ! -d "$build_dir" ]]; then
  echo "Build directory not found: $build_dir" >&2
  exit 1
fi

if [[ -z "$chatbot_url" ]]; then
  echo "MOSHPIT_CHATBOT_URL must be set." >&2
  exit 1
fi

html_escape() {
  printf '%s' "$1" | perl -pe 's/&/&amp;/g; s/"/&quot;/g; s/</&lt;/g; s/>/&gt;/g'
}

normalized_chatbot_url="${chatbot_url%/}"
if [[ "$normalized_chatbot_url" == */assets/*/search-snippet.es.js ]]; then
  snippet_url="$normalized_chatbot_url"
  api_url="${normalized_chatbot_url%%/assets/*}"
else
  api_url="$normalized_chatbot_url"
  snippet_url="$normalized_chatbot_url/assets/v0.0.28/search-snippet.es.js"
fi

asset_dir="$build_dir/build"
if [[ -d "$asset_dir" ]]; then
  rm -f "$asset_dir"/moshpit-chatbot-*.js "$asset_dir"/moshpit-chatbot-*.css
fi

escaped_api_url="$(html_escape "$api_url")"
escaped_snippet_url="$(html_escape "$snippet_url")"

head_script_tag="<script type=\"module\" src=\"$escaped_snippet_url\" data-moshpit-chatbot-snippet-script=\"true\"></script>"
head_style_tag="<style data-moshpit-chatbot-snippet-style=\"true\">chat-bubble-snippet { --search-snippet-primary-color: #1eaef6; --search-snippet-primary-hover: #14a0f6; --search-snippet-focus-ring: #aee0f9; } chat-bubble-snippet[data-moshpit-chatbot-snippet=\"true\"] { position: relative; z-index: 2147483647; }</style>"
body_tag="<chat-bubble-snippet api-url=\"$escaped_api_url\" hide-branding=\"true\" data-moshpit-chatbot-snippet=\"true\"></chat-bubble-snippet>"
body_bootstrap_tag="$(cat <<EOF
<script data-moshpit-chatbot-bootstrap="true" data-moshpit-chatbot-api-url="$escaped_api_url">
(() => {
  const script = document.currentScript;
  const apiUrl = script?.getAttribute('data-moshpit-chatbot-api-url');
  const selector = 'chat-bubble-snippet[data-moshpit-chatbot-snippet="true"]';

  const ensureBubble = () => {
    if (!apiUrl || !document.body) return;

    let bubble = document.querySelector(selector);
    if (!bubble) {
      bubble = document.createElement('chat-bubble-snippet');
      bubble.setAttribute('api-url', apiUrl);
      bubble.setAttribute('hide-branding', 'true');
      bubble.setAttribute('data-moshpit-chatbot-snippet', 'true');
      document.body.appendChild(bubble);
      return;
    }

    if (bubble.parentElement !== document.body) {
      document.body.appendChild(bubble);
    }
  };

  const start = () => {
    ensureBubble();

    if (!document.body || window.__moshpitChatbotObserver) return;

    const observer = new MutationObserver(() => {
      ensureBubble();
    });

    observer.observe(document.body, { childList: true });
    window.__moshpitChatbotObserver = observer;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('load', ensureBubble);
  window.requestAnimationFrame(ensureBubble);
  window.setTimeout(ensureBubble, 0);
})();
</script>
EOF
)"

export MOSHPIT_HEAD_SCRIPT_TAG="$head_script_tag"
export MOSHPIT_HEAD_STYLE_TAG="$head_style_tag"
export MOSHPIT_BODY_TAG="$body_tag"
export MOSHPIT_BODY_BOOTSTRAP_TAG="$body_bootstrap_tag"

find "$build_dir" -type f -name '*.html' -print0 | while IFS= read -r -d '' file; do
  perl -0pi -e '
    s{\s*<link[^>]+data-moshpit-chatbot-style="true"[^>]*\/?>}{}gs;
    s{\s*<script[^>]+data-moshpit-chatbot="true"[^>]*></script\s*>}{}gs;
    s{\s*<script[^>]+data-moshpit-chatbot-snippet-script="true"[^>]*></script\s*>}{}gs;
    s{\s*<style[^>]+data-moshpit-chatbot-snippet-style="true"[^>]*>.*?</style\s*>}{}gs;
    s{\s*<script[^>]+data-moshpit-chatbot-bootstrap="true"[^>]*>.*?</script\s*>}{}gs;
    s{\s*<chat-bubble-snippet[^>]+data-moshpit-chatbot-snippet="true"[^>]*>\s*</chat-bubble-snippet\s*>}{}gs;
    s{</head>}{$ENV{MOSHPIT_HEAD_STYLE_TAG}$ENV{MOSHPIT_HEAD_SCRIPT_TAG}</head>}s;
    s{</body>}{$ENV{MOSHPIT_BODY_TAG}$ENV{MOSHPIT_BODY_BOOTSTRAP_TAG}</body>}s;
  ' "$file"
done
