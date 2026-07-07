---
authors:
- mz
---
(assemble-contigs)=
# How to assemble contigs

::::{tip} Goal
Produce a `SampleData[Contigs]` artifact from paired-end (or single-end) reads and evaluate the quality of the resulting assembly.
::::

::::{note} Prerequisites
A `SampleData[PairedEndSequencesWithQuality]` (or `SampleData[SequencesWithQuality]`) artifact containing your reads. If you need to quality-filter your reads first, see [Quality control at every step](qc-every-step). If you need to fetch reads from SRA, see the [data retrieval how-to](fetch).
::::

---

## Step 1 — Assemble reads with MEGAHIT

MEGAHIT builds a simplified De Bruijn graph from your reads and outputs assembled contigs. It is the recommended assembler for most metagenomic datasets.

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh assembly assemble-megahit \
    --i-reads reads.qza \
    --p-presets meta-sensitive \
    --p-num-cpu-threads 8 \
    --p-min-contig-len 500 \
    --o-contigs contigs.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh assembly assemble-megahit \
    --i-reads reads.qza \
    --p-presets meta-sensitive \
    --p-num-cpu-threads 8 \
    --p-min-contig-len 500 \
    --o-contigs contigs.qza \
    --verbose
```
````
`````

Key parameters to consider:

- `--p-presets` controls the sensitivity/speed trade-off. `meta-sensitive` gives better results on complex communities at the cost of runtime. `meta-large` is designed for large metagenomes (>100 Gbp input data).
- `--p-min-contig-len` filters very short contigs at the assembly stage. 500 bp is a common starting point; lower it if you expect short viral or plasmid sequences.
- `--p-coassemble` (default: `false`) assembles all samples together into a single set of contigs instead of assembling each sample independently. This can improve assembly for low-coverage samples but discards per-sample information needed for differential abundance analysis.

:::{seealso} **Alternative assembler: SPAdes**
:class: dropdown
For datasets where MEGAHIT produces fragmented assemblies, you can try SPAdes instead:
```{code} bash
mosh assembly assemble-spades \
    --i-reads reads.qza \
    --p-meta \
    --p-threads 8 \
    --o-contigs contigs.qza \
    --verbose
```
SPAdes is generally more accurate but substantially slower and more memory-intensive than MEGAHIT, particularly on large datasets. Most metagenomic workflows use MEGAHIT as their default.
:::

:::{seealso} **Starting from external contigs**
:class: dropdown
If you have contigs assembled outside of QIIME 2 (e.g., from a previous run), you can import them with:
```{code} bash
mosh tools cache-import \
    --type 'SampleData[Contigs]' \
    --input-path /path/to/contigs/ \
    --output-path cache:contigs
```
When importing contigs from another tool, contig identifiers may not be unique across samples, which can cause downstream errors. Use `rename-contigs` to ensure uniqueness:
```{code} bash
mosh assembly rename-contigs \
    --i-contigs contigs.qza \
    --p-uuid-type shortuuid \
    --o-renamed-contigs contigs-renamed.qza \
    --verbose
```
See the [import how-to](data-import) for more details.
:::

---

## Step 2 — Evaluate assembly quality

After assembly, assess contig quality before spending resources on indexing and binning. Two complementary actions are available.

### Quick evaluation with `evaluate-contigs`

This action is fast and produces N(x) curves, GC content distributions, and length histograms for each sample:

```{code} bash
mosh assembly evaluate-contigs \
    --i-contigs contigs.qza \
    --p-n-cpus 4 \
    --o-results contig-qc-results.qza \
    --o-visualization contigs-qc.qzv \
    --verbose
```

### Comprehensive evaluation with `evaluate-quast` (optional)

QUAST computes additional metrics including potential misassemblies and, if you provide reference genomes, estimates what fraction of each reference is covered by your assembly:

```{code} bash
mosh assembly evaluate-quast \
    --i-contigs contigs.qza \
    --p-threads 4 \
    --o-results-table quast-results.qza \
    --o-reference-genomes quast-ref-genomes.qza \
    --o-visualization contigs-qc-quast.qzv \
    --verbose
```

Pass `--i-references reference-genomes.qza` if you have reference sequences (e.g., for a mock community). QUAST is significantly slower than `evaluate-contigs` and requires more memory; for large studies `evaluate-contigs` is usually sufficient.

---

## Step 3 — Filter contigs (optional)

You can remove contigs that do not meet quality criteria using `filter-contigs`. This is useful for excluding very short or otherwise problematic contigs that survived assembly but should not be carried into downstream analysis:

```{code} bash
mosh assembly filter-contigs \
    --i-contigs contigs.qza \
    --m-metadata-file contig-qc-results.qza \
    --p-where "length >= 1000" \
    --o-filtered-contigs contigs-filtered.qza \
    --verbose
```

---

## QC checkpoint

Before proceeding to binning, check the following in your assembly QC visualization:

- **N50** — a higher N50 means your reads were assembled into longer contigs; values above 10–50 kbp are generally considered good for complex metagenomes.
- **Number of contigs** — a very large number of short contigs indicates a fragmented assembly; consider adjusting `--p-min-contig-len` or using a different preset.
- **GC content** — verify the distribution looks unimodal or consistent with your expected community; multimodal distributions are expected in diverse samples.

:::{warning}
Contig binning requires that reads can be mapped back to the assembled contigs. If you assembled with `--p-coassemble`, all samples will share the same contig set, which is valid input for the next step. If you assembled per-sample (default), each sample has its own contigs.
:::

---

## Further reading

- [End-to-end tutorial — Assembly chapter](assembly) — worked example with mock-community data including reference-based QUAST
- [Cocoa tutorial — MAG recovery](mag-recovery) — assembly in a real-world context, including parsl HPC configuration
- [How to use parsl parallelization](parsl) — configuring parallel execution for `assemble-megahit`
- [How to import data from other tools](data-import) — importing externally assembled contigs
