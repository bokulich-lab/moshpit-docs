(nf-moshpit-configuration)=
# Choose and configure an analysis

Keep the settings for your analysis in a YAML parameter file and pass it with `-params-file`. Use the [read-QC starter](#nf-moshpit-quick-start) for a first run. For a larger analysis, consult `params.template.yml` in [the workflow repository](https://github.com/bokulich-lab/nf-moshpit/blob/main/params.template.yml) and edit the sections you need.

## Separate analysis settings from execution settings

| Setting | Where to put it | Example |
| --- | --- | --- |
| Data, output paths, module switches, and analysis parameters | `params.yml` | `genome_assembly.assembler: megahit` |
| Runtime and executor | Nextflow `-profile` option | `-profile slurm,singularity` |
| Nextflow work directory and resumption | Nextflow command line | `-work-dir /scratch/study-work -resume` |
| Site-specific scheduler and process resource settings | A Nextflow config supplied with `-c` | `process.queue = 'batch'` |

The configuration snippets in the following guides are **edits to sections of your parameter file**, not complete standalone parameter files. Merge them into the existing sections; avoid repeating a top-level key such as `binning` or `taxonomic_classification`, because YAML readers can silently discard the earlier entry.

## Set the common parameters

| Parameter | What to set |
| --- | --- |
| `runId` | A unique identifier, e.g. `CocoaPilot`. It prefixes result names. Avoid underscores, whitespace, and shell punctuation. |
| `outputDir` | An absolute path to writable, sufficiently large output storage. Use a separate directory for each new analysis. |
| `condaEnv` or `container` | The environment path or container image for the selected runtime. See [Execution](#nf-moshpit-execution). |
| Input settings | Exactly one [input method](#nf-moshpit-inputs). |
| `email` | Required for SRA retrieval through q2-fondue. |
| `archive` | Keep `false` while developing a run. Archiving removes original per-sample caches after verified ZIP creation. |

The code can use plugin-specific containers too. A single complete MOSHPIT environment/image is the easiest starting point; confirm that it includes every selected plugin and MultiQC.

## Turn stages on or off

Stages use either an `enabled` boolean or an `enabledFor` string. An empty string disables all targets for that stage:

```yaml
genome_assembly:
  enabled: true
taxonomic_classification:
  enabledFor: "reads,contigs"
  kaiju:
    enabledFor: ""
```

Kraken 2 and Kaiju have separate switches. Disabling `taxonomic_classification.enabledFor` does **not** disable Kaiju. Likewise, turning off assembly does not automatically turn off binning, dereplication, or downstream targets; change those settings together.

| Stage | Switch or targets | Needs |
| --- | --- | --- |
| fastp read QC | Always runs | Reads and q2-fastp |
| Subsampling, host removal, sample filtering | Respective `enabled` flag | Host removal also needs a host reference |
| Assembly | `genome_assembly.enabled` | Processed reads |
| Binning | `binning.enabled` | Assembly and at least one enabled binner |
| Dereplication | `dereplication.enabled` | Binning |
| Abundance | `abundance_estimation.enabledFor`: `contigs,derep` | Assembly for contigs; dereplication for derep MAGs |
| Kraken 2 taxonomy | `taxonomic_classification.enabledFor`: `reads,contigs,mags,derep` | Corresponding sequences and Kraken 2 DB |
| Kaiju taxonomy | `taxonomic_classification.kaiju.enabledFor`: `reads,contigs` | Corresponding sequences and Kaiju DB |
| eggNOG functions | `functional_annotation.enabledFor`: `contigs,mags,derep` | Corresponding sequences and both eggNOG DBs |
| HUMAnN 3 functions | `humann3.enabled` | Processed reads, three databases, HUMAnN/conversion plugins |

## Choose a starting plan

| Goal | Add to the read-QC starter | Guide |
| --- | --- | --- |
| Read taxonomy | Kraken 2 `reads` and optional Bracken, or Kaiju `reads` | [Profiling](#nf-moshpit-profiling) |
| Read functional profiles | HUMAnN 3 | [Profiling](#nf-moshpit-profiling) |
| Contigs and their abundance | Assembly and abundance target `contigs` | [Assembly and MAGs](#nf-moshpit-assembly-mags) |
| Reconstruct MAGs | Assembly, binning, and optional BUSCO/CheckM QC | [Assembly and MAGs](#nf-moshpit-assembly-mags) |
| Compare MAGs across samples | Above, plus dereplication and abundance target `derep` | [Assembly and MAGs](#nf-moshpit-assembly-mags) |
| Annotate reconstructed sequences | Add taxonomy or eggNOG on the desired targets | [Profiling](#nf-moshpit-profiling) |

For every enabled stage, provide its [database settings](#nf-moshpit-databases) and runtime plugins. Then run the workflow: it validates parameters before scheduling tasks. Validation catches many missing settings, but does not guarantee that files, cache entries, or runtime plugins are valid.

**Next:** configure [read processing](#nf-moshpit-read-processing), [assembly and MAGs](#nf-moshpit-assembly-mags), or [profiling](#nf-moshpit-profiling).
