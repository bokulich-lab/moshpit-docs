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
Just like any other NGS experiment, shotgun metagenomics data should be quality controlled before any downstream analysis. 
The filtering steps may include adapter removal, quality trimming, and filtering out low-quality reads. Moreover, metagenomic
reads may contain host DNA, which should be removed. QIIME 2 provides functionality to address some of those issues - the 
MOSHPIT plugin suite only expands on those by focusing more on host DNA removal. Below is a brief overview of the filtering steps 
which can be done using QIIME 2 and MOSHPIT.

## Quality overview
We can get an overview of the read quality by using the `summarize` action from the `demux` QIIME 2 plugin. This command 
will generate a visualization of the quality scores at each position. You can learn more about this action in the [QIIME 2
documentation](https://docs.qiime2.org/2024.5/plugins/available/demux/summarize/).
```bash
qiime demux summarize \
  --i-data ./cache:reads \
  --o-visualization demux.qzv
```
To see an example of the visualization you can go [here](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/taxa-bar-plots.qzv).
## Read trimming and quality filtering
In order to remove low quality bases from the reads, we can use one of the `trim` actions from the `cutadapt` QIIME 2 plugin.
Here we are using the `trim-paired` action to remove all the reads shorter than 90 bp:
```bash
qiime cutadapt trim-paired \
  --i-demultiplexed-sequences ./cache:reads \
  --p-minimum-length 90 \
  --o-trimmed-sequences ./cache:reads_trimmed
```
## Removal of contaminating reads
Removal of contaminating reads can generally be done by mapping the reads to a reference database and filtering out the reads
that map to it. In QIIME 2 this can be done by using the `filter-reads` action from the `quality-control` plugin. Before the filtering
we need to construct the index of the reference database which will be used by Bowtie 2:
- start with the FASTA files contaning the reference sequences - we will import them into a QIIME 2 artifact
   ```bash
   qiime tools cache-import \
     --cache ./cache \
     --key reference_seqs \
     --type "FeatureData[Sequence]" \
     --input-path ./reference_seeqs.fasta
   ```
- build the Bowtie 2 index
   ```bash
   qiime quality-control bowtie2-build \
     --i-sequences ./cache:reference_seqs \
     --o-database ./cache:reference_index
   ```
- filter out the reads that map to the reference database
   ```bash
   qiime quality-control filter-reads \
     --i-demultiplexed-sequences ./cache:reads_trimmed \
     --i-database ./cache:reference_index \
     --o-filtered-sequences ./cache:reads_filtered
   ````
### Human host reads
Contaminating human reads can also be filtered out using the approach shown above by providing a human reference genome.
Since a single human reference genome is not enough to cover all the human genetic diversity, it is now recommended to use a
collection of genomes represented by the human pangenome (__CIT). We have built a new QIIME 2 action `filter-reads-pangenome`
which allows to first fetch the human pangenome sequence, combine it with the GRCh38 reference genome, build a combined 
Bowtie 2 index and, finally, filter the reads against it. Next to the filtered reads, the action will also return the generated 
index so that it can be used in any other experiments.
```bash
qiime moshpit filter-reads-pangenome \
  --i-reads ./cache:reads_trimmed \
  --o-filtered-reads ./cache:reads_filtered \
  --o-reference-index ./cache:human_reference_index
```