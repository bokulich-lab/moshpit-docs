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

## Step 1 — Compute MinHash signatures

Compute a compact MinHash sketch for each MAG in every sample. These sketches are used to estimate pairwise genome similarity without a full alignment:

```{code} bash
mosh sourmash compute \
    --i-sequence-file mags-filtered.qza \
    --p-ksizes 105 \
    --p-scaled 100 \
    --o-min-hash-signature min-hash.qza \
    --verbose
```

The `--p-ksizes` parameter sets the k-mer size used for hashing. Larger values increase specificity; 105 is a good default for species-level dereplication.

---

## Step 2 — Compute pairwise distances

Compare all MinHash signatures to produce a pairwise distance matrix:

```{code} bash
mosh sourmash compare \
    --i-min-hash-signature min-hash.qza \
    --p-ksize 105 \
    --o-compare-output min-hash-compare.qza \
    --verbose
```

---

## Step 3 — Dereplicate MAGs

Cluster MAGs by similarity and select the best representative from each cluster. Here we use the BUSCO completeness scores to choose the most complete genome in each cluster:

```{code} bash
mosh mag dereplicate-mags \
    --i-mags mags-filtered.qza \
    --i-distance-matrix min-hash-compare.qza \
    --m-metadata-file busco-results.qza \
    --p-metadata-column completeness \
    --p-threshold 0.9 \
    --p-find-max \
    --o-dereplicated-mags mags-derep.qza \
    --o-table mags-sample-table.qza \
    --verbose
```

`--p-threshold 0.9` means MAGs within 90% similarity (i.e., a distance below 0.1) are considered identical. Adjust this based on the desired taxonomic resolution—0.95–0.99 gives strain-level resolution; 0.8–0.9 gives species-level resolution.

The `--o-table` output is a `FeatureTable[PresenceAbsence]` mapping each representative MAG to the samples it was found in.

:::{note}
If you did not run BUSCO, omit `--m-metadata-file` and `--p-metadata-column`. In that case, `dereplicate-mags` selects the longest MAG as the representative from each cluster.
:::

After dereplication you can apply a second round of quality filtering on the dereplicated set:

```{code} bash
mosh mag filter-derep-mags \
    --i-mags mags-derep.qza \
    --m-metadata-file busco-results.qza \
    --p-where "completeness>50 AND contamination<10" \
    --o-filtered-mags mags-derep-filtered.qza \
    --verbose
```

---

## Step 4 — Index dereplicated MAGs

Build a Bowtie2 index for the dereplicated MAG set. This is done once and reused for read mapping across all samples:

```{code} bash
mosh assembly index-derep-mags \
    --i-mags mags-derep.qza \
    --p-threads 8 \
    --p-seed 100 \
    --o-index mags-derep-index.qza \
    --verbose
```

---

## Step 5 — Map reads to dereplicated MAGs

Map the original reads to the indexed MAG set to count how many reads align to each genome in each sample:

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh assembly map-reads \
    --i-index mags-derep-index.qza \
    --i-reads reads.qza \
    --p-threads 8 \
    --p-seed 100 \
    --o-alignment-maps reads-to-mags-aln.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh assembly map-reads \
    --i-index mags-derep-index.qza \
    --i-reads reads.qza \
    --p-threads 8 \
    --p-seed 100 \
    --o-alignment-maps reads-to-mags-aln.qza \
    --verbose
```
````
`````

---

## Step 6 — Estimate MAG lengths

Retrieve the length of each dereplicated MAG, which is required for normalizing read counts:

```{code} bash
mosh mag get-feature-lengths \
    --i-features mags-derep.qza \
    --o-lengths mags-derep-lengths.qza \
    --verbose
```

---

## Step 7 — Estimate abundance

Normalize read counts by MAG length and sequencing depth to produce either RPKM or TPM abundance estimates:

```{code} bash
mosh mag estimate-abundance \
    --i-alignment-maps reads-to-mags-aln.qza \
    --i-feature-lengths mags-derep-lengths.qza \
    --p-metric tpm \
    --p-min-mapq 42 \
    --p-threads 4 \
    --o-abundances mags-abundances.qza \
    --verbose
```

`--p-metric tpm` produces TPM (Transcripts Per Million), which is comparable across samples. `rpkm` is also available. `--p-min-mapq 42` restricts counts to uniquely mapped reads.

---

## Step 8 — Visualize taxonomic composition

If you have classified your MAGs with Kraken 2 (see [Early taxonomic composition](early-taxonomy)), combine the abundance table with taxonomy to visualize community composition:

```{code} bash
mosh taxa barplot \
    --i-table mags-abundances.qza \
    --i-taxonomy mags-taxonomy.qza \
    --o-visualization mags-taxa-barplot.qzv \
    --verbose
```

---

## Further reading

- [End-to-end tutorial — Dereplication](e2e-dereplication) — worked dereplication example with mock-community data
- [End-to-end tutorial — Abundance estimation](mag-abundance) — complete abundance and barplot workflow
- [Cocoa tutorial — MAG recovery](mag-recovery) — dereplication and abundance in a real-world context
- [How to use parsl parallelization](parsl) — configuring parallel read mapping
