---
authors:
- mz
---
# Quality filtering
## Quality overview
We can get an overview of the read quality by using the `summarize` action from the `demux` QIIME 2 plugin. This command 
will generate a visualization of the quality scores at each position. You can learn more about this action in the [QIIME 2
documentation](https://amplicon-docs.qiime2.org/en/latest/references/plugins/demux.html#q2-action-demux-summarize).
```{code} bash
mosh demux summarize \
    --i-data cache:reads \
    --o-visualization demux.qzv
```
To see an example of the visualization you can go [here](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/demux-summarize.qzv).

## Read trimming and quality filtering
In order to remove low quality bases from the reads, we can use one of the `trim` actions from the `cutadapt` QIIME 2 plugin.
Here we are using the `trim-paired` action to remove all the reads shorter than 90 bp:
```{code} bash
mosh cutadapt trim-paired \
    --i-demultiplexed-sequences ./cache:reads \
    --p-minimum-length 90 \
    --o-trimmed-sequences cache:reads_trimmed
```
