---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.11.5
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---
(quality-control)=
# Quality control
As with any other NGS experiment, metagenome data should be quality controlled before any downstream analysis. 
The filtering steps may include adapter removal, quality trimming, and filtering out low-quality reads. Moreover, 
depending on the sample type and preparation procedures, metagenomic reads may contain host DNA, which should be 
removed. Other QIIME 2 plugins already provide generalized functionality to address quality filtering/control of 
next-generation sequencing data - the MOSHPIT plugin suite expands on these by focusing more on host DNA removal
from metagenome data. The next sections contain a brief overview of the filtering steps which can be done using 
QIIME 2 and MOSHPIT.
