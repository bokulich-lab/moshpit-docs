# Whole metagenome analysis with MOSHPIT

Welcome! 👋 __MOSHPIT__ (**MO**dular **SH**otgun metagenome **P**ipelines with **I**ntegrated provenance **T**racking) is a toolkit of plugins for whole 
metagenome assembly, annotation, and analysis built on the microbiome multi-omics data science framework [QIIME 2](https://qiime2.org/). 
MOSHPIT enables flexible, modular, fully reproducible workflows for read-based or assembly-based analysis of 
metagenome data.

The following main plugins comprise the core of the MOSHPIT toolkit:
::::{grid} 1 1 2 2

:::{card}
:header: q2-assembly
:link: https://github.com/bokulich-lab/q2-assembly
This plugin contains actions for (meta)genome assembly and quality control, genome indexing and red mapping.
:::

:::{card}
:header: q2-annotate
:link: https://github.com/bokulich-lab/q2-annotate
This plugin provides actions for contig binning and quality control, taxonomic and functional annotations 
of contigs and MAGs, human host removal.
:::

::::

Additionally, you may want to check out these other QIIME 2 plugins for antimicrobial resistance gene (ARG) detection and viromics applications. These plugins are not covered in this tutorial. They have their own installation instructions and tutorials (see the wiki page on the respective GitHub repositories). You can use these plugins with some of the artifacts produced by q2-assembly and q2-annotate:

::::{grid} 1 1 2 3

:::{card}
:header: q2-rgi
:link: https://github.com/bokulich-lab/q2-rgi
Antimicrobial resistance gene annotation of MAGs and metagenomic reads with RGI and CARD.
:::

:::{card}
:header: q2-amrfinderplus
:link: https://github.com/bokulich-lab/q2-amrfinderplus
ARG detection using the AMRFinderPlus tool.
:::

:::{card}
:header: q2-viromics
:link: https://github.com/bokulich-lab/q2-viromics
Detection of viral sequences and their quality control.
:::

::::
