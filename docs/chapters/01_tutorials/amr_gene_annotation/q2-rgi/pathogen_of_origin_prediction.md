---
authors:
- vr
---
# Pathogen-of-origin prediction

In this section we will focus on pathogen-of-origin prediction of AMR genes using 
q2-rgi.

CARD's WildCARD Data provide a data set of AMR alleles and their distribution among 
pathogens and plasmids. CARD's k-mer classifiers sub-sample these sequences to identify 
k-mers that are uniquely found within AMR alleles of individual pathogen species, 
pathogen genera, pathogen-restricted plasmids, or promiscuous plasmids. CARD's k-mer 
classifiers can then be used to predict the pathogen of origin for matches found by RGI 
for MAGs or reads. The k-mer classifiers are available as 
precomputed databases for 
15-mers and 61-mers. Pathogen classification accuracy plateaus at under 80% 
above a k-mer size of 15, while the k-mer size of 15 represents a reliable minimum 
k-mer size. Classification accuracy increases with increasing k-mer size, but so 
does the 
run time and memory usage. For more information please refer to the
[RGI documentation](https://github.com/arpcard/rgi/blob/master/docs/rgi_kmer.rst) 
and the [CARD k-mer paper](https://www.biorxiv.org/content/10.1101/2025.09.15.676352v1). For this 
tutorial we use the 15-mer database because it is faster and requires less memory.

## Metagenomic reads
To analyse AMR annotations from metagenomic reads we can use the action 
`kmer-query-reads-card`.

`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up this action by taking advantage of parsl parallelization support. 
We will use the same config as for analyzing reads with q2-rgi.

```{code} bash
qiime rgi kmer-query-reads-card \
    --i-amr-annotations rgi_allele_annotations_reads.qza \
    --i-card-db card_db.qza \
    --i-kmer-db 15mer_db.qza \
    --o-reads-allele-kmer-analysis reads_allele_kmer_analysis.qza \
    --o-reads-gene-kmer-analysis reads_gene_kmer_analysis.qza \
    --p-threads 2 \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parsl parallelization
```{code} bash
qiime rgi kmer-query-reads-card \
    --i-amr-annotations rgi_allele_annotations_reads.qza \
    --i-card-db card_db.qza \
    --i-kmer-db 15mer_db.qza \
    --o-reads-allele-kmer-analysis reads_allele_kmer_analysis.qza \
    --o-reads-gene-kmer-analysis reads_gene_kmer_analysis.qza \
    --p-threads 2 \
    --verbose
```
````
`````
### Tabulate results

Now we can tabulate the results with the `tabulate` visualizer.

```{code} bash
qiime metadata tabulate \
  --m-input-file reads_gene_kmer_analysis.qza \
  --o-visualization reads_gene_kmer_analysis_tabulated.qzv
```

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/amr_annotation/reads_gene_kmer_analysis_tabulated.qzv).

## MAGs

To analyse AMR annotations from MAGs we can use the action `kmer-query-mags-card`.

`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up this action by taking advantage of parsl parallelization support. 
We will use the same config as for analyzing reads with q2-rgi.

```{code} bash
qiime rgi kmer-query-mags-card \
    --i-amr-annotations rgi_annotations_mags.qza \
    --i-card-db card_db.qza \
    --i-kmer-db 15mer_db.qza \
    --o-mags-kmer-analysis mags_kmer_analysis.qza \
    --p-threads 2 \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parsl parallelization

```{code} bash
qiime rgi kmer-query-mags-card \
    --i-amr-annotations rgi_annotations_mags.qza \
    --i-card-db card_db.qza \
    --i-kmer-db 15mer_db.qza \
    --o-mags-kmer-analysis mags_kmer_analysis.qza \
    --p-threads 2 \
    --verbose
```
````
`````
### Tabulate results

Now we can again tabulate the results with the `tabulate` visualizer.

```{code} bash
qiime metadata tabulate \
  --m-input-file mags_kmer_analysis.qza \
  --o-visualization mags_kmer_analysis_tabulated.qzv
```

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/amr_annotation/mags_kmer_analysis_tabulated.qzv).

## Build a custom k-mer database

While CARD's WildCARD data set provides a precompiled 15-mer and 61-mer database it is 
also 
possible to build custom k-mer databases. This action can be computationally 
expensive and take a long time to complete, depending on the chosen k-mer size. 
Because of this it is not feasible to run this action on a personal computer. To see 
benchmarks released by the developers of RGI please check the 
[CARD k-mer paper](https://www.biorxiv.org/content/10.1101/2025.09.15.676352v1). 
The action `kmer-build-card` can be used to build a custom k-mer database.

```{code} bash
qiime rgi kmer-build-card \
    --i-card-db card_db.qza \
    --p-kmer-size 80 \
    --o-kmer-db 80mer_db.qza \
    --p-threads 40 \
    --verbose
```