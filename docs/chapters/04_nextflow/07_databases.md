(nf-moshpit-databases)=
# Reference databases

You only need databases for the methods you enable. The [read-QC quick start](#nf-moshpit-quick-start) needs none. For most database settings, supply both a **QIIME 2 cache directory** and a **key in that cache**; a raw database directory or `.qza` filename is not interchangeable with a cache key.

## Prepare a shared database cache

Use a persistent location accessible to all compute jobs. In an activated MOSHPIT environment:

```bash
qiime tools cache-create --cache /data/reference-cache
qiime tools cache-store \
  --cache /data/reference-cache \
  --artifact-path /data/kraken2-db.qza \
  --key kraken2_db
qiime tools cache-status --cache /data/reference-cache
```

Only run `cache-create` when creating a new cache. Store artifacts with the semantic type required by the consuming action. See [Using the artifact cache](#artifact-cache) for further cache operations.

For Kraken 2 plus Bracken, an example parameter section is:

```yaml
databases:
  kraken2:
    cache: /data/reference-cache
    key: kraken2_db
    fetchCollection: "standard"
  bracken:
    cache: /data/reference-cache
    key: bracken_db
```

Populate a compatible Bracken entry too when enabling Bracken. Record database collections/releases and, where relevant, read length with your analysis. A stable key name does not identify a database version by itself.

## Required settings by method

Each name below is a section under `databases`.

| Enabled method | Database sections | Additional settings or preparation |
| --- | --- | --- |
| Host removal | `hostRemoval.cache`, `hostRemoval.key` | Prepare the reference expected by `quality-control filter-reads`; human pangenome fallback is available with `host_removal.human: true`. |
| Kraken 2 | `kraken2.cache`, `kraken2.key` | `fetchCollection` selects the fetched collection. Also set Bracken cache/key because the fetch process declares both outputs. |
| Bracken on reads | `bracken.cache`, `bracken.key` | Match the Kraken 2 collection and configured `taxonomic_classification.bracken.readLength`. |
| Kaiju | `kaiju.cache`, `kaiju.key`, `kaiju.databaseType` | The database type must be supported by your installed `annotate fetch-kaiju-db` action. |
| BUSCO | `busco.cache`, `busco.key`, `busco.fetchLineages` | Align the fetched lineages with `binning.qc.busco.lineageDatasets` and `selectLineage`. |
| CheckM | `checkm.path` | Accessible CheckM reference-data directory; this is a filesystem path, rather than a cache/key pair. |
| eggNOG | `eggnogOrthologs.cache/key` and `eggnogAnnotations.cache/key` | Both the DIAMOND ortholog-search and annotation databases are needed. |
| HUMAnN 3 | `humann3Chocophlan.cache/key`, `humann3TranslatedSearch.cache/key`, `humann3Metaphlan.cache/key` | Translated search uses `build` (default `uniref90_diamond`); MetaPhlAn uses `index` (default `latest`) and `cpus` (default `1`). |

For BUSCO, for example:

```yaml
databases:
  busco:
    cache: /data/reference-cache
    key: busco_bacteria
    fetchLineages: "bacteria_odb12"
```

For HUMAnN 3:

```yaml
databases:
  humann3Chocophlan:
    cache: /data/reference-cache
    key: humann_chocophlan
  humann3TranslatedSearch:
    cache: /data/reference-cache
    key: humann_uniref90
    build: "uniref90_diamond"
  humann3Metaphlan:
    cache: /data/reference-cache
    key: humann_metaphlan
    index: "latest"
    cpus: 1
```

Treat these snippets as edits to your existing `databases` section. Replace `latest` with a supported fixed index when you need a reproducible database selection.

## Reuse versus download

Database-fetch processes check for the configured key and reuse it if present. Otherwise they download/build the database into the configured cache. Fetching requires writable cache storage, sufficient disk space, and internet access from the compute jobs. Reusing references avoids repeated downloads across analyses.

Database choices often dominate disk and RAM needs. Start with an appropriate database for the analytical question, check available resources, and consult [Execution](#nf-moshpit-execution) for resource overrides.

**Next:** [Choose a runtime and launch the run](#nf-moshpit-execution).
