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

Run [`process-seqs`](#q2-action-fastp-process-seqs) from the [fastp](#q2-plugin-fastp) plugin in report-only mode to understand the quality of your reads before modifying them:

```{code} bash
mosh fastp process-seqs \
    --i-sequences cache:reads \
    --p-disable-quality-filtering \
    --p-dont-eval-duplication \
    --p-disable-adapter-trimming \
    --p-thread 4 \
    --o-processed-sequences cache:reads_passthrough \
    --o-reports cache:fastp_reports_before \
    --verbose

mosh fastp visualize \
    --i-reports cache:fastp_reports_before \
    --o-visualization fastp-before.qzv \
    --verbose
```

### Trim adapters and low-quality bases

```{code} bash
mosh fastp process-seqs \
    --i-sequences cache:reads \
    --p-length-required 90 \
    --p-cut-mean-quality 30 \
    --p-cut-tail \
    --p-thread 4 \
    --o-processed-sequences cache:reads_trimmed \
    --o-reports cache:fastp_reports \
    --verbose

mosh fastp visualize \
    --i-reports cache:fastp_reports \
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

Build a Bowtie2 index from any reference FASTA with [`bowtie2-build`](#q2-action-quality-control-bowtie2-build), then filter the reads against it with [`filter-reads`](#q2-action-quality-control-filter-reads) from the [quality-control](#q2-plugin-quality-control) plugin:

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
    --i-demultiplexed-sequences cache:reads_trimmed \
    --i-database cache:reference_index \
    --o-filtered-sequences cache:reads_filtered \
    --verbose
```

### Remove human reads using the pangenome

For human-associated samples, filter against a combined index of the GRCh38 reference genome and the draft human pangenome.

Build the index once with [`construct-human-pangenome-index`](#q2-action-quality-control-construct-human-pangenome-index) (and reuse it across experiments), then filter:

```{code} bash
mosh quality-control construct-human-pangenome-index \
    --p-threads 4 \
    --o-index cache:human_pangenome_index \
    --verbose

mosh quality-control filter-reads \
    --i-demultiplexed-sequences cache:reads_trimmed \
    --i-database cache:human_pangenome_index \
    --o-filtered-sequences cache:reads_filtered \
    --verbose
```

Alternatively, [`filter-reads-pangenome`](#q2-action-quality-control-filter-reads-pangenome) builds the index and filters in one step. Saving `--o-reference-index` lets you reuse that index later without re-downloading:

```{code} bash
mosh quality-control filter-reads-pangenome \
    --i-reads cache:reads_trimmed \
    --o-filtered-reads cache:reads_filtered \
    --o-reference-index cache:human_pangenome_index \
    --verbose
```

Steps can be "daisy-chained" to remove reads from multiple hosts: pass the output of one [`filter-reads`](#q2-action-quality-control-filter-reads) step as input to the next.

:::{seealso} Cocoa tutorial — host filtering
See [Host read removal](host-filtering) for a detailed walkthrough.
:::

---

## Stage 3 — Assembly quality control

**Goal:** Verify that contigs are long enough and well-assembled before investing resources in binning.

### Quick metrics with [`evaluate-contigs`](#q2-action-assembly--evaluate-contigs)

```{code} bash
mosh assembly evaluate-contigs \
    --i-contigs cache:contigs \
    --p-n-cpus 4 \
    --o-results cache:contig_qc_results \
    --o-visualization contigs-qc.qzv \
    --verbose
```

Produces N(x) curves, length histograms, and GC content distributions. Fast enough to run on every dataset.

### Comprehensive QUAST assessment with [`evaluate-quast`](#q2-action-assembly-evaluate-quast) (optional)

```{code} bash
mosh assembly evaluate-quast \
    --i-contigs cache:contigs \
    --p-threads 4 \
    --o-results-table cache:quast_results \
    --o-reference-genomes cache:quast_ref_genomes \
    --o-visualization contigs-quast.qzv \
    --verbose
```

Provides misassembly detection and, with `--i-references`, comparison against known reference genomes. Significantly slower than [`evaluate-contigs`](#q2-action-assembly--evaluate-contigs).

### Filter short or problematic contigs with [`filter-contigs`](#q2-action-assembly-filter-contigs)

```{code} bash
mosh assembly filter-contigs \
    --i-contigs cache:contigs \
    --p-length-threshold 1000 \
    --o-filtered-contigs cache:contigs_filtered \
    --verbose
```

:::{seealso} Assembly guide
See [How to assemble contigs](assemble-contigs) for a full discussion of assembly QC metrics.
:::

---

## Stage 4 — MAG quality control

**Goal:** Assess completeness and contamination of bins and remove low-quality MAGs before dereplication.

### Evaluate MAG quality with [`evaluate-busco`](#q2-action-mag--evaluate-busco)

Download the BUSCO database first with [`fetch-busco-db`](#q2-action-mag-fetch-busco-db), then run the evaluation:

```{code} bash
mosh mag fetch-busco-db \
    --p-lineages bacteria_odb12 \
    --o-db cache:busco_db \
    --verbose

mosh mag evaluate-busco \
    --i-mags cache:mags \
    --i-db cache:busco_db \
    --i-unbinned-contigs cache:unbinned_contigs \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 4 \
    --o-results cache:busco_results \
    --o-visualization mags.qzv \
    --verbose
```

### Filter MAGs by completeness and contamination with [`filter-mags`](#q2-action-mag-filter-mags)

```{code} bash
mosh mag filter-mags \
    --i-mags cache:mags \
    --m-metadata-file cache:busco_results \
    --p-where "completeness>50 AND contamination<10" \
    --p-on "mag" \
    --o-filtered-mags cache:mags_filtered \
    --verbose
```

MIMAG quality tiers:
- **High quality:** ≥90% completeness, <5% contamination
- **Medium quality:** ≥50% completeness, <10% contamination
- **Low quality:** <50% completeness

After dereplication, you can apply quality filtering again to the dereplicated set using [`filter-derep-mags`](#q2-action-mag-filter-derep-mags) (accepts `FeatureData[MAG]`).

:::{seealso} **Alternative: CheckM**
:class: dropdown
[q2-checkm](https://github.com/bokulich-lab/q2-checkm) uses the CheckM v1 marker gene approach and requires a separate installation:
```{code} bash
qiime checkm evaluate-bins \
    --i-bins cache:mags \
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

**Goal:** Filter Kraken 2 reports and outputs by sample metadata and/or by minimum relative abundance of classified taxa.

After running [`classify-kraken2`](#q2-action-annotate--classify-kraken2), use [`filter-kraken2-results`](#q2-action-annotate-filter-kraken2-results) to drop low-abundance taxa from reports (and the corresponding hits from the outputs) before downstream steps such as Bracken or barplots:

```{code} bash
mosh annotate filter-kraken2-results \
    --i-reports cache:kraken2_reports_reads \
    --i-outputs cache:kraken2_hits_reads \
    --p-abundance-threshold 0.1 \
    --o-filtered-reports cache:kraken2_reports_filtered \
    --o-filtered-outputs cache:kraken2_hits_filtered \
    --verbose
```

`--p-abundance-threshold` is a proportion between 0 and 1: taxa below that relative abundance (by *classified* read count) are removed, and their counts are subtracted from parent taxonomic groupings.

You can also restrict which samples are retained (or remove reports that contain only unclassified / root-only classifications):

```{code} bash
mosh annotate filter-kraken2-results \
    --i-reports cache:kraken2_reports_reads \
    --i-outputs cache:kraken2_hits_reads \
    --m-metadata-file sample-metadata.tsv \
    --p-where "[sample-type]='fecal'" \
    --p-remove-empty \
    --o-filtered-reports cache:kraken2_reports_filtered \
    --o-filtered-outputs cache:kraken2_hits_filtered \
    --verbose
```

---

## Stage 6 — Viral QC (optional)

**Goal:** Identify viral sequences in your contigs and assess their completeness and contamination.

[q2-viromics](https://github.com/bokulich-lab/q2-viromics) wraps CheckV for detection of viral genomes and requires a separate installation:

```{code} bash
mosh viromics checkv-fetch-db \
    --o-database cache:checkv_db \
    --verbose

mosh viromics checkv-analysis \
    --i-sequences cache:contigs \
    --i-database cache:checkv_db \
    --p-num-threads 4 \
    --o-viruses cache:viral_contigs \
    --o-proviruses cache:proviral_contigs \
    --o-quality-summary cache:viral_quality \
    --o-contamination cache:viral_contamination \
    --o-completeness cache:viral_completeness \
    --verbose
```

The `cache:viral_contigs` output can be used as input to downstream annotation steps.

---

## QC stage summary

| Stage | Key actions | Plugin | Guide / Tutorial |
|-------|-------------|--------|------------------|
| Raw reads | [`process-seqs`](#q2-action-fastp-process-seqs), [`visualize`](#q2-action-fastp-visualize) | [fastp](#q2-plugin-fastp) | [Cocoa — Quality filtering](quality-control) |
| Host removal | [`bowtie2-build`](#q2-action-quality-control-bowtie2-build), [`filter-reads`](#q2-action-quality-control-filter-reads), [`construct-human-pangenome-index`](#q2-action-quality-control-construct-human-pangenome-index), [`filter-reads-pangenome`](#q2-action-quality-control-filter-reads-pangenome) | [quality-control](#q2-plugin-quality-control) | [Cocoa — Host filtering](host-filtering) |
| Assembly | [`evaluate-contigs`](#q2-action-assembly--evaluate-contigs), [`evaluate-quast`](#q2-action-assembly-evaluate-quast), [`filter-contigs`](#q2-action-assembly-filter-contigs) | [assembly](#q2-plugin-assembly) | [Assemble contigs](assemble-contigs) |
| MAG quality | [`evaluate-busco`](#q2-action-mag--evaluate-busco), [`filter-mags`](#q2-action-mag-filter-mags), [`filter-derep-mags`](#q2-action-mag-filter-derep-mags) | [mag](#q2-plugin-mag) | [Bin MAGs](bin-mags) |
| Taxonomy | [`filter-kraken2-results`](#q2-action-annotate-filter-kraken2-results) | [annotate](#q2-plugin-annotate) | This guide |
| Viral QC | `checkv-fetch-db`, `checkv-analysis` | q2-viromics | This guide |
