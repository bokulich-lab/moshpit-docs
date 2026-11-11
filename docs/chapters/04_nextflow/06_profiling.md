(nf-moshpit-profiling)=
# Taxonomic and functional profiling

Choose profiling methods independently of MAG reconstruction. Kraken 2 and Kaiju classify sequences; Bracken estimates abundances from Kraken 2 read reports; eggNOG annotates assembled sequences; HUMAnN 3 profiles reads directly. Every enabled method needs its [reference databases](#nf-moshpit-databases).

The snippets update your existing parameter file. Retain the settings for any upstream stages you need.

## Kraken 2 and Bracken

For read-based taxonomy:

```yaml
taxonomic_classification:
  enabledFor: "reads"
  fetchArtifact: true
  kraken2:
    memoryMapping: false
    additionalFlags: ""
    fetchArtifact: false
  bracken:
    enabled: true
    readLength: 150
    level: "S"
    threshold: 0
    fetchArtifact: false
  kaiju:
    enabledFor: ""
```

`enabledFor` accepts `reads`, `contigs`, `mags`, and `derep`, as a comma-separated string. Assembly must be enabled for contigs, binning for MAGs, and dereplication for `derep`.

Bracken runs on the **read** classification branch. Select `readLength` and a compatible Bracken database for your reads; `level: "S"` estimates species-level abundance. The code default for `readLength` is `100`, so change it deliberately rather than treating the example's `150` as universal.

Keep Kraken 2 and Bracken database cache/key settings populated even when disabling Bracken: the current database-fetch process declares both output keys. For this revision, prepare the Kraken 2 cache entry before launching classification, because the main workflow reads its size for memory allocation before the fetch task completes. See [Databases](#nf-moshpit-databases).

`taxonomic_classification.fetchArtifact` exports final taxonomy/table outputs where produced. The nested Kraken 2 and Bracken flags export their raw reports/hits. These are separate choices.

## Kaiju

Kaiju can classify reads and contigs. It has its own target list and can run alongside Kraken 2:

```yaml
taxonomic_classification:
  enabledFor: ""
  kaiju:
    enabledFor: "reads"
    a: "greedy"
    evalue: 0.00001
    m: 11
    r: "species"
    c: 0.0
    u: true
    additionalFlags: ""
```

Use `"reads,contigs"` to include contigs when assembly is enabled. `a` selects the search mode, `evalue` and `m` affect matching, and `r` selects the reporting rank. Check the installed Kaiju action help before changing the other settings.

Set `databases.kaiju.cache`, `key`, and `databaseType`; all three are required. Set `taxonomic_classification.kaiju.enabledFor: ""` to disable Kaiju explicitly.

## eggNOG annotation of assembled sequences

eggNOG supports contigs, MAGs, and dereplicated MAGs:

```yaml
functional_annotation:
  enabledFor: "mags,derep"
  ortholog_search:
    dbInMemory: true
    fetchArtifact: false
  annotation:
    dbInMemory: true
    fetchArtifact: true
    extract:
      types: "caz,cog"
      max_evalue: 0.00001
      min_score: 0
      fetchArtifact: true
  cleanUp: false
  partitionBatchCount: 10
```

This example requires binning and dereplication. Use `"contigs"` for an assembly-only analysis. Both the eggNOG ortholog-search database and annotation database are needed.

`annotation.extract.types` selects the feature types extracted from annotation results. `max_evalue` and `min_score` filter matches. `partitionBatchCount` controls partitioning for dereplicated-MAG annotation. Keeping `cleanUp: false` preserves annotation intermediates for inspection.

In-memory DB loading can require substantial RAM. If database-size detection fails or the allocation is too large, prepopulate the database caches or set the relevant `dbInMemory` flags to `false`. See [Execution](#nf-moshpit-execution) for process resource overrides.

When abundance is also estimated for the corresponding contig or dereplicated-MAG target, the workflow combines annotation and abundance tables. Annotations alone do not measure abundance; the presence/absence table from dereplication also has a different meaning.

## HUMAnN 3 profiling of reads

HUMAnN 3 works on processed reads and does not require assembly:

```yaml
humann3:
  enabled: true
  fetchArtifact: true
  memory_use: "minimum"
  prescreen_threshold: 0.01
  pathways: "metacyc"
  conversion:
    destratify: false
    metaphlan_level: 7
    additionalFlags: ""
```

Configure **ChocoPhlAn, translated-search, and MetaPhlAn** databases. Container runs can use `containerHumann3`; the image must also provide the `sapienns` conversion actions invoked by the workflow. Results include gene families, pathway abundance, reactions, and MetaPhlAn profiles, plus converted QIIME 2 tables/taxonomy where applicable.

`memory_use` accepts `minimum` or `maximum`; `pathways` selects the pathway system. `conversion.destratify` controls whether gene-family contributions are combined across taxa. Other nucleotide/translated-search thresholds are listed in the workflow template.

The validator currently requires `containerHumann3` or `container` when HUMAnN 3 is enabled, even for conda execution. A supplied image path alone does not make conda tasks run in containers; use the selected runtime consistently and check plugin availability.

For scientific interpretation and individual actions, see [early taxonomic composition](#early-taxonomy) and [functional profiling](#functional-profiling).

**Next:** [Prepare databases](#nf-moshpit-databases) and [inspect outputs](#nf-moshpit-results).
