---
authors:
- vr
---
# AMR gene annotation of reads

In this section we will focus on AMR gene annotation of reads using q2-rgi.

To annotate reads with AMR genes from CARD we can use the `annotate-reads-card` 
action. We 
can choose from three different alignment tools that should be used. The default and 
recommended aligner is 
[KMA](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-018-2336-6). 
Per default the action maps reads to the ARG sequences on CARD, but they can be 
additionally mapped to the WildCARD database and/or to three further detection models 
in CARD. Please refer to the 
[RGI](https://github.com/arpcard/rgi/blob/master/docs/rgi_bwt.rst) documentation for 
more information on WildCARD, the detection models and RGI. The outputs provide 
annotations for the allele 
mapping and also summarized at the AMR gene level (i.e. summing allele level results by 
gene). Also provided are feature tables for allele and gene mapping.

For this tutorial we will map reads to CARD and without the WildCARD and the three 
further detection models.

```{code-cell}
qiime rgi annotate-reads-card \
  --i-reads reads.qza \
  --i-card-db card_db.qza \
  --p-aligner kma \
  --p-threads 2 \
  --o-amr-allele-annotation amr_allele_annotations_reads.qza \
  --o-amr-gene-annotation amr_gene_annotations_reads.qza \
  --o-allele-feature-table amr_allele_feature_table_reads.qza \
  --o-gene-feature-table amr_gene_feature_table_reads.qza \
  --verbose
```

With the `tabulate` visualizer of the q2-metadata plugin it is possible to generate a 
tabular combined view of the AMR annotations. The output visualization supports 
interactive 
filtering, sorting, and exporting to common file formats. All AMR annotations from 
q2-amrfinderplus and q2-rgi are supported to be used with the tabulate action. 

```{code-cell}
qiime metadata tabulate \
  --m-input-file amr_gene_annotations_reads.qza \
  --o-visualization amr_gene_annotations_reads_tabulated.qzv
```

To view the tabulated annotations in a browser run: 

```{code-cell}
qiime tools view amr_gene_annotations_reads_tabulated.qzv
```

The annotations include information like the gene names their gene family, drug 
class and resistance mechanism. If you want to know more about a specific gene you 
can look up the gene in the [CARD](https://card.mcmaster.ca/).

To look at the distribution of ARGs across samples we can use the feature tables 
created by the `annotate-reads-card` action. They contain the counts 
of reads mapped to a specific allele or gene in each sample. These are the 
raw counts and have to be normalized before further analysis. Here, we will use the 
normalize function of the `q2-feature-table` plugin with the method counts per 
million. This removes library size biases and makes cross sample comparisons 
possible. It is not possible to compare the abundance of different genes within a 
sample because of different gene lengths. The normalisation for gene length is not 
yet implemented.

```{code-cell}
feature-table normalize \
    --p-method cpm \
    --i-table gene_feature_table.qza \
    --o-normalized-table gene_feature_table_cpm.qza
```