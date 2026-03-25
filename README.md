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
The documentation pages currently embed Cloudflare's hosted
`chat-bubble-snippet` during HTML post-processing in
[`scripts/postprocess-html.sh`](scripts/postprocess-html.sh).

Set `MOSHPIT_CHATBOT_URL` before building. This may be either the base
Cloudflare chatbot URL or the full `search-snippet.es.js` asset URL.
