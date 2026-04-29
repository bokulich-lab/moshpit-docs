#!/usr/bin/env bash

set -euo pipefail

build_dir="${1:-docs/_build/html}"
chatbot_url="${MOSHPIT_CHATBOT_URL:-}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_css="$repo_root/docs/_static/chatbot.css"
source_js="$repo_root/docs/_static/chatbot.js"
css_asset_name="moshpit-chatbot.css"
js_asset_name="moshpit-chatbot.js"

if [[ ! -d "$build_dir" ]]; then
  echo "Build directory not found: $build_dir" >&2
  exit 1
fi

if [[ -z "$chatbot_url" ]]; then
  echo "MOSHPIT_CHATBOT_URL must be set." >&2
  exit 1
fi

if [[ ! -f "$source_css" ]]; then
  echo "Chatbot stylesheet not found: $source_css" >&2
  exit 1
fi

if [[ ! -f "$source_js" ]]; then
  echo "Chatbot script not found: $source_js" >&2
  exit 1
fi

html_escape() {
  printf '%s' "$1" | perl -pe 's/&/&amp;/g; s/"/&quot;/g; s/</&lt;/g; s/>/&gt;/g'
}

normalized_chatbot_url="${chatbot_url%/}"
if [[ "$normalized_chatbot_url" == */assets/*/search-snippet.es.js ]]; then
  normalized_chatbot_url="${normalized_chatbot_url%%/assets/*}"
fi

if [[ "$normalized_chatbot_url" == */chat/completions ]]; then
  endpoint_url="$normalized_chatbot_url"
else
  endpoint_url="$normalized_chatbot_url/chat/completions"
fi

asset_dir="$build_dir/build"
mkdir -p "$asset_dir"
rm -f "$asset_dir/$css_asset_name" "$asset_dir/$js_asset_name"
cp "$source_css" "$asset_dir/$css_asset_name"
cp "$source_js" "$asset_dir/$js_asset_name"

escaped_endpoint_url="$(html_escape "$endpoint_url")"
head_link_tag="<link rel=\"stylesheet\" href=\"/build/$css_asset_name\" data-moshpit-chatbot-style=\"true\"/>"
head_script_tag="<script src=\"/build/$js_asset_name\" defer data-moshpit-chatbot=\"true\" data-moshpit-chatbot-endpoint=\"$escaped_endpoint_url\"></script>"

export MOSHPIT_HEAD_LINK_TAG="$head_link_tag"
export MOSHPIT_HEAD_SCRIPT_TAG="$head_script_tag"

find "$build_dir" -type f -name '*.html' -print0 | while IFS= read -r -d '' file; do
  perl -0pi -e '
    s{\s*<link[^>]+data-moshpit-chatbot-style="true"[^>]*\/?>}{}gs;
    s{\s*<script[^>]+data-moshpit-chatbot="true"[^>]*></script\s*>}{}gs;
    s{\s*<script[^>]+data-moshpit-chatbot-snippet-script="true"[^>]*></script\s*>}{}gs;
    s{\s*<style[^>]+data-moshpit-chatbot-snippet-style="true"[^>]*>.*?</style\s*>}{}gs;
    s{\s*<script[^>]+data-moshpit-chatbot-bootstrap="true"[^>]*>.*?</script\s*>}{}gs;
    s{\s*<chat-bubble-snippet[^>]*>\s*</chat-bubble-snippet\s*>}{}gs;
    s{</head>}{$ENV{MOSHPIT_HEAD_LINK_TAG}$ENV{MOSHPIT_HEAD_SCRIPT_TAG}</head>}s;
  ' "$file"
done
