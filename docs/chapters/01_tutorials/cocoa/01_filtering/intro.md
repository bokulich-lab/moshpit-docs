---
authors:
- mz
---
(quality-control)=
# Quality control

:::{seealso} Workflow Guide
For a reference overview of QC actions at every stage of the pipeline (reads, assembly, MAGs, and taxonomy), see [Quality control at every step](qc-every-step).
:::

As with any other NGS experiment, metagenome data should be quality controlled before any downstream analysis. 
The filtering steps may include adapter removal, quality trimming, and filtering out low-quality reads. Moreover, 
depending on the sample type and preparation procedures, metagenomic reads may contain host DNA, which should be 
removed. Other QIIME 2 plugins already provide generalized functionality to address quality filtering/control of 
next-generation sequencing data — the MOSHPIT plugin suite expands on these by focusing more on host DNA removal
from metagenome data. The next sections contain a brief overview of the filtering steps which can be done using 
QIIME 2 and MOSHPIT.
