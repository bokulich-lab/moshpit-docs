---
authors:
- mz
---
(functional-profiling)=
# How to profile functional potential

::::{tip} Goal
Characterize the metabolic and functional capacity of your metagenomic samples. Three complementary approaches are available: read-based profiling with HUMAnN 3 (fast, no assembly required), contig-based annotation with EggNOG-mapper (early insights, no binning required), and MAG-based annotation with EggNOG-mapper (genome-resolved, requires the full assembly and binning pipeline).
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
* - **Contig-based (EggNOG)**
  - After assembly; no binning needed
  - COG/KEGG/GO annotations for all assembled sequences; available earlier in the pipeline than MAG-based annotation
* - **MAG-based (EggNOG)**
  - After binning and dereplication
  - COG/KEGG/GO annotations linked to specific reconstructed genomes; CAZyme and other category extraction
```

The three approaches are complementary. HUMAnN 3 captures the full functional potential of all reads (including those from organisms that could not be assembled). Contig-based EggNOG annotation provides a quick gene-centric view of functional potential directly from assembled sequences, without waiting for binning. MAG-based EggNOG annotation is genome-resolved and links functions to specific reconstructed genomes, but requires the full assembly and binning pipeline.

::::{note} Prerequisites
**Path A (HUMAnN 3):** Quality-filtered reads and the [q2-humann3](https://library.qiime2.org/plugins/bokulich-lab/q2-humann3) plugin (separate installation).
**Path B (EggNOG, contig-based):** Assembled contigs from [contig assembly](assemble-contigs).
**Path C (EggNOG, MAG-based):** Dereplicated MAGs from [binning](bin-mags) and [dereplication](dereplicate-and-abundance).
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

## Path B — Contig-based functional annotation with EggNOG

EggNOG-mapper can annotate assembled contigs directly, without binning. This gives you an early gene-centric view of the functional potential encoded in your assembly. Because contigs are not yet assigned to organisms, annotations cannot be linked to specific taxa, but you can weight them by contig coverage to approximate community-level functional abundances.

### Step B1 — Download databases

```{code} bash
mosh annotate fetch-diamond-db \
    --o-db diamond-db.qza \
    --verbose

mosh annotate fetch-eggnog-db \
    --o-db eggnog-db.qza \
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

### Step B2 — Search contigs against the EggNOG database

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate search-orthologs-diamond \
    --i-seqs contigs.qza \
    --i-db diamond-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-eggnog-hits eggnog-hits.qza \
    --o-table eggnog-ft.qza \
    --o-loci eggnog-loci.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate search-orthologs-diamond \
    --i-seqs contigs.qza \
    --i-db diamond-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-eggnog-hits eggnog-hits.qza \
    --o-table eggnog-ft.qza \
    --o-loci eggnog-loci.qza \
    --verbose
```
````
`````

### Step B3 — Map orthologs to functional categories

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate map-eggnog \
    --i-eggnog-hits eggnog-hits.qza \
    --i-db eggnog-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-ortholog-annotations eggnog-annotations.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate map-eggnog \
    --i-eggnog-hits eggnog-hits.qza \
    --i-db eggnog-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-ortholog-annotations eggnog-annotations.qza \
    --verbose
```
````
`````

### Step B4 — Extract specific annotation categories

`extract-annotations` produces three outputs: a per-contig frequency table, a per-genome frequency table, and a function-to-contigs map. For contig-based profiling the per-contig table is the most directly useful.

```{code} bash
mosh annotate extract-annotations \
    --i-ortholog-annotations eggnog-annotations.qza \
    --p-annotation cog \
    --p-max-evalue 0.001 \
    --o-annotation-counts-per-contig eggnog-cog-per-contig.qza \
    --o-annotation-counts-per-genome eggnog-cog-per-genome.qza \
    --o-annotation-map eggnog-cog-map.qza \
    --verbose
```

Available annotation types: `cog`, `caz`, `kegg_ko`, `kegg_pathway`, `kegg_reaction`, `kegg_module`, `brite`, `ec`.

