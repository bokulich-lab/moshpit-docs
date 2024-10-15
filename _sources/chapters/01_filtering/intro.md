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
Just like any other NGS experiment, shotgun metagenomics data should be quality controlled before any downstream analysis. 
The filtering steps may include adapter removal, quality trimming, and filtering out low-quality reads. Moreover, metagenomic
reads may contain host DNA, which should be removed. QIIME 2 provides functionality to address some of those issues - the 
MOSHPIT plugin suite only expands on those by focusing more on host DNA removal. The next sections contain a brief overview 
of the filtering steps which can be done using QIIME 2 and MOSHPIT.
