(nf-moshpit-results)=
# Results, caches, and resuming

Start by opening the QC reports and checking how many samples and reads were retained. Then inspect the artifacts for the analyses you enabled. The workflow stores data in QIIME 2 caches and publishes selected `.qza`/`.qzv` files.

## Where results go

With `outputDir: /scratch/Study1`, the standard layout is:

```text
/scratch/Study1/
├── results/                 Published QZA/QZV files
│   └── multiqc/             MultiQC HTML and report data
├── pipeline_info/           Nextflow reports and sample/read-count summaries
├── caches/
│   ├── main/                Collated artifacts and shared analysis outputs
│   └── Sample1/             Per-sample reads and analysis intermediates
├── keys/                    Marker files used by Nextflow storeDir
├── archives/                Optional per-sample cache ZIP archives
└── container_cache/         Container cache location
```

Nextflow's `-work-dir` is separate. The launch directory also contains `.nextflow.log` and `.nextflow/`, which help diagnose and resume runs.

| Parameter | Standard location | Purpose |
| --- | --- | --- |
| `publishDir` | `outputDir/results` | Exported QZA/QZV files and MultiQC outputs |
| `traceDir` | `outputDir/pipeline_info` | Nextflow reports, timelines, traces, and count summaries |
| `q2cacheDir` | `outputDir/caches/main` | Collated results; not every per-sample intermediate is here |
| `q2TemporaryCachesDir` | `outputDir/caches` | Parent of per-sample caches |
| `storeDir` | `outputDir/keys` | Completion markers; these are not standalone QIIME 2 artifacts |
| `archiveDir` | `outputDir/archives` | Optional archives |
| `tmpDir` | System default unless set | Container temporary-storage setting where supported |

These derived locations are configured in `nextflow.config`. Confirm the resolved paths when overriding `outputDir` or individual directories for a different workflow/Nextflow revision.

## Inspect the reports

| Report | What to check |
| --- | --- |
| `results/<runId>-report.qzv` | Combined visualizations from the enabled branches, including read QC |
| `results/multiqc/multiqc_report.html` | Sample and read retention across processing steps |
| `pipeline_info/*_report.html` | Nextflow execution and resource use |
| `pipeline_info/*_timeline.html` | Task durations and parallel execution |
| `pipeline_info/*_trace.txt` | Task status, runtime, and resource details |
| `pipeline_info/<runId>_sample_report_mqc.json` | Sample-count summaries used by MultiQC |
| `pipeline_info/<runId>_read_counts_mqc.json` | Per-sample counts and retention relative to the input |

View a visualization in an activated MOSHPIT environment:

```bash
qiime tools view /scratch/Study1/results/Study1-report.qzv
```

The read-count report counts FASTQ records across the read files in a cached sample. For paired-end data, that can count both mates; interpret the reported unit accordingly. Samples with empty outputs after QC or sample filtering can be excluded while the run continues. A successful Nextflow status does not by itself confirm that every input sample survived.

## Find and save artifacts

List cache contents:

```bash
qiime tools cache-status --cache /scratch/Study1/caches/main
qiime tools cache-status --cache /scratch/Study1/caches/Sample1
```

Names generally start with `runId` and identify the stage, sample, and sometimes the primary binner or BUSCO lineage. For example, fastp-processed Sample1 reads use the key `Study1_reads_fastp_Sample1` in that sample's cache. The combined contig artifact uses `Study1_contigs` in the main cache.

To save a cached result as a standalone artifact:

```bash
qiime tools cache-fetch \
  --cache /scratch/Study1/caches/main \
  --key Study1_contigs \
  --output-path /scratch/Study1/contigs.qza
```

Alternatively set the relevant `fetchArtifact: true` before running. Assembly, binning, dereplication, abundance, taxonomy, eggNOG, and HUMAnN have separate export switches; there is no single global flag that exports everything. Inspect the [profiling guide](#nf-moshpit-profiling) for the distinction between raw classifier reports and final tables.

## Resume a run

After fixing an error, use the same launch directory, parameter file, profiles, work directory, and output/cache locations, with `-resume`:

```bash
nextflow run bokulich-lab/nf-moshpit \
  -r 2026.7.0 \
  -params-file params.yml \
  -profile slurm,singularity \
  -work-dir /scratch/Study1-work \
  -resume
```

Use the profiles from your original run. Preserve `.nextflow/`, the work directory, stored markers, and the actual QIIME 2 caches. Nextflow can reuse completed tasks only when the required cached state and outputs remain available.

Several tasks use `storeDir` completion markers and cache-key existence checks. When you change analysis parameters or input data, use a **new `runId`, output directory, and work directory** for the new analysis; do not assume that changing a parameter and adding `-resume` will recompute results represented by existing markers.

## Archive and restore sample caches

With `archive: true`, completed per-sample caches are ZIP-compressed into `archiveDir`. The archive is checked before the original sample-cache directory is removed. The main cache remains separate. Archiving can reduce inode use, but needs space while both the archive and original exist.

Restore archives before resuming or inspecting per-sample results:

```bash
bash bin/restore_cache.sh \
  /scratch/Study1/archives \
  /scratch/Study1/caches
```

To restore only selected samples, append their IDs to the command. Then resume with the original launch/work/output settings.

(nf-moshpit-retention)=
## Retention and disk usage

All `retain` flags default to `true`. Setting them to `false` removes selected intermediate keys after their consumers finish:

| Flag set to `false` | Key removed | Cleanup happens after |
| --- | --- | --- |
| `retain.input` | Imported, fetched, or simulated reads | Subsampling if enabled; otherwise fastp |
| `retain.subsampling` | Subsampled reads | fastp, if subsampling is enabled |
| `retain.fastp` | fastp-processed reads | Host removal, or sample filtering if host removal is disabled |
| `retain.host_removal` | Host-filtered reads | Sample filtering, when both stages are enabled |

Cleanup requires the relevant downstream stage to run; disabling a stage can leave its upstream data retained. Removing intermediates limits later inspection and can affect the tasks available for resumption. Keep retention on until the analysis is stable and you have saved what you need.

**Next:** [Troubleshooting](#nf-moshpit-troubleshooting) or the [parameter and source reference](#nf-moshpit-reference).
