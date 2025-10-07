---
authors:
- vr
---
# MAG annotation

In this section we will focus on AMR gene annotation of assembled sequences using 
q2-rgi.

To annotate MAGs with ARGs from CARD we can use the `annotate-mags-card` action. We can 
choose from two different alignment tools. While 
[DIAMOND](https://www.nature.com/articles/nmeth.3176) is faster, 
[BLAST](https://blast.ncbi.nlm.nih.gov/Blast.cgi) is more sensitive. By default, 
annotations include perfect matches (100% sequence identity) and strict matches (>95% 
sequence identity). loose matches (>95% sequence identity) are optional and can be 
added if preferred. Please run `qiime rgi annotate --help` and refer to the 
[RGI](https://github.com/arpcard/rgi) documentation for more information about the 
parameters. The outputs include the annotations in form of a TXT file and as a feature 
table.

`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up this action by taking advantage of parsl parallelization support. 
We will use the same config as for analyzing reads with q2-rgi.

```{code} bash
qiime rgi annotate-mags-card \
    --i-mags mags.qza \
    --i-card-db card_db.qza \
    --p-alignment-tool DIAMOND \
    --o-amr_annotations amr_annotations_rgi_mags.qza \
    --o-feature_table feature_table_rgi_mags.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parsl parallelization

```{code} bash
qiime rgi annotate-mags-card \
  --i-mags mags.qza \
  --i-card-db card_db.qza \
  --p-alignment-tool DIAMOND \
  --o-amr_annotations amr_annotations_rgi_mags.qza \
  --o-feature_table feature_table_rgi_mags.qza \
  --verbose
```
````
`````
## Tabulate annotations

With the `tabulate` visualizer of the q2-metadata plugin it is possible to generate a 
tabular combined view of the AMR annotations.  

```{code} bash
qiime metadata tabulate \
  --m-input-file amr_annotations_rgi_mags.qza \
  --o-visualization amr_annotations_rgi_mags_tabulated.qzv
```

