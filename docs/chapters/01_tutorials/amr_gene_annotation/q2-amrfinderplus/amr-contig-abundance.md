---
authors:
- pmc
---
# Contig-based AMR abundance estimation

In this section we focus on estimating **per-sample abundances of AMR features** detected in assembled contigs. We will :
- derive contig abundances from read-to-contig mappings
- annotate contigs with AMRFinderPlus
- combine both into a single AMR abundance table.

```{attention}
This workflow assumes contigs have already been assembled and reads have been mapped to those contigs in a previous step.
```

## Fetch database
First, fetch the AMRFinderPlus database. This downloads the newest available version:

```{code} bash
qiime amrfinderplus fetch-amrfinderplus-db \
  --o-amrfinderplus-db amrfinderplus-db.qza \
  --verbose
```
## Predict genes
To annotate assembled sequences with AMR genes, we recommend performing **gene prediction** so AMRFinderPlus can use protein evidence (more sensitive than translated DNA alone). 
Use the `predict-genes-prodigal` action from the `q2-annotate` plugin:

```{code} bash
mosh annotate predict-genes-prodigal \
  --i-sequences contigs.qza \
  --o-loci loci_contigs.qza \
  --o-genes genes_contigs.qza \
  --o-proteins proteins_contigs.qza \
  --verbose
```

## Estimate contig lengths
Compute contig lengths required for normalization:

```{code} bash
mosh annotate get-feature-lengths \
  --i-features contigs.qza \
  --o-lengths contigs_lengths.qza \
  --verbose
```

## Estimate contig abundances
Estimate contig abundances per sample from [read-to-contig alignment maps](read-mapping), normalized by contig length:

```{code} bash
mosh annotate estimate-abundance \
  --i-alignment-maps reads_to_contigs.qza \
  --i-feature-lengths contigs_lengths.qza \
  --o-abundances contig_abundances.qza \
  --verbose
```

```{tip} Outputs
A `FeatureTable[Frequency]` with samples as rows and contigs as features.
```

## Annotate contigs
Use the fetched database and predicted proteins/loci to annotate contigs with AMRFinderPlus. Supplying sequences **plus** predicted proteins **plus** loci uses the most sensitive combined mode:

```{code} bash
qiime amrfinderplus annotate \
  --i-amrfinderplus-db amrfinderplus-db.qza \
  --i-sequences contigs.qza \
  --i-proteins proteins_contigs.qza \
  --i-loci loci_contigs.qza \
  --o-amr-annotations amrfinderplus_annotations.qza \
  --o-amr-all-mutations amrfinderplus_all_mutations.qza \
  --o-amr-genes amrfinderplus_genes.qza \
  --o-amr-proteins amrfinderplus_proteins.qza \
  --verbose
```

```{tip} Outputs
A tabular AMR annotation file and FASTA files for detected AMR genes/proteins. “All mutations” lists genotypes at screened mutation sites when an organism is specified (otherwise empty).
```

## Build the AMR feature table
Convert the AMR annotations into a feature table indexed by contig:

```{code} bash
qiime amrfinderplus create-feature-table \
  --i-annotations amrfinderplus_annotations.qza \
  --o-table amrfinderplus_annotations_ft.qza \
  --verbose
```
## Filter contig abundances to AMR-linked contigs
The contig abundance table contains all contigs, but we are only interested in those carrying AMR annotations. 
You can use the `filter-features` action to filter the contig abundance table to only include contigs with AMR annotations:

```{code} bash
mosh feature-table filter-features \
  --i-table contig_abundances.qza \
  --m-metadata-file amrfinderplus_annotations_ft.qza \
  --o-filtered-table contig_abundances_filt.qza \
  --verbose
```

## Compute AMR abundance (per sample)
To compute AMR abundance, we need to multiply the filtered contig abundances by the AMR feature table using the `multiply-tables` action. 
This will result in a `FeatureTable[Frequency]` where rows are samples, columns are AMR features, and values are abundances:

```{code} bash
mosh annotate multiply-tables \
  --i-table1 contig_abundances_filt.qza \
  --i-table2 amrfinderplus_annotations_ft.qza \
  --o-result-table amr_contigs_amr_abundance_ft.qza \
  --verbose
```

```{tip} Outputs
A `FeatureTable[Frequency]` where rows are AMR features, columns are samples, and values are abundances.
```

## Tabulate annotations and results
With the `tabulate` and `summarize` visualizers from the q2-metadata and q2-feature-table plugin, respectively, 
it is possible to generate a tabular view of the AMR annotations and their abundances:

```{code} bash
qiime metadata tabulate \
  --m-input-file amrfinderplus_annotations.qza \
  --o-visualization amrfinderplus_annotations_tabulated.qzv
```

```{code} bash
mosh feature-table summarize \
  --i-table amr_contigs_amr_abundance_ft.qza \
  --o-visualization amr_contigs_amr_abundance_summary.qzv \
  --verbose
```

```{tip} Tips
- **No AMR hits?** Ensure the AMRFinderPlus database artifact is current and that predicted proteins were provided.
- **Empty after filtering?** Verify contig IDs match between abundance and annotation artifacts.
- **Performance.** Adjust `--p-threads` / parallelism to your environment; consider batching for large assemblies.
```

## References

- Feldgarden M, *et al.* (2021) Validating the AMRFinderPlus tool and resistance gene database. *Sci Rep* 11:14207. https://doi.org/10.1038/s41598-021-91456-0
- AMRFinderPlus documentation & wiki: https://github.com/ncbi/amr/wiki
- NCBI AMRFinderPlus overview: https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/
