---
authors:
- vr
---
# Tabulate visualizer for all AMR annotations

With the `tabulate` visualizer of the q2-metadata plugin it is possible to generate a 
tabular view of the AMR annotations. The output visualization supports interactive 
filtering, sorting, and exporting to common file formats. All AMR annotations from 
q2-amrfindeprlus and q2-rgi are supported to be used with tabulate. q2-metadata is part 
of the MOSHPIT and pathogenome distribution.

```{code-cell}
qiime metadata tabulate \
  --m-input-file ./cache:amr_annotations_amrfinder.qza \
  --o-visualization amr_annotations_amrfinder_tabulated.qzv
```