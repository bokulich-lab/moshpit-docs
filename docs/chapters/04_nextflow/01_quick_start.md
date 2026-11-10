(nf-moshpit-quick-start)=
# Quick start

This first run imports **paired-end FASTQ files**, processes them with fastp, and produces QC reports. Assembly and database-dependent analyses are disabled so you can check your inputs and runtime first. Use a small representative sample before scaling up.

## 1. Prepare the software

Install Nextflow in a fresh conda environment (for example, `conda create -n nf -c conda-forge nextflow`, then `conda activate nf`), or follow the [official Nextflow installation instructions](https://docs.seqera.io/nextflow/). Also prepare a [MOSHPIT 2026.10 environment](https://library.qiime2.org/quickstart/moshpit). This example uses conda; [Execution](#nf-moshpit-execution) gives Docker, Singularity, and Slurm alternatives.

```bash
nextflow -version
nextflow pull bokulich-lab/nf-moshpit -r 2026.10.0
```

Nextflow stores the workflow in its cache; you do not need to clone the repository. The commands below run this same pinned revision. Record it with your analysis configuration; the [reference](#nf-moshpit-source) explains how it was selected.

## 2. List your reads

Create `manifest.csv` with one row per sample. Replace these example paths with **absolute paths to your own files**; both uncompressed and gzip-compressed FASTQ are possible. Reads must use Phred+33 quality scores.

```csv
id,forward,reverse
Sample1,/absolute/path/Sample1_R1.fastq.gz,/absolute/path/Sample1_R2.fastq.gz
```

Download the [example manifest](../../_static/nf-moshpit/manifest.csv) if useful. This workflow manifest differs from the QIIME 2 import manifest: its column names are exactly `id`, `forward`, and `reverse`.

## 3. Create `params.yml`

Download the [read-QC starter configuration](../../_static/nf-moshpit/params-read-qc.yml), or save the following as `params.yml` in your launch directory (the directory from which you run Nextflow). Replace the three `/absolute/path/…` values.

```yaml
runId: FirstRun
outputDir: /absolute/path/FirstRun
condaEnv: /absolute/path/to/moshpit-environment
container: null
inputReadsManifest: /absolute/path/manifest.csv
inputReads: null
inputReadsCache: null
metadata: null
fondueAccessionIds: null
read_simulation:
  samples: null

archive: false
read_subsampling:
  enabled: false
read_qc:
  fastp:
    disableQualityFiltering: false
    deduplicate: false
    disableAdapterTrimming: true
    enableBaseCorrection: true
    additionalFlags: ""
host_removal:
  enabled: false
sample_filtering:
  enabled: false
genome_assembly:
  enabled: false
assembly_qc:
  enabled: false
  quast:
    enabled: false
    useMappedReads: false
binning:
  enabled: false
dereplication:
  enabled: false
abundance_estimation:
  enabledFor: ""
taxonomic_classification:
  enabledFor: ""
  bracken:
    enabled: false
  kaiju:
    enabledFor: ""
functional_annotation:
  enabledFor: ""
humann3:
  enabled: false
```

This keeps the workflow's fastp defaults, including **adapter trimming disabled**. To enable trimming or change quality filtering, see [Read processing](#nf-moshpit-read-processing).

The repository's `params.template.yml` is a catalogue of options, with placeholder paths and several analyses enabled. Use the starter above for this run; an unchanged copy of the full template is not ready to execute.

## 4. Run

Choose a writable work directory on storage with sufficient space. Keep this directory for resuming the analysis.

```bash
nextflow run bokulich-lab/nf-moshpit \
  -r 2026.10.0 \
  -params-file params.yml \
  -profile standard,conda \
  -work-dir /absolute/path/FirstRun-work
```

Wait for Nextflow to finish successfully. If it stops during parameter validation, use the listed parameter names to correct `params.yml`; if a task fails, see [Troubleshooting](#nf-moshpit-troubleshooting).

## 5. Check the result

With the paths above, look for:

| Result | Location |
| --- | --- |
| Combined QIIME 2 QC report | `/absolute/path/FirstRun/results/FirstRun-report.qzv` |
| MultiQC HTML report | `/absolute/path/FirstRun/results/multiqc/multiqc_report.html` |
| Nextflow report, timeline, and trace; sample/read-count summaries | `/absolute/path/FirstRun/pipeline_info/` |
| Processed reads for Sample1 | Cache `/absolute/path/FirstRun/caches/Sample1`, key `FirstRun_reads_fastp_Sample1` |

Activate MOSHPIT to open the QIIME 2 report:

```bash
qiime tools view /absolute/path/FirstRun/results/FirstRun-report.qzv
```

Inspect read retention and fastp quality metrics before adding analyses. A successful run can still exclude samples whose reads were all removed during QC. [Results and resuming](#nf-moshpit-results) explains how to inspect caches and save artifacts.

**Next:** choose your [analysis steps](#nf-moshpit-configuration). For another source of reads, go to [Inputs](#nf-moshpit-inputs).
