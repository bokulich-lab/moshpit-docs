---
authors:
- pmc
- vr
---
# Contig-based AMR abundance estimation

In this section we focus on estimating **per-sample abundances of AMR features** 
detected in assembled contigs. For this, we will estimate contig abundances from 
read mappings, normalize them by contig length and link them to AMR annotations to 
obtain an abundance table of AMR features across samples. This section uses plugins 
included in the MOSHPIT distribution of QIIME 2. You can find detailed installation 
instructions on the [QIIME 2 Library](https://library.qiime2.org/quickstart/moshpit#id-3-install-the-base-distributions-conda-environment).

```{note}
Code blocks starting with `qiime` have to be run with the pathogenome distribution 
and code blocks starting with `mosh` have to be run with the MOSHPIT distribution.
```

## Get contig lengths

Before we can estimate contig abundances, we first need to determine the length of each 
contig in the assembly. These lengths are used later to normalize the abundances.

```{code} bash
mosh annotate get-feature-lengths \
    --i-features contigs.qza \
    --o-lengths contigs_lengths.qza \
    --verbose
```

## Estimate contig abundances

Next, we estimate how abundant each contig is in every sample. To do this, we map reads 
back to the contigs and normalize the counts by contig length.
This produces a per-sample abundance table with samples as rows and contigs as columns.

```{code} bash
mosh annotate estimate-abundance \
    --i-alignment-maps reads-to-contigs-aln.qza \
    --i-feature-lengths contigs_lengths.qza \
    --o-abundances contig_abundances.qza \
    --verbose
```

## Build AMR feature table

Now we convert the AMRFinderPlus annotation results into a feature table, that is 
indexed by contig IDs.

```{code} bash
qiime amrfinderplus create-feature-table \
    --i-annotations amrfinderplus_annotations.qza \
    --o-table amrfinderplus_annotations_ft.qza \
    --verbose
```

## Filter contig abundances by AMR annotations

At this point, the contig abundance table contains all contigs, but we are only 
interested in those carrying AMR annotations. Because of this we have to filter the 
contig abundance table to only retain contigs with AMR annotations.

```{code} bash
qiime feature-table filter-features \
    --i-table contig_abundances.qza \
    --m-metadata-file amrfinderplus_annotations_ft.qza \
    --o-filtered-table contig_abundances_filtered.qza \
    --verbose
```

## Compute per sample AMR abundances
Now that we have contig abundances and AMR annotations, we combine both to estimate the 
abundance of each AMR feature per sample. By multiplying the filtered contig 
abundance table with the AMR feature table, we obtain a new table where rows are 
samples, columns are AMR features, and values are abundances.

```{code} bash
mosh annotate multiply-tables \
    --i-table1 contig_abundances_filtered.qza \
    --i-table2 amrfinderplus_annotations_ft.qza \
    --o-result-table amrfinderplus_abundances_ft.qza \
    --verbose
```

## Create Heatmap
To visualize these results, we can generate a heatmap that displays AMR gene abundances 
across samples. For better visualization, the abundances are log transformed.

```{code} bash
qiime feature-table heatmap \
    --i-table amrfinderplus_abundances_ft.qza \
    --o-visualization amrfinderplus_heatmap.qzv
```

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/amr_annotation/amrfinderplus_heatmap.qzv).

## Summarize abundances
Lastly we can generate a summarization of the AMR gene abundances.

```{code} bash
qiime feature-table summarize \
  --i-table amrfinderplus_abundances_ft.qza \
  --o-visualization amrfinderplus_abundances_summary.qzv
```

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/amr_annotation/amrfinderplus_abundances_summary.qzv).

```{tip} Tips
- **No AMR hits?** Ensure the AMRFinderPlus database artifact is current and that 
predicted proteins were provided.
- **Empty after filtering?** Verify contig IDs match between abundance and annotation artifacts.
- **Performance.** Adjust `--p-threads` to your environment; consider batching for large assemblies.
```

