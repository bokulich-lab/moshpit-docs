# MOSHPIT tutorial

MOSHPIT (MOdular SHotgun metagenome Pipelines with Integrated provenance Tracking) is a suite of plugins for whole 
metagenome assembly and analysis as part of the microbiome multi-omics data science platform [QIIME 2](https://qiime2.org/). 
MOSHPIT enables flexible, modular, fully reproducible workflows for read-based or assembly-based analysis of 
metagenome data.

The following main plugins comprise the core of the MOSHPIT suite:
- [q2-assembly](https://github.com/bokulich-lab/q2-assembly): contains actions for (meta)genome and quality control, 
    genome indexing and red mapping
- [q2-moshpit](https://github.com/bokulich-lab/q2-moshpit): provides actions for contig binning and quality control, 
    taxonomic and functional annotations of contigs and MAGs, human host removal.

Additionally, you may want to check out our plugins for AMR genes detection and viromics applications (they are not 
covered in this tutorial but you may use them with some of the artifacts produced by the MOSHPIT plugins):
- [q2-rgi](https://github.com/bokulich-lab/q2-rgi): antimicrobial resistance gene annotation of MAGs and metagenomic 
    reads with RGI and CARD
- [q2-amrfinderplus](https://github.com/bokulich-lab/q2-amrfinderplus): AMR detection using the AMRFinderPlus tool
- [q2-viromics](https://github.com/bokulich-lab/q2-viromics): detection of viral sequences and their quality control.

This tutorial will guide you through the process of analyzing metagenomic data using QIIME 2 framework and MOSHPIT. 
The tutorial is divided into several chapters, each focusing on a different aspect of metagenomic data analysis. 
We will use a small published dataset to demonstrate the capabilities of most of the methods available in MOSHPIT.

We will begin by setting up our computational environment and fetching all the necessary data (see [Setup](setup) and 
[Data retrieval](data-retrieval)). Then, we will move to quality control and filtering of the raw reads (see 
[Quality control](quality-control)). Once we have our clean dataset, we can start by recovering metagenome-assembled 
genomes (MAGs) (see [here](mag-recovery)), followed by taxonomic classification of reads and MAGs themselves (see 
[Taxonomic classification](taxonomic-classification)). Finally, we will estimate perform functional annotation of 
the dereplicated MAGs (see [Functional annotation](functional-annotation)).

Let's dive in!
