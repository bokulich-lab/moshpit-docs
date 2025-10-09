---
authors:
- vr
---
# MAG annotation

In this section we will focus on AMR gene annotation of assembled sequences using 
q2-rgi.

To annotate MAGs with ARGs from CARD we can use the `annotate-mags-card` action. We can 
choose from two different alignment tools. While 
[DIAMOND](https://doi.org/10.1038/nmeth.3176) is faster, 
[BLAST](https://doi.org/10.1016/S0022-2836(05)80360-2) is more sensitive. By default, 
annotations include perfect matches (100% sequence identity) and strict matches (>95% 
sequence identity). Loose matches (>95% sequence identity) are optional and can be 
added if preferred. Please refer to the 
[RGI documentation](https://github.com/arpcard/rgi/blob/master/docs/rgi_main.rst) for 
more information about RGI and the perfect/strict/loose matches. The outputs include 
the annotations in form of TXT files and as a feature table.

```{code} bash
qiime rgi annotate-mags-card \
    --i-mag mags.qza \
    --i-card-db card_db.qza \
    --p-alignment-tool DIAMOND \
    --o-amr-annotations rgi_annotations_mags.qza \
    --o-feature-table rgi_feature_table_mags.qza \
    --verbose
```

## Tabulate annotations

With the `tabulate` visualizer of the q2-metadata plugin it is possible to generate a 
tabular combined view of the AMR annotations.  

```{code} bash
qiime metadata tabulate \
  --m-input-file rgi_annotations_mags.qza \
  --o-visualization rgi_annotations_mags_tabulated.qzv
```

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/amr_annotation/amr_annotations_tabulated.qzv).
