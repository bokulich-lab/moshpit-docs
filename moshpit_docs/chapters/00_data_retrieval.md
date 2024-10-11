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


First we use the q2-fondue plugin to download the reads from a preexisting artifact containing the SRA ids. For this step it is necessary to provide an email address.

```{code-cell}
qiime fondue get-all \
  --i-accession-ids ncbi-accession-i-ds-0.qza \
  --p-email YOUR.EMAIL@domain.com \
  --p-n-jobs 5 \
  --p-retries 5 \
  --o-paired-reads paired-reads-0.qza \
  --o-metadata XX_metadata \
  --o-single-reads XX_single_reads \
  --o-failed-runs XX_failed_runs
```