---
authors:
- pmomocabr
---
# AMR abundance in contigs

In this section we focus on estimating **per-sample abundances of AMR features** detected on assembled contigs. We will (i) derive contig abundances from read→contig mappings, (ii) annotate contigs with AMRFinderPlus, and (iii) combine both into a single AMR abundance table.

> This workflow assumes contigs have already been assembled and reads have been mapped to those contigs in a previous step.

## Fetch database

First fetch the AMRFinderPlus database. This downloads the newest available version.

```{code} bash
qiime amrfinderplus fetch-amrfinderplus-db \
  --o-amrfinderplus-db amrfinderplus-db \
  --verbose
```
## Predict genes

To annotate assembled sequences with AMR genes, we recommend performing **gene prediction** so AMRFinderPlus can use protein evidence (more sensitive than translated DNA alone). Use Prodigal via `q2-annotate`.

```{code} bash
mosh annotate predict-genes-prodigal \
  --i-sequences contigs.qza \
  --o-loci loci_contigs.qza \
  --o-genes genes_contigs.qza \
  --o-proteins proteins_contigs.qza \
  --verbose
```
## Contig length estimation

Compute contig lengths for normalization.

```{code} bash
mosh annotate get-feature-lengths \
  --i-features contigs.qza \
  --o-lengths contigs_lengths.qza \
  --verbose
```

## Contig abundance estimation

Estimate contig abundances per sample from read→contig alignment maps, normalized by contig length.

```{code} bash
mosh annotate estimate-abundance \
  --i-alignment-maps reads_to_contigs.qza \
  --i-feature-lengths contigs_lengths.qza \
  --o-abundances contig_abundances.qza \
  --verbose
```
The output is a `FeatureTable[Frequency]` with samples as rows and contigs as features.

## Annotate contigs

Use the database and predicted proteins/loci to annotate contigs with AMRFinderPlus. Supplying sequences **plus** predicted proteins **plus** loci uses the most sensitive combined mode.

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
**Outputs.** A tabular AMR annotation file and FASTA files for detected AMR genes/proteins. “All mutations” lists genotypes at screened mutation sites when an organism is specified (otherwise empty).

## Build an AMR feature table

Convert the AMR annotations into a feature table keyed by contig.

```{code} bash
qiime amrfinderplus create-feature-table \
  --i-annotations amrfinderplus_annotations.qza \
  --o-table amrfinderplus_annotations_ft.qza \
  --verbose
```
## Filter contig abundances to AMR-linked contigs

Retain only contigs carrying AMR annotations so abundance and annotation refer to the same set of features.

```{code} bash
mosh feature-table filter-features \
  --i-table contig_abundances.qza \
  --m-metadata-file amrfinderplus_annotations_ft.qza \
  --o-filtered-table contig_abundances_filt.qza \
  --verbose
```

## Compute AMR abundance (per sample)

Multiply (per sample) the filtered contig abundances by the AMR feature table to obtain **per-feature AMR abundance**.

```{code} bash
mosh annotate multiply-tables \
  --i-table1 contig_abundances_filt.qza \
  --i-table2 amrfinderplus_annotations_ft.qza \
  --o-result-table amr_contigs_amr_abundance_ft.qza \
  --verbose
```
**Output.** `amr_contigs_amr_abundance_ft.qza`: a `FeatureTable[Frequency]` where rows are AMR features, columns are samples, and values are abundances.

## Tabulate annotations and results

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

Your visualization ... (TBD)

## Tips :bulb:

- **No AMR hits?** Ensure the AMRFinderPlus database artifact is current and that predicted proteins were provided.
- **Empty after filtering?** Verify contig IDs match between abundance and annotation artifacts.
- **Performance.** Adjust `--p-threads` / parallelism to your environment; consider batching for large assemblies.

## References

- Feldgarden M, *et al.* (2021) Validating the AMRFinderPlus tool and resistance gene database. *Sci Rep* 11:14207. https://doi.org/10.1038/s41598-021-91456-0
- AMRFinderPlus documentation & wiki: https://github.com/ncbi/amr/wiki
- NCBI AMRFinderPlus overview: https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/
