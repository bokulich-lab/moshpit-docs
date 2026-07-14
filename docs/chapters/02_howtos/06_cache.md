(artifact-cache)=
# How to use the artifact cache

An [artifact cache](https://use.qiime2.org/en/stable/tutorials/use-the-artifact-cache/) lets you store QIIME 2 Results as unzipped directories on disk and refer to them by a key, instead of packing and unpacking `.qza` / `.qzv` files every time. That is especially useful for MOSHPIT: reference databases and intermediate artifacts are often very large, and many actions (including those run under [parsl](parsl)) benefit from reading data that is already decompressed in a shared location.

The [analysis recipes](workflow-guides) in this documentation use the shorthand `cache:key`. That assumes a cache directory named `cache` in your current working directory. You can also pass a full path, e.g. `/scratch/shared/cache:kraken2_db`.

:::{warning}
Do **not** edit or write files inside the cache directory by hand. Create, store, load, and remove entries only through the QIIME 2 tools described below. The only safe manual operation is deleting the entire top-level cache directory when you no longer need it.
:::

For a fuller walkthrough (including the Python API), see the official tutorial [Using an Artifact Cache](https://use.qiime2.org/en/stable/tutorials/use-the-artifact-cache/).

---

## Create a cache

```{code} bash
mosh tools cache-create --cache ./cache
```

This creates `./cache` if it does not exist. The same path is how you point later commands at an existing cache.

---

## Store an existing `.qza` in the cache

If you already have an artifact on disk (for example a downloaded Kraken 2 database), store it under a key so later actions can reuse it without unzipping:

```{code} bash
mosh tools cache-store \
    --cache ./cache \
    --artifact-path ./kraken2-db.qza \
    --key kraken2_db
```

To bring external files into QIIME 2 *and* the cache in one step, use [`cache-import`](data-import) instead of `cache-store`.

---

## Use cache keys with actions

Refer to a cached artifact as `path-to-cache:key`. Inputs and outputs can both use this form:

```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs ./cache:reads \
    --i-db ./cache:kraken2_db \
    --o-reports ./cache:kraken2_reports \
    --o-outputs ./cache:kraken2_hits \
    --verbose
```

If the cache lives in the current directory and is named `cache`, the analysis recipes shorten this further to `cache:reads`, `cache:contigs`, and so on. Visualization outputs are often left as `.qzv` files so you can open them in [QIIME 2 View](https://view.qiime2.org).

---

## Inspect and manage cache contents

List what is stored:

```{code} bash
mosh tools cache-status --cache ./cache
```

Remove a single entry you no longer need:

```{code} bash
mosh tools cache-remove \
    --cache ./cache \
    --key kraken2_db
```

To delete the whole cache, remove the directory (for example `rm -r ./cache`). There is no undo.

---

## When to use a cache in MOSHPIT

| Situation | Why a cache helps |
|-----------|-------------------|
| Large reference DBs (Kraken 2, BUSCO, EggNOG, HUMAnN, …) | Avoid unzipping tens of GB on every action; share one copy on a cluster filesystem |
| Long pipelines with many intermediates | Keep contigs, indexes, MAGs, and reports available by stable keys |
| Parallel / HPC runs with [parsl](parsl) | Workers can all see the same unzipped artifacts if the cache is on shared storage |

Exporting data *from* a cache for use with external tools is still limited; see the workarounds in [How to connect with other tools](data-export).
