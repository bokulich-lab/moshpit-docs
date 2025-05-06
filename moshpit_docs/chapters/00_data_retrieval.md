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
(data-retrieval)=
# Data retrieval
The dataset used in this tutorial is available through the [NCBI Sequence Read Archive](https://www.ncbi.nlm.nih.gov/sra) (SRA). 
To retrieve it we will use the [q2-fondue plugin](https://github.com/bokulich-lab/q2-fondue) for programmatic access to 
sequences and metadata from SRA; we only need to provide a list of accession IDs to download - q2-fondue will take care of 
the rest.

```{note}
You need to provide an e-mail address when running this command - this is required by the NCBI as a way to 
ensure they can contact you in case of any issues.
```

- download the files containing all the accession IDs and corresponding metadata:
```{code-cell}
wget -O ./ids.tsv https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/ids.tsv
```
```{code-cell}
wget -O ./metadata.tsv https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/metadata.tsv
```
- import the file into a QIIME 2 artifact:
```{code-cell}
mosh tools cache-import \
    --type 'NCBIAccessionIDs' \
    --input-path ./ids.tsv \
    --cache ./cache \
    --key ids
```
- run the `get-all` action from the `fondue` plugin:
```{code-cell}
mosh fondue get-all \
    --i-accession-ids ./cache:ids \
    --p-email YOUR.EMAIL@domain.com \
    --p-threads 5 \
    --p-retries 5 \
    --o-paired-reads ./cache:reads_paired \
    --o-metadata ./cache:metadata \
    --o-single-reads ./cache:reads_single \
    --o-failed-runs ./cache:failed_runs \
    --verbose
```