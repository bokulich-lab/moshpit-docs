---
authors:
- vr
---
# 🦠 AMR gene annotation
Antimicrobial resistance (AMR) gene annotation describes the identification of known 
resistance genes and mutations in microbial genomes. Detecting these resistance markers 
helps researchers track the spread of AMR and assess potential public health risks.

In QIIME2 there are two plugins that facilitate AMR gene annotation. 
[q2-amrfinderplus](https://github.com/bokulich-lab/q2-amrfinderplus) that wraps the 
functionalities of [AMRFinderPlus](https://github.com/ncbi/amr) and 
[q2-rgi](https://github.com/bokulich-lab/q2-rgi) that uses the 
[RGI](https://github.com/arpcard/rgi) tool. 

AMRFinderPlus is a tool developed by NCBI, this software and the accompanying database 
identify acquired antimicrobial resistance genes in bacterial protein and/or assembled 
nucleotide sequences as well as known resistance-associated point mutations for several 
taxa. The database also includes select members of additional classes of genes such as 
virulence factors, biocide, heat, acid, and metal resistance genes.

RGI is used to predict antibiotic resistomes from MAGs or reads based on 
homology and SNP models. The application uses reference data from the 
[Comprehensive Antibiotic Resistance Database (CARD)](https://card.mcmaster.ca/).

The CARD database provides comprehensive coverage of resistance mechanisms, including 
both clinical and experimental data. It also includes mechanisms with indirect 
contributions to resistance. AMRFinderPlus focuses primarily on clinically relevant 
resistance genes, emphasizing core AMR genes that directly confer resistance.

## Installation

Both q2-amrfinderplus and q2-rgi aren't part of the MOSHPIT distribution and have to 
be installed additionally. 
To install q2-amrfinderplus, follow the steps described in the QIIME2 installation 
instructions for the 
[pathogenome distribution](https://docs.qiime2.org/2024.10/install/native/).
To install q2-rgi please follow these 
[installation instructions](https://github.com/bokulich-lab/q2-rgi?tab=readme-ov-file#installation).

## Data

In this tutorial we will use the same reads and the assembled sequences used in the 
end to end short tutorial. To run this tutorial you will need the assembled contigs 
and MAGs created in that tutorial. 