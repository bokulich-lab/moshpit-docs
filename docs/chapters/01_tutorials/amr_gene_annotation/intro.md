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

## Data

In this tutorial we will use the same reads and the assembled sequences used in the 
end to end short tutorial. To run this tutorial you will need the assembled contigs 
and MAGs created in that tutorial. 