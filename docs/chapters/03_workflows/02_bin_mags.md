---
authors:
- mz
---
(bin-mags)=
# How to bin MAGs

::::{tip} Goal
Produce a quality-filtered `SampleData[MAGs]` artifact from assembled contigs, with a BUSCO completeness/contamination assessment and a `BUSCOResults` table you can use to drive dereplication.
::::

::::{note} Prerequisites
A `SampleData[Contigs]` artifact from [assembly](assemble-contigs) and the original reads (`SampleData[PairedEndSequencesWithQuality]`) used to generate those contigs.
::::

---

## Step 1 — Index contigs with [`index-contigs`](#q2-action-assembly--index-contigs)

Build a Bowtie2 index for each sample's contigs using the [assembly](#q2-plugin-assembly) plugin. This index enables read mapping in the next step and is required by both binners.

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh assembly index-contigs \
    --i-contigs cache:contigs \
    --p-threads 8 \
    --p-seed 100 \
    --o-index cache:contigs_index \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh assembly index-contigs \
    --i-contigs cache:contigs \
    --p-threads 8 \
    --p-seed 100 \
    --o-index cache:contigs_index \
    --verbose
```
````
`````

---

## Step 2 — Map reads to contigs with [`map-reads`](#q2-action-assembly-map-reads)

Map the original reads back to the assembled contigs. Both binners use the resulting alignment maps to estimate contig coverage across samples, which is a key signal for grouping contigs into bins.

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh assembly map-reads \
    --i-index cache:contigs_index \
    --i-reads cache:reads \
    --p-threads 8 \
    --p-seed 100 \
    --o-alignment-maps cache:reads_to_contigs_aln \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
mosh assembly map-reads \
    --i-index cache:contigs_index \
    --i-reads cache:reads \
    --p-threads 8 \
    --p-seed 100 \
    --o-alignment-maps cache:reads_to_contigs_aln \
    --verbose
```
````
`````

---

## Step 3 — Bin contigs into MAGs

