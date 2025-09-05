# 🛠️ End-to-end MAG reconstruction

Analysis of real-world shotgun metagenome data is usually time-consuming and very resource-intensive. For this reason, 
in this tutorial we will try a simplified analysis of shotgun metagenomes obtained by simulation of paired-end reads from 
a mock community with known composition.

We will start by assembling metagenomes using paired-end reads obtained for four samples from a mock community. 
We have pre-selected some species and generated reads from their genomes - it will be your task to assemble genomes from 
those reads and identify which microorganisms they belong to.

## Data retrieval

The reads generated for this tutorial can be downloaded using the following command:
```{code} bash
curl -sL https://polybox.ethz.ch/index.php/s/ZLXk7XgzHaiWXFz/download > reads.qza
```