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
functionalities of [AMRFinderPlus](https://doi.org/10.1038/s41598-021-91456-0) and 
[q2-rgi](https://github.com/bokulich-lab/q2-rgi) that uses the 
[RGI](https://doi.org/10.1093/nar/gkac920) tool.

## Data

To run this tutorial you will need the [reads, contigs](assembly) and [MAGs](binning) 
created in 
the 
end-to-end MAG reconstruction tutorial.