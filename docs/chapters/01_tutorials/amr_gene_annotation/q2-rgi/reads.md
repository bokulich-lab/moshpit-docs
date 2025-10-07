---
authors:
- vr
---
# Read mapping

In this section we will focus on mapping metagenomic reads to AMR genes using q2-rgi.

## Fetch databases

To annotate sequences with q2-rgi, we first have to download the CARD databases
with the `fetch-card-db` action. The action downloads and preprocesses the latest 
versions of the CARD, 
WildCARD, and kmer databases, where CARD contains curated antibiotic resistance genes,
WildCARD includes predicted resistance genes from environmental genomes, and the 
k-mer databases provide precomputed unique k-mers for pathogen of origin predictions. 
The CARD and WildCARD databases are combined into a single 
artifact, while the K-mer databases are stored in separate artifacts. The CARD and 
WildCARD databases are used to annotate sequences with ARGs, while the k-mer 
database is used to predict the taxonomic origin of ARGs.

```{code} bash
qiime rgi fetch-card-database \
  --o-card-db card_db.qza \
  --o-61-mer-db 61mer_db.qza \
  --o-15-mer-db 15mer_db.qza \
  --verbose
```

## Analyze reads 

To annotate reads with ARGs from CARD we can use the `annotate-reads-card` 
action. You can choose from three different alignment tools. The 
default and recommended aligner is 
[KMA](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-018-2336-6) 
but [Bowtie2](https://bowtie-bio.sourceforge.net/bowtie2/index.shtml) 
and [BWA](https://bio-bwa.sourceforge.net/) are also supported. 
Per default the action maps reads to the ARG sequences on CARD, but they can be 
additionally mapped to the WildCARD database and/or to three further detection models 
in CARD. Please refer to the 
[RGI](https://github.com/arpcard/rgi/blob/master/docs/rgi_bwt.rst) documentation for 
more information on WildCARD, the detection models and RGI. The outputs provide 
annotations for the allele mapping and also summarized at the AMR gene level (i.e. 
summing allele level results by gene). Also provided are feature tables for allele and 
gene mapping.

For this tutorial we will map reads to CARD and without the WildCARD and the three 
further detection models. The data used here is the same as in the end to end short 
tutorial. 

`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up the assembly by taking advantage of parsl parallelization support. The config for local execution could 
look like this:

```{code} bash
:filename: parallel.config.toml
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"

[parsl.executors.provider]
class = "LocalProvider"
max_blocks = 2
```
You can then run the action in the following way:
```{code} bash
qiime rgi annotate-reads-card \
    --i-reads reads.qza \
    --i-card-db card_db.qza \
    --p-aligner kma \
    --p-threads 2 \
    --o-amr-allele-annotation amr_allele_annotations.qza \
    --o-amr-gene-annotation amr_gene_annotations.qza \
    --o-allele-feature-table amr_allele_feature_table.qza \
    --o-gene-feature-table amr_gene_feature_table.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parsl parallelization
```{code} bash
qiime rgi annotate-reads-card \
  --i-reads reads.qza \
  --i-card-db card_db.qza \
  --p-aligner kma \
  --p-threads 2 \
  --o-amr-allele-annotation amr_allele_annotations.qza \
  --o-amr-gene-annotation amr_gene_annotations.qza \
  --o-allele-feature-table amr_allele_feature_table.qza \
  --o-gene-feature-table amr_gene_feature_table.qza \
  --verbose
```
````
`````
## Tabulate annotations

With the `tabulate` visualizer of the q2-metadata plugin it is possible to generate a 
tabular combined view of the AMR annotations. The output visualization supports 
interactive 
filtering, sorting, and exporting to common file formats. All AMR annotations from 
q2-amrfinderplus and q2-rgi are supported to be used with the tabulate action. 

```{code} bash
qiime metadata tabulate \
  --m-input-file amr_gene_annotations_reads.qza \
  --o-visualization amr_gene_annotations_reads_tabulated.qzv
```

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/amr_annotation/amr_gene_annotations_reads_tabulated.qzv).


The annotations include information like the gene names their gene family, drug 
class and resistance mechanism. If you want to know more about a specific gene you 
can look up the gene in the [CARD](https://card.mcmaster.ca/).

## Normalize feature table

To look at the distribution of ARGs across samples we can use the feature tables 
created by the `annotate-reads-card` action. They contain the counts 
of reads mapped to a specific allele or gene in each sample. These are the 
raw counts and have to be normalized before further analysis. Here, we will use the 
normalize function of the `q2-feature-table` plugin with the method counts per 
million. This removes library size biases and makes cross sample comparisons 
possible. It is not possible to compare the abundance of different genes within a 
sample because of different gene lengths. The normalisation for gene length is not 
yet implemented.

```{code} bash
feature-table normalize \
    --p-method cpm \
    --i-table gene_feature_table.qza \
    --o-normalized-table gene_feature_table_cpm.qza
```