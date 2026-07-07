---
authors:
- mz
---
(early-taxonomy)=
# Early glimpse of taxonomic composition

::::{tip} Goal
Produce a taxonomic barplot visualization of community composition as early as possible in your analysis—before spending resources on binning or dereplication.
::::

Three approaches are available depending on your data:

```{list-table}
:header-rows: 1
:widths: 10 30 30 30

* - Path
  - When to use
  - Input required
  - What you get
* - **A — Read-based**
  - Any time after QC; before or without assembly
  - Raw reads
  - Bracken-corrected abundance barplot
* - **B — Contig-based**
  - After assembly; before binning
  - Contigs + reads
  - Contig abundance table collapsed by taxonomy
* - **C — MAG-based**
  - After binning and dereplication
  - Dereplicated MAGs
  - Genome-resolved taxonomy with abundance estimates
```

Path A is the fastest and requires the least prior processing. Path B links taxonomy to assembled sequence data (useful for validating assembly or prioritizing contigs for downstream analysis) and covers actions not demonstrated in any existing tutorial. Path C is the most accurate but requires the full assembly and binning pipeline. The [end-to-end tutorial](taxonomic-classification) covers paths A and C in detail; this guide focuses on helping you choose and completes the documentation for path B.

::::{note} Prerequisites
A Kraken 2 database (see [below](#prerequisites-for-all-paths)). Path A also needs quality-filtered reads; Path B additionally needs assembled contigs; Path C requires dereplicated MAGs from the full [binning workflow](bin-mags).
::::

---

## Prerequisites for all paths

You need a Kraken 2 database. The `standard8` collection is the smallest pre-built option and suitable for testing and laptop-scale analyses:

```{code} bash
mosh annotate build-kraken-db \
    --p-collection standard8 \
    --o-kraken2-db kraken2-db.qza \
    --o-bracken-db bracken-db.qza \
    --verbose
```

For production analyses on real samples, use a larger collection (e.g., `standard16` or `standard`) or a custom database to maximize classification sensitivity.

---

## Path A — Read-based classification

This is the fastest route to a taxonomic overview. It works directly from quality-filtered reads, with no assembly required.

### Step A1 — Classify reads with Kraken 2

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs reads.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-reads.qza \
    --o-outputs kraken2-hits-reads.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs reads.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-reads.qza \
    --o-outputs kraken2-hits-reads.qza \
    --verbose
```
````
`````

### Step A2 — Re-estimate abundances with Bracken

Kraken 2 raw read counts are biased by differences in genome size and marker gene copy number. Bracken corrects for these using the database composition:

```{code} bash
mosh annotate estimate-bracken \
    --i-kraken2-reports kraken2-reports-reads.qza \
    --i-db bracken-db.qza \
    --p-read-len 150 \
    --o-reports bracken-reports.qza \
    --o-taxonomy bracken-taxonomy.qza \
    --o-table bracken-table.qza \
    --verbose
```

Set `--p-read-len` to the length of your trimmed reads (check your `fastp` visualization if unsure).

### Step A3 — Visualize

```{code} bash
mosh taxa barplot \
    --i-table bracken-table.qza \
    --i-taxonomy bracken-taxonomy.qza \
    --o-visualization bracken-barplot.qzv \
    --verbose
```

:::{seealso} **Alternative: Kaiju protein-level classification**
:class: dropdown
Kaiju classifies reads at the protein level, which can improve classification of divergent sequences that Kraken 2 misses at the nucleotide level. It requires a separate database:
```{code} bash
mosh annotate fetch-kaiju-db \
    --p-database-type nr_euk \
    --o-database kaiju-db.qza \
    --verbose

mosh annotate classify-kaiju \
    --i-seqs reads.qza \
    --i-db kaiju-db.qza \
    --p-threads 4 \
    --o-taxonomy kaiju-taxonomy.qza \
    --o-table kaiju-table.qza \
    --verbose
```
The Cocoa tutorial demonstrates Kaiju alongside Kraken 2 in [Taxonomic classification of reads](taxonomic-classification).
:::

:::{seealso} Path A tutorial reference
[End-to-end tutorial — Taxonomic classification](e2e-taxonomic-classification) — complete worked example using the mock-community dataset.
:::

---

## Path B — Contig-based classification

Running Kraken 2 on assembled contigs instead of reads offers several advantages:

- **Higher specificity** — assembled contigs are longer than individual reads, giving Kraken 2 more sequence context for each classification.
- **Pre-binning insight** — you can see the taxonomic composition of your assembly before committing to the compute-intensive binning step.
- **Contig-resolved taxonomy** — each contig gets an explicit taxonomy assignment, which you can then link to abundance estimates.

This path is not covered in the existing tutorials and uses three `q2-annotate` actions (`classify-kraken2` on contigs, `map-taxonomy-to-contigs`, and `collapse-contigs`) that are new here.

### Step B1 — Classify contigs with Kraken 2

The same `classify-kraken2` action accepts `SampleData[Contigs]` directly; the output types are automatically tagged as `Properties("contigs")`:

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs contigs.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-contigs.qza \
    --o-outputs kraken2-hits-contigs.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs contigs.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-contigs.qza \
    --o-outputs kraken2-hits-contigs.qza \
    --verbose
```
````
`````

### Step B2 — Map taxonomy strings to contig IDs

Convert the Kraken 2 contig reports into a per-contig taxonomy mapping:

```{code} bash
mosh annotate map-taxonomy-to-contigs \
    --i-reports kraken2-reports-contigs.qza \
    --i-outputs kraken2-hits-contigs.qza \
    --p-coverage-threshold 10 \
    --o-feature-map contig-taxonomy-map.qza \
    --o-taxonomy contig-taxonomy.qza \
    --verbose
```

`--p-coverage-threshold` (0–100) sets the minimum percentage of a contig that must be covered by k-mer matches for the classification to be accepted. Contigs below the threshold are assigned `d__Unclassified`. Increasing this value produces more conservative but higher-confidence assignments.

### Step B3 — Estimate contig abundance

To weight the taxonomy by how much sequence is present, estimate how many reads map to each contig. This reuses the same indexing and mapping actions as the binning workflow:

```{code} bash
mosh assembly index-contigs \
    --i-contigs contigs.qza \
    --p-threads 8 \
    --o-index contigs-index.qza \
    --verbose

mosh assembly map-reads \
    --i-index contigs-index.qza \
    --i-reads reads.qza \
    --p-threads 8 \
    --o-alignment-maps reads-to-contigs-aln.qza \
    --verbose

mosh mag get-feature-lengths \
    --i-features contigs.qza \
    --o-lengths contig-lengths.qza \
    --verbose

mosh mag estimate-abundance \
    --i-alignment-maps reads-to-contigs-aln.qza \
    --i-feature-lengths contig-lengths.qza \
    --p-metric tpm \
    --o-abundances contig-abundance-table.qza \
    --verbose
```

If you already ran these steps for binning, reuse the alignment maps and lengths you computed there rather than repeating them.

### Step B4 — Collapse contig abundances by taxonomy

Group contigs by their taxonomy assignment and average their abundances within each taxonomic group:

```{code} bash
mosh annotate collapse-contigs \
    --i-table contig-abundance-table.qza \
    --i-contig-map contig-taxonomy-map.qza \
    --i-taxonomy contig-taxonomy.qza \
    --o-collapsed-table taxonomy-abundance-table.qza \
    --o-visualization contig-taxonomy-barplot.qzv \
    --verbose
```

The visualization shows histograms of contig abundance distributions per taxon per sample, allowing you to assess how evenly contigs within a taxon are covered.

### Step B5 — Generate a standard barplot

Use the collapsed table and taxonomy with the familiar barplot action for a per-sample overview:

```{code} bash
mosh taxa barplot \
    --i-table taxonomy-abundance-table.qza \
    --i-taxonomy contig-taxonomy.qza \
    --o-visualization contig-taxa-barplot.qzv \
    --verbose
```

---

## Path C — MAG-based classification

After completing the full assembly → binning → dereplication pipeline, classify the dereplicated MAGs for the most accurate taxonomy and combine with abundance estimates:

```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs mags-derep.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-mags.qza \
    --o-outputs kraken2-hits-mags.qza \
    --verbose

mosh annotate kraken2-to-mag-features \
    --i-reports kraken2-reports-mags.qza \
    --i-outputs kraken2-hits-mags.qza \
    --o-taxonomy mags-taxonomy.qza \
    --verbose
```

Then estimate MAG abundance and link to taxonomy as described in the [Abundance estimation tutorial](mag-abundance).

:::{seealso} Path C tutorial reference
[End-to-end tutorial — Taxonomic classification](e2e-taxonomic-classification) and [Abundance estimation](mag-abundance).
:::

---

## Comparing the three paths

| Aspect | Path A (reads) | Path B (contigs) | Path C (MAGs) |
|--------|---------------|-----------------|---------------|
| When available | After QC | After assembly | After binning + dereplication |
| Compute cost | Low | Medium | High |
| Taxonomic resolution | Species (Bracken) | Contig-level assignment | Genome-resolved |
| Abundance metric | Bracken-corrected read counts | TPM/RPKM per contig | TPM/RPKM per MAG |
| Use case | Quick overview; read-based profiling | Assembly validation; pre-binning insight | Definitive community profile |

For most studies, running Path A early to guide decisions (e.g., check for host contamination, validate community composition against expectations) and Path C after binning for final analyses is the recommended approach. Path B is particularly useful when you want to understand the taxonomic landscape of your assembly before investing in computationally expensive binning.

---

## Further reading

- [End-to-end tutorial — Taxonomic classification](e2e-taxonomic-classification) — worked example for paths A and C with the mock-community dataset
- [Cocoa tutorial — Taxonomic classification](taxonomic-classification) — Kaiju + Kraken 2 on reads and MAGs with real data
- [How to use parsl parallelization](parsl) — configuring parallel execution for `classify-kraken2`
