# moshpit-docs
[![ReadTheDocs](https://app.readthedocs.org/projects/moshpit/badge/?version=latest)](https://moshpit.qiime2.org/)

MOSHPIT plugin suite documentation


## Development instructions
The following sub-sections illustrate how to develop this documentation.

### Create the development environment

To build this documentation locally for development purposes, first create your development environment.

```shell
conda env create -n moshpit-docs --file environment-files/readthedocs.yml
conda activate moshpit-docs
q2doc refresh-cache
```

### Build the book
Generate the artifact/type references:
```shell
make autodoc
```

Next, build the book:
```shell
make html
```

(Alternatively, `make preview` or `make fast-preview` can speed up test builds.)

### Serve the book locally

Finally, run the following to serve the built documentation locally:
```shell
make serve
```

### Chatbot integration
The documentation pages currently embed a local chatbot widget during HTML
post-processing in [`scripts/postprocess-html.sh`](scripts/postprocess-html.sh).
The widget assets live in `docs/_static/chatbot.js` and
`docs/_static/chatbot.css`, and they call Cloudflare AI Search directly through
the public `/chat/completions` endpoint.

Set `MOSHPIT_CHATBOT_URL` before building. This may be either the base
Cloudflare AI Search instance URL or the full `/chat/completions` endpoint URL.

### Worker-backed chatbot option
If you want MCP-backed tools or want to avoid direct browser calls to Cloudflare
AI Search, there is now a Worker scaffold in `workers/docs-chat`.

That Worker exposes the same `/chat/completions` shape that the current widget
already uses, so you can deploy it separately and then point
`MOSHPIT_CHATBOT_URL` at the Worker URL instead of the AI Search public URL.
See `workers/docs-chat/README.md` for the deployment steps and environment
variables.
