(nf-moshpit-reference)=
# Parameter and source reference

The task-focused guides explain the settings most users need. For the full option catalogue, use `params.template.yml` **from the workflow revision you run**, and compare it with `conf/defaults.config`. Template values can differ from code defaults; the template also contains placeholders that must be replaced or cleared.

## Find a parameter group

| Parameter group | Guide |
| --- | --- |
| `runId`, paths, runtime, input selection | [Configuration](#nf-moshpit-configuration), [Inputs](#nf-moshpit-inputs) |
| `fondue`, `read_simulation` | [Inputs](#nf-moshpit-inputs) |
| `read_subsampling`, `read_qc`, `host_removal`, `sample_filtering` | [Read processing](#nf-moshpit-read-processing) |
| `genome_assembly`, `assembly_qc`, `binning`, `dereplication`, `abundance_estimation` | [Assembly and MAGs](#nf-moshpit-assembly-mags) |
| `taxonomic_classification`, `functional_annotation`, `humann3` | [Profiling](#nf-moshpit-profiling) |
| `databases` | [Databases](#nf-moshpit-databases) |
| Runtime profiles, `clusterOptions`, plugin containers, resource scaling | [Execution](#nf-moshpit-execution) |
| Output directories, `archive`, `retain`, exports | [Results and resuming](#nf-moshpit-results) |
| `weblog` | Optional Nextflow event forwarding: `enabled`, `url`, and `basicToken`; leave disabled unless using a configured receiver. |

`additionalFlags` settings are appended to QIIME 2 action commands. Consult the installed action's `--help` for supported flags. `clusterOptions` strings configure scheduler submission where applied by the relevant process. Neither is a substitute for selecting an executor/runtime profile.

(nf-moshpit-implementation-notes)=
## Implementation notes for this revision

These are source observations to help reconcile the README, template, and running workflow. They are not results from an end-to-end execution of each route.

| Topic | Current behavior and guidance |
| --- | --- |
| Input priority | Manifest → existing cache plus metadata → SRA → MASON. Clear unused inputs rather than relying on priority. |
| Single-end manifest | The README allows omitting `reverse`, but `IMPORT_READS` has a required `path(reads_rev)` input. A null reverse can fail before its single-end script branch. Verify support for your revision. |
| Existing-cache input | `inputReads` is documented as a key, but `main.nf` uses `Channel.fromPath` on it. See [the cache-input issue](#nf-moshpit-cache-input-issue). |
| MASON delimiter | `main.nf` uses `sep: ','`; supply CSV, despite the TSV wording in the README/template. |
| Sample cutoff | The code reads `sample_filtering.minReads`, default `1000`, and uses strict `>`. The template's `min_reads: 4200000` does not set it. |
| Inherited analysis defaults | Code defaults include assembly, dereplication, abundance targets `contigs,derep`, and Kaiju `reads`, but binning is disabled. Explicitly configure related stages; the untouched defaults are not a valid minimal run. |
| Skani | Settings and a module exist, but the [dereplication subworkflow](https://github.com/bokulich-lab/nf-moshpit/blob/2026.7.0/subworkflows/dereplication.nf) always uses sourmash. |
| Conda and optional steps | Validation requires a fallback/specific container for sourmash or Skani dereplication, CheckM, and HUMAnN 3, even with `condaEnv`. Supplying an image parameter does not enable container execution under the conda profile. |
| Kraken 2/eggNOG fetching | `main.nf` reads Kraken 2 cache size before fetch completion; eggNOG does likewise for in-memory loading. Prepopulate these entries, or disable eggNOG in-memory loading as appropriate. |
| Kraken 2 and Bracken keys | The Kraken 2 fetch process declares both keys, even with Bracken analysis disabled. Provide both settings; ensure the Bracken entry exists if using it. |
| Archive default | Code default is `false`; template value is `true`. Archiving removes original sample caches after verification. |
| Profile combinations | Several resource profiles reset other scaling parameters. Do not assume every combination accumulates multipliers. |
| Resuming changed analyses | `storeDir` markers and cache-key reuse can preserve older results. Use a new run ID/output/work directory for changed inputs or analysis settings. |
| Configurator UI / Dockerfile | The README mentions `ui/index.html` and a Dockerfile, but these files are absent from this source revision. These guides use YAML editing and an independently prepared compatible image. |
