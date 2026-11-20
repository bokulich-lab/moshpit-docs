(nf-moshpit-troubleshooting)=
# Troubleshooting

First distinguish **parameter validation** failures from **task execution** failures. Validation messages name settings to fix before tasks start. Task failures give a process name and work directory: inspect `.command.err`, `.command.out`, and `.command.sh` there, along with the launch directory's `.nextflow.log`.

After correcting an execution issue, follow [the resumption instructions](#nf-moshpit-results). Use a new run/output directory when changing the analysis itself.

## Common problems

| Symptom | Check and correction |
| --- | --- |
| No valid input method | Set exactly one method from [Inputs](#nf-moshpit-inputs). Check path spelling, file existence, and `read_simulation.samples`. |
| Missing container/environment | Set `condaEnv` or a suitable image and select the corresponding runtime profile. Optional steps can have extra validation requirements. |
| A database is required unexpectedly | Check both Kraken 2 and Kaiju target lists, plus inherited defaults. Start from the [read-QC starter](#nf-moshpit-quick-start) to disable all database-dependent stages. |
| Binning or dereplication validation fails | Enable assembly before binning, binning before dereplication, and select at least one enabled binner with a matching `primary`. |
| Contig/MAG/derep target has no upstream data | Enable assembly/binning/dereplication as needed, or remove that target from the stage's `enabledFor`. |
| File exists on host but not in Singularity | Check explicit binds. Automatic mounting is disabled; bind input/cache/database/work locations required by tasks. |
| Singularity home or permission error | Set `NXF_SINGULARITY_HOME_MOUNT=true`, create `$HOME/q2_home`, and check filesystem/group permissions. |
| Download fails | Check compute-node internet access, `internetModule` if used, destination availability, and cache write permissions. |
| Database-size lookup fails before fetching | Prepopulate Kraken 2; prepopulate eggNOG or disable its `dbInMemory` options. See [Databases](#nf-moshpit-databases). |
| Unknown `qiime` action or missing `multiqc` | Check the exact runtime environment/image, plugin versions, and MultiQC installation. Host software is not automatically available in containers. |
| Slurm out-of-memory or timeout | Inspect the trace/task logs, then adjust the affected process in a config passed with `-c`. A profile multiplier does not affect every explicit resource setting. |
| Samples disappear | Inspect fastp, filtering, SRA failed-run outputs, and sample/read counts. Empty samples can be ignored while others continue. |
| No expected `.qza` files | Inspect the main/per-sample caches and enable the relevant `fetchArtifact` flag. Completion markers under `keys/` are not artifacts. |
| Resume cannot find a sample cache | Restore archived caches and retain the original work, launch, and output locations. |
| Parameter changes appear to have no effect | Check parameter spelling and duplicate YAML keys; use a new run ID/output/work directory to avoid stored markers reusing older results. |

## Input format problems

Use the [input examples](#nf-moshpit-inputs) to check the delimiter and column names. FASTQ manifests and MASON sample sheets use CSV. Cached-read metadata and SRA accession lists use TSV with an `id` column.

(nf-moshpit-cache-input-issue)=
## Existing-cache input creates no partitions

Run `qiime tools cache-status --cache /path/to/reads-cache` on the directory configured as `inputReadsCache`. Set `inputReads` to the key listed for the demultiplexed reads and check that the metadata IDs match the artifact's sample IDs.

## Report a reproducible issue

Use the [nf-moshpit issue tracker](https://github.com/bokulich-lab/nf-moshpit/issues). Include the workflow commit, Nextflow version, MOSHPIT version, executor/runtime profiles, failing process, relevant parameter sections, and task error output. Remove credentials and private sample information before sharing logs.
