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
(data-import)=
# Importing data from other tools
The MOSHPIT pipeline allows you to start working directly with the NGS reads, which you can take through various analysis, 
like contig assembly, binning, and annotation. However, if you have already performed some of these steps outside of QIIME 2, 
you can import the results into an appropriate QIIME 2 artifact and continue from there. Below you can see some examples and 
use cases where this may be relevant.

## Working with exisiting contigs
In case you already have contigs assembled from your metagenomic data, you can import them into a `SampleData[Contigs]` 
artifact. This should not differ much from the typical import process (see [here](https://docs.qiime2.org/2024.10/tutorials/importing/) 
for more details on importing data), but the command may look like:
```bash
qiime tools cache-import \
    --cache ./cache \
    --key contigs \
    --type "SampleData[Contigs]" \
    --input-path ./<directory with contig FASTA files>
```
Some actions in the MOSHPIT pipeline assume that contig IDs are unique across your entire sample set. If this is not the case, 
you may use the `qiime assembly rename-contigs` action to rename contigs with unique identifiers:
```bash
qiime assembly rename-contigs \
    --i-contigs ./cache:contigs \
    --p-uuid-type shortuuid \
    --o-renamed-contigs ./cache:contigs_renamed
```
From here, you should be able to continue with the rest of the MOSHPIT pipeline as described in our tutorials.

## Working with existing MAGs
You may also be interested in continuing your analysis with MAGs that you have already recovered using other tools. 
In this case, you can import the MAGs into a `SampleData[MAGs]` (non-dereplicated) or `FeatureData[MAG]` (dereplicated) 
artifact. Before you do that, you will need to rename each MAG's FASTA file using the [UUID4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) 
format: this is required to ensure that MAG IDs are unique across your entire sample set. Here is a sample Python script 
which could be used for that purpose:
```python
import os
from uuid import uuid4
path = 'path/to/your/mag/directory/'

for file in os.listdir(path):
    os.rename(os.path.join(path, file), os.path.join(path, f'{uuid4()}.fa')))
```
Once you have renamed the MAGs, you can import them into a QIIME 2 artifact:
```bash
qiime tools cache-import \
    --cache ./cache \
    --key mags \
    --type "SampleData[MAGs]" \
    --input-path ./<directory with MAG FASTA files per sample>
```
for MAGs-per-sample, or:
```bash
qiime tools cache-import \
    --cache ./cache \
    --key mags \
    --type "FeatureData[MAG]" \
    --input-path ./<directory with MAG FASTA files>
```
for dereplicated MAGs. From here, you should be able to continue with the rest of the MOSHPIT pipeline as described in our tutorials.

## Importing other data
If you have other data that you would like to import into QIIME 2, you can use the `qiime tools cache-import` command - no 
additional steps should be required. For example, you can import a set of Kraken 2 reports into a `SampleData[Kraken2Report % Properties('reads')]` 
like this:
```bash
qiime tools cache-import \
    --cache ./cache \
    --key kraken2_reports_reads \
    --type "SampleData[Kraken2Report % reads]" \
    --input-path ./<directory with Kraken 2 reports>
```

```{note}
Remember: you can import any existing data into QIIME 2 artifacts, as long as it matches the format required by the respective 
QIIME 2 semantic type.
```
