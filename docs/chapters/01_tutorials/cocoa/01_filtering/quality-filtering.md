---
authors:
- mz
---
# Quality filtering
## Quality overview
We can get an overview of the read quality by using the `summarize` action from the `demux` QIIME 2 plugin. This command 
will generate a visualization of the quality scores at each position. You can learn more about this action in the [QIIME 2
documentation](https://amplicon-docs.qiime2.org/en/stable/references/plugins/demux.html#q2-action-demux-summarize).
```{code} bash
mosh demux summarize \
    --i-data cache:reads_paired \
    --o-visualization demux.qzv
```
To see an example of the visualization you can go [here](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/demux-summarize.qzv).


## Option 1: Quality control with fastp.
The MOSHPIT plugin for `fastp` (https://doi.org/10.1093/bioinformatics/bty560) provides a variety of quality control operations in a single pass (*e.g.* quality filtering, adapter trimming, per-read quality pruning, and other operations). We'll use all of the default settings for these operations, while adding the options `--p-max-len1` & `--p-mac-len2` to truncate the the forward and reverse reads to 90 bases, respectively. This is similar to the cutadapt `--p-minumim-length` example shown under Option 2 below.
```
mosh fastp process-seqs \
    --i-sequences cache:reads_paired \
    --p-max-len1 90 \
    --p-max-len2 90 \
    --p-threads 8 \
    --o-processed-sequences cache:reads_trimmed \
    --o-reports cache:fastp_reports
```

If you'd like to viualize the reports:
```
mosh fastp visulaize \
    --i-reports cache:fastp_reports \
    --o-visualization fastp_reports_vis.qzv
```


## Option 2: Read trimming and quality filtering
In order to remove low quality bases from the reads, we can use one of the `trim` actions from the `cutadapt` QIIME 2 plugin.
Here we are using the `trim-paired` action to remove all the reads shorter than 90 bp:
```{code} bash
mosh cutadapt trim-paired \
    --i-demultiplexed-sequences cache:reads_paired \
    --p-minimum-length 90 \
    --o-trimmed-sequences cache:reads_trimmed
```
