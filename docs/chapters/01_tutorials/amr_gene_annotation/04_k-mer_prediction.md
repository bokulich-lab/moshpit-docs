---
authors:
- vr
---
# K-mer Prediction of Pathogen-of-Origin for AMR Genes

In this section we will focus on k-mer prediction of pathogen-of-origin for AMR genes 
using RGI.

CARD's WILDCard Data provide a data set of AMR alleles and their distribution among 
pathogens and plasmids. CARD's k-mer classifiers sub-sample these sequences to identify 
k-mers that are uniquely found within AMR alleles of individual pathogen species, 
pathogen genera, pathogen-restricted plasmids, or promiscuous plasmids. CARD's k-mer 
classifiers can then be used to predict pathogen-of-origin for matches found by RGI for 
MAGs or reads.

For this tutorial we will map reads to CARD and additionally to WildCARD with the three 
further detection models included.

To analyse AMR annotations from MAGs we can use the action `kmer-query-mags-card`.

```{code-cell}
qiime amr kmer-query-mags-card \
  --i-amr-annotations ./cache:amr_annotations_rgi_mags.qza \
  --i-card-db ./cache:card_db.qza \
  --i-kmer-db ./cache:kmer_db.qza \
  --o-mags-kmer-analysis ./cache:mags_kmer_analysis.qza
```

To analyse AMR annotations from reads we can use the action `kmer_query_reads_card`.

```{code-cell}
qiime amr kmer-query-reads-card \
  --i-amr-annotations ./cache:amr_allele_annotations_reads.qza \
  --i-card-db ./cache:card_db.qza \
  --i-kmer-db ./cache:kmer_db.qza \
  --o-reads-allele-kmer-analysis ./cache:reads_allele_kmer_analysis.qza \
  --o-reads-gene-kmer-analysis ./cache:reads_gene_kmer_analysis.qza

```