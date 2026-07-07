---
authors:
- mz
---
(functional-profiling)=
# How to profile functional potential

::::{tip} Goal
Characterize the metabolic and functional capacity of your metagenomic samples. Two complementary approaches are available: read-based profiling with HUMAnN 3 (fast, no assembly required) and MAG-based annotation with EggNOG-mapper (genome-resolved, requires the full assembly and binning pipeline).
::::

---

## Choosing an approach

```{list-table}
:header-rows: 1
:widths: 15 42 43

* - Approach
  - When to use
  - What you get
* - **Read-based (HUMAnN 3)**
  - Any time after QC; no assembly needed
  - Gene family abundances, metabolic pathway abundances, MetaPhlAn taxonomic profile
* - **MAG-based (EggNOG)**
  - After binning and dereplication
  - COG/KEGG/GO annotations linked to specific genomes; CAZyme and other category extraction
```

The two approaches are complementary: HUMAnN 3 captures the full functional potential of all reads (including those from organisms that could not be binned), while EggNOG annotation links functions to specific reconstructed genomes.

::::{note} Prerequisites
**Path A (HUMAnN 3):** Quality-filtered reads and the [q2-humann3](https://library.qiime2.org/plugins/bokulich-lab/q2-humann3) plugin (separate installation).
**Path B (EggNOG):** Dereplicated MAGs from [binning](bin-mags) and [dereplication](dereplicate-and-abundance).
::::

---

## Path A — Read-based functional profiling with HUMAnN 3

:::{attention}
HUMAnN 3 is provided by the separate [q2-humann3](https://library.qiime2.org/plugins/bokulich-lab/q2-humann3) plugin, which requires a separate installation from the core MOSHPIT distribution. The databases are large (tens of GB) and the analysis is compute-intensive; running on an HPC cluster is recommended.
:::

### Step A1 — Download databases

```{code} bash
qiime humann3 download-chocophlan-database \
    --o-database chocophlan-db.qza \
    --verbose

qiime humann3 download-metaphlan-database \
    --p-index latest \
    --p-cpus 4 \
    --o-database metaphlan-db.qza \
    --verbose

qiime humann3 download-translated-search-database \
    --p-build uniref90_diamond \
    --o-database uniref-db.qza \
    --verbose
```

### Step A2 — Run HUMAnN 3

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
qiime humann3 run-humann \
    --i-reads reads.qza \
    --i-nucleotide-database chocophlan-db.qza \
    --i-translated-search-database uniref-db.qza \
    --i-metaphlan-database metaphlan-db.qza \
    --p-threads 8 \
    --p-memory-use minimum \
    --o-gene-families humann-gene-families.qza \
    --o-path-abundance humann-path-abundance.qza \
    --o-metaphlan-profile humann-metaphlan-profile.qza \
    --o-reactions humann-reactions.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
qiime humann3 run-humann \
    --i-reads reads.qza \
    --i-nucleotide-database chocophlan-db.qza \
    --i-translated-search-database uniref-db.qza \
    --i-metaphlan-database metaphlan-db.qza \
    --p-threads 8 \
    --p-memory-use minimum \
    --o-gene-families humann-gene-families.qza \
    --o-path-abundance humann-path-abundance.qza \
    --o-metaphlan-profile humann-metaphlan-profile.qza \
    --o-reactions humann-reactions.qza \
    --verbose
```
````
`````

### Step A3 — Visualize results

Convert the stratified HUMAnN tables into standard QIIME 2 feature tables using q2-sapienns:

```{code} bash
# Pathway abundances
qiime sapienns humann-pathway \
    --i-pathway-table humann-path-abundance.qza \
    --p-destratify \
    --o-table humann-pathways-table.qza \
    --o-taxonomy humann-pathways-taxonomy.qza \
    --verbose

qiime taxa barplot \
    --i-table humann-pathways-table.qza \
    --i-taxonomy humann-pathways-taxonomy.qza \
    --o-visualization humann-pathways-barplot.qzv \
    --verbose

# Gene families
qiime sapienns humann-genefamily \
    --i-genefamily-table humann-gene-families.qza \
    --p-destratify \
    --o-table humann-genefamilies-table.qza \
    --o-taxonomy humann-genefamilies-taxonomy.qza \
    --verbose

# MetaPhlAn taxonomic profile (species level)
qiime sapienns metaphlan-taxon \
    --i-stratified-table humann-metaphlan-profile.qza \
    --p-level 7 \
    --o-table metaphlan-table.qza \
    --o-taxonomy metaphlan-taxonomy.qza \
    --verbose

qiime taxa barplot2 \
    --i-table metaphlan-table.qza \
    --i-taxonomy metaphlan-taxonomy.qza \
    --o-visualization metaphlan-barplot.qzv \
    --verbose
```

:::{seealso} Tutorial reference
[End-to-end tutorial — Functional profiling](e2e-functional-profiling) — complete worked example including database downloads and interpretation.
:::

---

## Path B — MAG-based functional annotation with EggNOG

EggNOG-mapper assigns COG, KEGG, GO, and other functional categories to predicted protein sequences derived from your MAGs or contigs.

### Step B1 — Download databases

```{code} bash
mosh annotate fetch-diamond-db \
    --o-diamond-db diamond-db.qza \
    --verbose

mosh annotate fetch-eggnog-db \
    --o-eggnog-db eggnog-db.qza \
    --verbose
```

Alternatively, build a taxon-specific DIAMOND database for faster searches:

```{code} bash
mosh annotate build-eggnog-diamond-db \
    --i-eggnog-db eggnog-db.qza \
    --p-taxon 2 \
    --o-eggnog-diamond-db eggnog-diamond-db-bacteria.qza \
    --verbose
```

Pass `--p-taxon 2` for Bacteria, `2157` for Archaea, or `1` for all. Taxon IDs follow the NCBI taxonomy.

### Step B2 — Annotate MAGs with EggNOG

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate search-orthologs-diamond \
    --i-seqs mags-derep.qza \
    --i-diamond-db diamond-db.qza \
    --p-num-cpus 8 \
    --o-hits ortholog-hits.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate search-orthologs-diamond \
    --i-seqs mags-derep.qza \
    --i-diamond-db diamond-db.qza \
    --p-num-cpus 8 \
    --o-hits ortholog-hits.qza \
    --verbose
```
````
`````

### Step B3 — Map orthologs to functional categories

```{code} bash
mosh annotate map-eggnog \
    --i-ortholog-hits ortholog-hits.qza \
    --i-eggnog-db eggnog-db.qza \
    --o-annotations eggnog-annotations.qza \
    --verbose
```

### Step B4 — Extract specific annotation categories

The `extract-annotations` action produces a feature table for a specific annotation type (e.g., COG functional categories, KEGG pathways):

```{code} bash
mosh annotate extract-annotations \
    --i-annotations eggnog-annotations.qza \
    --p-annotation-type cog_fun \
    --o-annotation-frequency eggnog-cog-freq.qza \
    --verbose
```

Common annotation types: `cog_fun` (COG functional categories), `ko` (KEGG Ortholog IDs), `go_terms` (Gene Ontology).

### Step B5 — Link annotations to abundance (optional)

Combine annotation frequencies with MAG abundance estimates to produce abundance-weighted functional profiles:

```{code} bash
mosh annotate multiply-tables \
    --i-table1 eggnog-cog-freq.qza \
    --i-table2 mags-abundances.qza \
    --o-result-table eggnog-cog-abundance.qza \
    --verbose
```

:::{seealso} Tutorial reference
[Cocoa tutorial — Functional annotation](functional-annotation) — complete MAG-based EggNOG workflow including CAZyme extraction and beta-diversity analysis.
:::

---

## Further reading

- [End-to-end tutorial — Functional profiling](e2e-functional-profiling) — HUMAnN 3 read-based profiling with mock-community data
- [Cocoa tutorial — Functional annotation](functional-annotation) — EggNOG MAG annotation with real data
- [How to use parsl parallelization](parsl) — parallel execution for `run-humann` and `search-orthologs-diamond`
