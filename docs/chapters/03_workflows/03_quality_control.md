---
authors:
- mz
---
(qc-every-step)=
# Quality control at every step

::::{tip} Goal
A reference for the QC actions available at every stage of a MOSHPIT workflow—from raw reads through to dereplicated MAGs. Use it to identify which actions are relevant to your situation and where to find detailed usage examples.
::::

Metagenomic analysis involves many stages, each with its own quality concerns.

:::{note}
The [end-to-end tutorial](assembly) intentionally skips read-level QC to keep the dataset simple. If you are working with real data, always start with read quality filtering and, if appropriate, host read removal. The [Cocoa tutorial](quality-control) demonstrates both steps in a real-world context.
:::

---

## Stage 1 — Raw read quality control

**Goal:** Produce quality-trimmed reads and generate a MultiQC visualization of read quality metrics.

### Inspect read quality (no trimming)

Run `fastp` in report-only mode to understand the quality of your reads before modifying them:

```{code} bash
mosh fastp process-seqs \
    --i-sequences reads.qza \
    --p-disable-quality-filtering \
    --p-dont-eval-duplication \
    --p-disable-adapter-trimming \
    --p-thread 4 \
    --o-processed-sequences reads-passthrough.qza \
    --o-reports fastp-reports-before.qza \
    --verbose

mosh fastp visualize \
    --i-reports fastp-reports-before.qza \
    --o-visualization fastp-before.qzv \
    --verbose
```

### Trim adapters and low-quality bases

```{code} bash
mosh fastp process-seqs \
    --i-sequences reads.qza \
    --p-length-required 90 \
    --p-cut-mean-quality 30 \
    --p-cut-tail \
    --p-thread 4 \
    --o-processed-sequences reads-trimmed.qza \
    --o-reports fastp-reports.qza \
    --verbose

mosh fastp visualize \
    --i-reports fastp-reports.qza \
    --o-visualization fastp.qzv \
    --verbose
```

Key parameters:

- `--p-length-required` discards reads shorter than this threshold after trimming.
- `--p-cut-mean-quality` / `--p-cut-tail` enable sliding-window quality trimming from the 3′ end.
- `--p-dedup` removes duplicated reads if PCR duplication is a concern.

:::{seealso} Cocoa tutorial — quality filtering
See [Quality filtering](quality-control) for worked example output and interpretation of the MultiQC visualization.
:::

---

## Stage 2 — Host and contaminant read removal

**Goal:** Remove reads that originate from the host organism (e.g., human) or known contaminants.

### Remove reads from a specific reference

Build a Bowtie2 index from any reference FASTA, then filter the reads against it:

```{code} bash
mosh tools cache-import \
    --type "FeatureData[Sequence]" \
    --input-path reference.fasta \
    --output-path cache:reference_seqs

mosh quality-control bowtie2-build \
    --i-sequences cache:reference_seqs \
    --o-database cache:reference_index \
    --verbose

mosh quality-control filter-reads \
    --i-demultiplexed-sequences reads-trimmed.qza \
    --i-database cache:reference_index \
    --o-filtered-sequences reads-filtered.qza \
    --verbose
```

### Remove human reads using the pangenome

For human-associated samples, use the dedicated pangenome action, which downloads and combines the GRCh38 reference genome with the human pangenome before filtering:

```{code} bash
mosh quality-control filter-reads-pangenome \
    --i-reads reads-trimmed.qza \
    --o-filtered-reads reads-filtered.qza \
    --o-reference-index cache:human_pangenome_index \
    --verbose
```

Saving `--o-reference-index` allows you to reuse the index across multiple experiments without re-downloading.

Steps can be "daisy-chained" to remove reads from multiple hosts: pass the output of one `filter-reads` step as input to the next.

:::{seealso} Cocoa tutorial — host filtering
See [Host read removal](host-filtering) for a detailed walkthrough including multi-host removal.
:::

---

## Stage 3 — Assembly quality control

**Goal:** Verify that contigs are long enough and well-assembled before investing resources in binning.

### Quick metrics

```{code} bash
mosh assembly evaluate-contigs \
    --i-contigs contigs.qza \
    --p-n-cpus 4 \
    --o-results contig-qc-results.qza \
    --o-visualization contigs-qc.qzv \
    --verbose
```

Produces N(x) curves, length histograms, and GC content distributions. Fast enough to run on every dataset.

### Comprehensive QUAST assessment (optional)

```{code} bash
mosh assembly evaluate-quast \
    --i-contigs contigs.qza \
    --p-threads 4 \
    --o-results-table quast-results.qza \
    --o-reference-genomes quast-ref-genomes.qza \
    --o-visualization contigs-quast.qzv \
    --verbose
```

Provides misassembly detection and, with `--i-references`, comparison against known reference genomes. Significantly slower than `evaluate-contigs`.

### Filter short or problematic contigs

```{code} bash
mosh assembly filter-contigs \
    --i-contigs contigs.qza \
    --m-metadata-file contig-qc-results.qza \
    --p-where "length >= 1000" \
    --o-filtered-contigs contigs-filtered.qza \
    --verbose
```

