---
authors:
- mz
---
# Quality filtering
To perform the quality control we will use [fastp](https://doi.org/10.1093/bioinformatics/bty560) wrapped into a q2-fastp plugin. Below you will see two scenarios: how to run the analysis without performing any filtering to only generate a quality report and how to do both at the same time.

## Quality overview
We can get an overview of the read quality by using the `process-seqs` action from the `fastp` QIIME 2 plugin. This command 
will run [fastp](https://doi.org/10.1093/bioinformatics/bty560) without performing any trimming/filtering. To generate a report visualization we will then run the `visualize` command.
```{code} bash
mosh fastp process-seqs \
    --i-sequences cache:reads_paired \
    --p-disable-quality-filtering \
    --p-no-dedup \
    --p-disable-adapter-trimming \
    --p-no-correction \
    --p-thread 4 \
    --o-processed-sequences cache:reads_paired_fastp_not_processed \
    --o-reports cache:fastp_reports_before \
    --verbose
```
To generate a visualization run:
```{code} bash
mosh fastp visualize \
    --i-reports cache:fastp_reports_before \
    --o-visualization reports/fastp-before.qzv \
    --verbose
```

## Read trimming and quality filtering
Alternatively, we remove low quality bases from the reads and generate a report at the same time. To do this we run the same command but without disabling all the QC steps:
```{code} bash
mosh fastp process-seqs \
    --i-sequences cache:reads_paired \
    --p-length-required 90 \
    --p-cut-mean-quality 30 \
    --p-cut-tail \
    --p-thread 4 \
    --o-processed-sequences cache:reads_paired_fastp \
    --o-reports cache:fastp_reports \
    --verbose
```
Finally, we generate the visualization:
```{code} bash
mosh fastp visualize \
    --i-reports cache:fastp_reports \
    --o-visualization results/fastp.qzv \
    --verbose
```
You should see something similar to [this result](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/fastp.qzv).
