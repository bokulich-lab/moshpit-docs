---
authors:
  - name: Bokulich Lab, ETH Zürich
    github: bokulich-lab
    url: https://fsb.ethz.ch
---
# Whole metagenome analysis with MOSHPIT

Welcome! 👋 __MOSHPIT__ (**MO**dular **SH**otgun metagenome **P**ipelines with **I**ntegrated provenance **T**racking) is a toolkit of plugins for whole 
metagenome assembly, annotation, and analysis built on the microbiome multi-omics data science framework [QIIME 2](https://qiime2.org/). 
MOSHPIT enables flexible, modular, fully reproducible workflows for read-based or assembly-based analysis of 
metagenome data.

```{figure} ./_static/fig1-main.png
---
name: overview-fig
width: 100%
---
Schematic of current analysis workflows available in MOSHPIT.
```

The following main plugins comprise the core of the MOSHPIT toolkit and are included in the [MOSHPIT distribution](https://library.qiime2.org/quickstart/moshpit):
::::{grid} 1 1 2 3

:::{card}
:header: **q2-assembly**
:link: https://github.com/bokulich-lab/q2-assembly
This plugin contains actions for (meta)genome assembly and quality control, genome indexing and read mapping.
:::

:::{card}
:header: **q2-mag**
:link: https://github.com/bokulich-lab/q2-mag
This plugin provides actions for contig binning, MAG quality control, dereplication, and abundance estimation.
:::

:::{card}
:header: **q2-annotate**
:link: https://github.com/bokulich-lab/q2-annotate
This plugin provides actions for taxonomic and functional annotation of contigs and {term}`MAG`s, human host removal.
:::

:::{card}
:header: **q2-fastp**
:link: https://github.com/bokulich-lab/q2-fastp
This plugin provides actions for quality control using _fastp_.
:::

:::{card}
:header: **q2-sourmash**
:link: https://github.com/dib-lab/q2-sourmash
This plugin provides actions for computing and comparing MinHash signatures using [_sourmash_](https://sourmash.readthedocs.io/en/latest/).
:::

:::{card}
:header: **q2-fondue**
:link: https://github.com/bokulich-lab/q2-fondue
This plugin provides actions for data retrieval from SRA.
:::

::::

---
You may also want to check out these other QIIME 2 plugins for antimicrobial resistance gene ({term}`ARG`) detection and viromics applications. These plugins are not covered in this tutorial. They have their own installation instructions and tutorials (see the wiki page on the respective GitHub repositories). You can use these plugins with some of the artifacts produced by q2-assembly, q2-mag, and q2-annotate:

::::{grid} 1 1 2 3

:::{card}
:header: **q2-rgi**
:link: https://github.com/bokulich-lab/q2-rgi
Antimicrobial resistance gene annotation of {term}`MAG`s and metagenomic reads with [_RGI_](https://github.com/arpcard/rgi) and CARD.
:::

:::{card}
:header: **q2-amrfinderplus**
:link: https://github.com/bokulich-lab/q2-amrfinderplus
{term}`ARG` detection using the [_AMRFinderPlus_](https://github.com/ncbi/amr) tool.
:::

:::{card}
:header: **q2-viromics**
:link: https://github.com/bokulich-lab/q2-viromics
Detection of viral sequences and their quality control.
:::

::::

---
Finally, here are some other plugins we developed and that are compatible with metagenomic workflows:

::::{grid} 1 1 2 3

:::{card}
:header: **q2-skani**
:link: https://github.com/bokulich-lab/q2-skani
ANI analysis using [_skani_](https://github.com/bluenote-1577/skani).
:::

:::{card}
:header: **q2-gunc**
:link: https://github.com/bokulich-lab/q2-gunc
Chimerism and contamination detection in prokaryotic genomes with [_gunc_](https://github.com/grp-bork/gunc).
:::

:::{card}
:header: **q2-subread**
:link: https://github.com/bokulich-lab/q2-subread
Read alignment and quantification using [_Subread_](https://subread.sourceforge.net/).
:::

:::{card}
:header: **q2-deseq2**
:link: https://github.com/bokulich-lab/q2-deseq2
Differential expression analysis using [_DESeq2_](https://bioconductor.org/packages/release/bioc/html/DESeq2.html).
:::

:::{card}
:header: **q2-checkm**
:link: https://github.com/bokulich-lab/q2-checkm
Assessment of microbial genome quality with [_CheckM_ v1](https://github.com/ecogenomics/checkm).
:::

::::