:::{seealso} Assembly guide
See [How to assemble contigs](assemble-contigs) for a full discussion of assembly QC metrics.
:::

---

## Stage 4 — MAG quality control

**Goal:** Assess completeness and contamination of bins and remove low-quality MAGs before dereplication.

### Evaluate MAG quality with BUSCO

```{code} bash
mosh mag fetch-busco-db \
    --p-lineages bacteria_odb12 \
    --o-db busco-db.qza \
    --verbose

mosh mag evaluate-busco \
    --i-mags mags.qza \
    --i-db busco-db.qza \
    --i-unbinned-contigs unbinned-contigs.qza \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 4 \
    --o-results busco-results.qza \
    --o-visualization mags.qzv \
    --verbose
```

### Filter MAGs by completeness and contamination

```{code} bash
mosh mag filter-mags \
    --i-mags mags.qza \
    --m-metadata-file busco-results.qza \
    --p-where "completeness>50 AND contamination<10" \
    --p-on "mag" \
    --o-filtered-mags mags-filtered.qza \
    --verbose
```

MIMAG quality tiers:
- **High quality:** ≥90% completeness, <5% contamination
- **Medium quality:** ≥50% completeness, <10% contamination
- **Low quality:** <50% completeness

After dereplication, you can apply quality filtering again to the dereplicated set using `filter-derep-mags` (accepts `FeatureData[MAG]`).

:::{seealso} **Alternative: CheckM**
:class: dropdown
[q2-checkm](https://github.com/bokulich-lab/q2-checkm) uses the CheckM v1 marker gene approach and requires a separate installation:
```{code} bash
qiime checkm evaluate-bins \
    --i-bins mags.qza \
    --p-threads 4 \
    --o-visualization checkm-results.qzv \
    --verbose
```
:::

:::{seealso} **Chimerism and contamination detection with q2-gunc**
:class: dropdown
[q2-gunc](https://github.com/bokulich-lab/q2-gunc) detects genome chimeras and contamination using the GUNC tool. It requires a separate installation and is particularly useful when you suspect that bins may contain sequences from multiple organisms that BUSCO contamination alone does not capture.
:::

:::{seealso} Binning guide
See [How to bin MAGs](bin-mags) for the complete binning workflow with BUSCO evaluation and filtering.
:::

---

## Stage 5 — Taxonomy-based filtering (optional)

**Goal:** Remove Kraken 2 classifications with insufficient read support or exclude specific taxa from downstream analyses.

After running `classify-kraken2`, you can filter Kraken 2 reports by relative abundance to suppress low-confidence classifications before generating barplots:

```{code} bash
mosh annotate filter-kraken2-reports-by-abundance \
    --i-reports kraken2-reports.qza \
    --p-min-confidence 0.1 \
    --o-filtered-reports kraken2-reports-filtered.qza \
    --verbose
```

To filter out reads assigned to specific taxa (for example, removing host-derived classifications that survived earlier filtering):

```{code} bash
mosh annotate filter-kraken2-reads-by-taxonomy \
    --i-reads reads.qza \
    --i-reports kraken2-reports.qza \
    --p-taxa-to-exclude "Homo sapiens" \
    --o-filtered-reads reads-taxon-filtered.qza \
    --verbose
```

---

## Stage 6 — Viral QC (optional)

**Goal:** Identify viral sequences in your contigs and assess their completeness and contamination.

[q2-viromics](https://github.com/bokulich-lab/q2-viromics) wraps CheckV for detection of viral genomes and requires a separate installation:

```{code} bash
mosh viromics checkv-fetch-db \
    --o-database checkv-db.qza \
    --verbose

mosh viromics checkv-analysis \
    --i-sequences contigs.qza \
    --i-database checkv-db.qza \
    --p-num-threads 4 \
    --o-viruses viral-contigs.qza \
    --o-proviruses proviral-contigs.qza \
    --o-quality-summary viral-quality.qza \
    --o-contamination viral-contamination.qza \
    --o-completeness viral-completeness.qza \
    --verbose
```

The `viral-contigs.qza` output can be used as input to downstream annotation steps.

---

## QC stage summary

| Stage | Key actions | Plugin | Guide / Tutorial |
|-------|-------------|--------|------------------|
| Raw reads | `fastp process-seqs`, `fastp visualize` | q2-fastp | [Cocoa — Quality filtering](quality-control) |
| Host removal | `quality-control bowtie2-build`, `filter-reads`, `filter-reads-pangenome` | quality-control | [Cocoa — Host filtering](host-filtering) |
| Assembly | `evaluate-contigs`, `evaluate-quast`, `filter-contigs` | q2-assembly | [Assemble contigs](assemble-contigs) |
| MAG quality | `evaluate-busco`, `filter-mags`, `filter-derep-mags` | q2-mag | [Bin MAGs](bin-mags) |
| Taxonomy | `filter-kraken2-reports-by-abundance`, `filter-kraken2-reads-by-taxonomy` | q2-annotate | This guide |
| Viral QC | `checkv-fetch-db`, `checkv-analysis` | q2-viromics | This guide |