Two binners are available in the [mag](#q2-plugin-mag) plugin. Both take the same contigs and alignment maps as input; choose one based on your environment and expected sample type.

`````{tab-set}
````{tab-item} MetaBAT 2
[`bin-contigs-metabat`](#q2-action-mag-bin-contigs-metabat) uses tetranucleotide frequency together with coverage information to group contigs. It is fast, well-established, and explicitly outputs the contigs that could not be assigned to any bin (`unbinned-contigs`), which is used later in the BUSCO visualization.

```{code} bash
mosh mag bin-contigs-metabat \
    --i-contigs cache:contigs \
    --i-alignment-maps cache:reads_to_contigs_aln \
    --p-num-threads 4 \
    --p-seed 100 \
    --o-mags cache:mags \
    --o-contig-map cache:contig_map \
    --o-unbinned-contigs cache:unbinned_contigs \
    --verbose
```
````
````{tab-item} SemiBin2
[`bin-contigs-semibin2`](#q2-action-mag-bin-contigs-semibin2) uses deep learning together with coverage information. Pre-trained environment models are available for common sample types (`human_gut`, `ocean`, `soil`, `wastewater`, and more). For samples from an environment not covered by a pre-trained model, use `global`. Unlike MetaBAT 2, SemiBin2 does not produce an `unbinned-contigs` artifact.

```{code} bash
mosh mag bin-contigs-semibin2 \
    --i-contigs cache:contigs \
    --i-alignment-maps cache:reads_to_contigs_aln \
    --p-environment global \
    --p-training-type semi \
    --p-threads 4 \
    --p-random-seed 100 \
    --o-mags cache:mags \
    --o-contig-map cache:contig_map \
    --verbose
```

Replace `global` with the environment that best matches your samples (e.g., `human_gut`, `soil`, `ocean`) for improved binning accuracy.
````
`````

### MetaBAT 2 vs SemiBin2 — when to use which

| Aspect | MetaBAT 2 | SemiBin2 |
|--------|-----------|----------|
| Algorithm | Tetranucleotide frequency + coverage | Deep learning + coverage |
| Speed | Fast | Slower (especially without GPU) |
| Environment-specific models | No | Yes — improves accuracy for known environments |
| Unbinned contigs output | Yes | No |
| Best for | Any dataset; good default | Samples from well-characterized environments |

---

## Step 4 — Evaluate MAG quality with [`evaluate-busco`](#q2-action-mag--evaluate-busco)

BUSCO assesses completeness and contamination of each MAG by checking for the presence of lineage-specific single-copy marker genes. First download the relevant BUSCO database with [`fetch-busco-db`](#q2-action-mag-fetch-busco-db):

```{code} bash
mosh mag fetch-busco-db \
    --p-lineages bacteria_odb12 \
    --o-db cache:busco_db \
    --verbose
```

Common lineages: `bacteria_odb12`, `archaea_odb12`, `eukaryota_odb12`. Use `bacteria_odb12` for typical gut/soil/environmental metagenomes. Then run the evaluation:

`````{tab-set}
````{tab-item} With parsl parallelization
```{code} bash
mosh mag evaluate-busco \
    --i-mags cache:mags \
    --i-db cache:busco_db \
    --i-unbinned-contigs cache:unbinned_contigs \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 4 \
    --o-results cache:busco_results \
    --o-visualization mags.qzv \
    --parallel-config parallel.config.toml \
    --verbose
```
````
````{tab-item} Without parallelization
```{code} bash
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
````
`````

:::{note} SemiBin2 and BUSCO
If you binned with SemiBin2, omit `--i-unbinned-contigs` from the command above. BUSCO quality metrics are still computed for every MAG; only the optional unbinned-contig summary in the visualization is skipped.
:::

:::{seealso} **Alternative: CheckM**
:class: dropdown
[q2-checkm](https://github.com/bokulich-lab/q2-checkm) provides genome quality assessment using CheckM v1, an earlier but widely used marker-gene approach. It requires a separate installation:
```{code} bash
qiime checkm evaluate-bins \
    --i-bins cache:mags \
    --p-threads 4 \
    --o-visualization checkm-results.qzv \
    --verbose
```
CheckM and BUSCO use different marker gene sets. BUSCO's ODB12 databases are more comprehensive and better maintained for environmental metagenomes.
:::

---

## Step 5 — Filter MAGs by quality with [`filter-mags`](#q2-action-mag-filter-mags)

Remove low-quality bins before dereplication or downstream analyses. The MIMAG standard defines "medium quality" as ≥50% completeness and <10% contamination:

```{code} bash
mosh mag filter-mags \
    --i-mags cache:mags \
    --m-metadata-file cache:busco_results \
    --p-where "completeness>50 AND contamination<10" \
    --p-on "mag" \
    --o-filtered-mags cache:mags_filtered \
    --verbose
```

Adjust thresholds based on your downstream goals. For high-confidence phylogenomic analyses you may require ≥90% completeness and <5% contamination ("high quality" by MIMAG). For broad community profiling, more permissive thresholds may be appropriate.

After dereplication, you can apply a second round of filtering on the dereplicated set with [`filter-derep-mags`](#q2-action-mag-filter-derep-mags), which accepts a `FeatureData[MAG]` artifact instead of `SampleData[MAGs]`.

---

## QC checkpoint

In the BUSCO visualization (`mags.qzv`), inspect:

- **Completeness distribution** — most MAGs from a well-assembled community should be >50% complete.
- **Contamination** — bins with >10% contamination likely contain sequences from multiple organisms; consider discarding them.
- **Unbinned contig fraction** (MetaBAT 2 only) — a large unbinned fraction suggests many contigs were too short or had insufficient coverage to be confidently assigned; this is normal for diverse or low-coverage samples.

---

## Further reading

- [End-to-end tutorial — Binning chapter](binning) — worked example with mock-community data
- [Cocoa tutorial — MAG recovery](mag-recovery) — real-world example with HPC parsl configuration and [`filter-derep-mags`](#q2-action-mag-filter-derep-mags)
- [How to use parsl parallelization](parsl) — configuring parallel resources for [`index-contigs`](#q2-action-assembly--index-contigs) and [`evaluate-busco`](#q2-action-mag--evaluate-busco)