### Step B5 — Weight by contig abundance (optional)

If you have a contig abundance table from a mapping step (see [How to bin MAGs](bin-mags)), multiply the per-contig annotation counts by the per-contig abundances to produce abundance-weighted functional profiles:

```{code} bash
mosh annotate multiply-tables \
    --i-table1 contig-abundance.qza \
    --i-table2 eggnog-cog-per-contig.qza \
    --o-result-table eggnog-cog-abundance-weighted.qza \
    --verbose
```

---

## Path C — MAG-based functional annotation with EggNOG

MAG-based annotation uses the same EggNOG pipeline as Path B but takes dereplicated MAGs as input. Because each MAG is a reconstructed genome from a specific organism, this approach links functional annotations to individual taxa and allows abundance-weighting with MAG-level abundance estimates.

### Step C1 — Download databases

Databases are the same as Path B. Skip this step if you already ran Path B.

### Step C2 — Annotate MAGs with EggNOG

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate search-orthologs-diamond \
    --i-seqs mags-derep.qza \
    --i-db diamond-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-eggnog-hits eggnog-hits.qza \
    --o-table eggnog-ft.qza \
    --o-loci eggnog-loci.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate search-orthologs-diamond \
    --i-seqs mags-derep.qza \
    --i-db diamond-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-eggnog-hits eggnog-hits.qza \
    --o-table eggnog-ft.qza \
    --o-loci eggnog-loci.qza \
    --verbose
```
````
`````

### Step C3 — Map orthologs to functional categories

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh annotate map-eggnog \
    --i-eggnog-hits eggnog-hits.qza \
    --i-db eggnog-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-ortholog-annotations eggnog-annotations.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh annotate map-eggnog \
    --i-eggnog-hits eggnog-hits.qza \
    --i-db eggnog-db.qza \
    --p-num-cpus 8 \
    --p-db-in-memory \
    --o-ortholog-annotations eggnog-annotations.qza \
    --verbose
```
````
`````

### Step C4 — Extract specific annotation categories

`extract-annotations` produces three outputs: a per-genome frequency table (one row per MAG), a per-contig frequency table, and a function-to-contigs map. For MAG-based abundance weighting the per-genome table is the relevant one.

```{code} bash
mosh annotate extract-annotations \
    --i-ortholog-annotations eggnog-annotations.qza \
    --p-annotation cog \
    --p-max-evalue 0.001 \
    --o-annotation-counts-per-genome eggnog-cog-per-genome.qza \
    --o-annotation-counts-per-contig eggnog-cog-per-contig.qza \
    --o-annotation-map eggnog-cog-map.qza \
    --verbose
```

Available annotation types: `cog`, `caz`, `kegg_ko`, `kegg_pathway`, `kegg_reaction`, `kegg_module`, `brite`, `ec`.

### Step C5 — Link annotations to MAG abundance (optional)

Combine the per-genome annotation counts with MAG abundance estimates to produce abundance-weighted functional profiles:

```{code} bash
mosh annotate multiply-tables \
    --i-table1 mags-abundances.qza \
    --i-table2 eggnog-cog-per-genome.qza \
    --o-result-table eggnog-cog-abundance.qza \
    --verbose
```

:::{seealso} Tutorial reference
[Cocoa tutorial — Functional annotation](functional-annotation) — complete MAG-based EggNOG workflow including CAZyme extraction and beta-diversity analysis.
:::

---

## Further reading

- [End-to-end tutorial — Functional profiling](e2e-functional-profiling) — HUMAnN 3 read-based profiling with mock-community data
- [Cocoa tutorial — Functional annotation](functional-annotation) — EggNOG MAG annotation with real data, including CAZyme extraction and beta-diversity analysis
- [How to assemble contigs](assemble-contigs) — prerequisite for Path B
- [How to bin MAGs](bin-mags) and [Dereplicate MAGs and estimate abundance](dereplicate-and-abundance) — prerequisites for Path C
- [How to use parsl parallelization](parsl) — parallel execution for `run-humann` and `search-orthologs-diamond`
