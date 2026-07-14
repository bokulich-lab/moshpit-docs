---
authors:
- mz
---
(dereplicate-and-abundance)=
# How to dereplicate MAGs and estimate abundance

::::{tip} Goal
Collapse a multi-sample `SampleData[MAGs]` collection into a single representative set (`FeatureData[MAG]`) using MinHash similarity, then estimate how much of each representative MAG is present across your samples.
::::

::::{note} Prerequisites
A quality-filtered `SampleData[MAGs]` artifact from [binning](bin-mags) and the original reads used to generate those MAGs.
::::

---

## Step 1 — Compute MinHash signatures with [`compute`](#q2-action-sourmash-compute)

Compute a compact MinHash sketch for each MAG in every sample using the [sourmash](#q2-plugin-sourmash) plugin. These sketches are used to estimate pairwise genome similarity without a full alignment:

```{code} bash
mosh sourmash compute \
    --i-sequence-file cache:mags_filtered \
    --p-ksizes 105 \
    --p-scaled 100 \
    --o-min-hash-signature cache:min_hash \
    --verbose
```

The `--p-ksizes` parameter sets the k-mer size used for hashing. Larger values increase specificity; 105 is a good default for species-level dereplication.

---

## Step 2 — Compute pairwise distances with [`compare`](#q2-action-sourmash-compare)

Compare all MinHash signatures to produce a pairwise distance matrix:

```{code} bash
mosh sourmash compare \
    --i-min-hash-signature cache:min_hash \
    --p-ksize 105 \
    --o-compare-output cache:min_hash_compare \
    --verbose
```

---

## Step 3 — Dereplicate MAGs with [`dereplicate-mags`](#q2-action-mag-dereplicate-mags)

Cluster MAGs by similarity and select the best representative from each cluster. Here we use the BUSCO completeness scores to choose the most complete genome in each cluster:

```{code} bash
mosh mag dereplicate-mags \
    --i-mags cache:mags_filtered \
    --i-distance-matrix cache:min_hash_compare \
    --m-metadata-file cache:busco_results \
    --p-metadata-column completeness \
    --p-threshold 0.9 \
    --p-find-max \
    --o-dereplicated-mags cache:mags_derep \
    --o-table cache:mags_sample_table \
    --verbose
```

`--p-threshold 0.9` means MAGs within 90% similarity (i.e., a distance below 0.1) are considered identical. Adjust this based on the desired taxonomic resolution—0.95–0.99 gives strain-level resolution; 0.8–0.9 gives species-level resolution.

The `--o-table` output is a `FeatureTable[PresenceAbsence]` mapping each representative MAG to the samples it was found in.

:::{note}
If you did not run BUSCO, omit `--m-metadata-file` and `--p-metadata-column`. In that case, [`dereplicate-mags`](#q2-action-mag-dereplicate-mags) selects the longest MAG as the representative from each cluster.
:::

After dereplication you can apply a second round of quality filtering on the dereplicated set with [`filter-derep-mags`](#q2-action-mag-filter-derep-mags):

```{code} bash
mosh mag filter-derep-mags \
    --i-mags cache:mags_derep \
    --m-metadata-file cache:busco_results \
    --p-where "completeness>50 AND contamination<10" \
    --o-filtered-mags cache:mags_derep_filtered \
    --verbose
```

---

## Step 4 — Index dereplicated MAGs with [`index-derep-mags`](#q2-action-assembly-index-derep-mags)

Build a Bowtie2 index for the dereplicated MAG set. This is done once and reused for read mapping across all samples:

```{code} bash
mosh assembly index-derep-mags \
    --i-mags cache:mags_derep \
    --p-threads 8 \
    --p-seed 100 \
    --o-index cache:mags_derep_index \
    --verbose
```

---

## Step 5 — Map reads to dereplicated MAGs with [`map-reads`](#q2-action-assembly-map-reads)

Map the original reads to the indexed MAG set to count how many reads align to each genome in each sample:

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh assembly map-reads \
    --i-index cache:mags_derep_index \
    --i-reads cache:reads \
    --p-threads 8 \
    --p-seed 100 \
    --o-alignment-maps cache:reads_to_mags_aln \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh assembly map-reads \
    --i-index cache:mags_derep_index \
    --i-reads cache:reads \
    --p-threads 8 \
    --p-seed 100 \
    --o-alignment-maps cache:reads_to_mags_aln \
    --verbose
```
````
`````

---

## Step 6 — Estimate MAG lengths with [`get-feature-lengths`](#q2-action-mag-get-feature-lengths)

Retrieve the length of each dereplicated MAG, which is required for normalizing read counts:

```{code} bash
mosh mag get-feature-lengths \
    --i-features cache:mags_derep \
    --o-lengths cache:mags_derep_lengths \
    --verbose
```

---

## Step 7 — Estimate abundance with [`estimate-abundance`](#q2-action-mag-estimate-abundance)

Normalize read counts by MAG length and sequencing depth to produce either RPKM or TPM abundance estimates:

```{code} bash
mosh mag estimate-abundance \
    --i-alignment-maps cache:reads_to_mags_aln \
    --i-feature-lengths cache:mags_derep_lengths \
    --p-metric tpm \
    --p-min-mapq 42 \
    --p-threads 4 \
    --o-abundances cache:mags_abundances \
    --verbose
```

`--p-metric tpm` produces TPM (Transcripts Per Million), which is comparable across samples. `rpkm` is also available. `--p-min-mapq 42` restricts counts to uniquely mapped reads.

---

## Step 8 — Visualize taxonomic composition with [`barplot`](#q2-action-taxa-barplot)

If you have classified your MAGs with Kraken 2 (see [Early taxonomic composition](early-taxonomy)), combine the abundance table with taxonomy to visualize community composition:

```{code} bash
mosh taxa barplot \
    --i-table cache:mags_abundances \
    --i-taxonomy cache:mags_taxonomy \
    --o-visualization mags-taxa-barplot.qzv \
    --verbose
```

---

## Further reading

- [End-to-end tutorial — Dereplication](e2e-dereplication) — worked dereplication example with mock-community data
- [End-to-end tutorial — Abundance estimation](mag-abundance) — complete abundance and barplot workflow
- [Cocoa tutorial — MAG recovery](mag-recovery) — dereplication and abundance in a real-world context
- [How to use parsl parallelization](parsl) — configuring parallel [`map-reads`](#q2-action-assembly-map-reads)
