---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.11.5
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---
# Quality filtering
## Quality overview
We can get an overview of the read quality by using the `summarize` action from the `demux` QIIME 2 plugin. This command 
will generate a visualization of the quality scores at each position. You can learn more about this action in the [QIIME 2
documentation](https://docs.qiime2.org/2024.5/plugins/available/demux/summarize/).
```{code-cell}
qiime demux summarize \
  --i-data ./cache:reads \
  --o-visualization demux.qzv
```
To see an example of the visualization you can go [here](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/taxa-bar-plots.qzv).

## Read trimming and quality filtering
In order to remove low quality bases from the reads, we can use one of the `trim` actions from the `cutadapt` QIIME 2 plugin.
Here we are using the `trim-paired` action to remove all the reads shorter than 90 bp:
```{code-cell}
qiime cutadapt trim-paired \
  --i-demultiplexed-sequences ./cache:reads \
  --p-minimum-length 90 \
  --o-trimmed-sequences ./cache:reads_trimmed
```
