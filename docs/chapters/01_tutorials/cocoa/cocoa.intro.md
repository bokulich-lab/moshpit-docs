# 🍫 Cocoa fermentation

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
