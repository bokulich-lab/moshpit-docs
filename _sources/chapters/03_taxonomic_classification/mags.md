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
# Taxonomic classification of MAGs
Kraken 2 can also be used to taxonomically classify metagenome-assembled genomes (MAGs). In this tutorial we use this
tool to classify a subset of dereplicated MAGs but the same approach can be used for the entire set of MAGs contained in 
the `SampleData[MAGs]` or `SampleData[Contigs]` artifacts.
```{code-cell}
mosh annotate classify-kraken2 \
    --i-seqs ./cache:mags_derep_50 \
    --i-kraken2-db ./cache:kraken2_db \
    --p-threads 72 \
    --p-confidence 0.5 \
    --p-memory-mapping False \
    --p-report-minimizer-data \
    --o-reports ./cache:kraken_reports_mags_derep_50 \
    --o-hits ./cache:kraken_hits_derep_50 \
    --verbose
```

We can now extract the taxonomy from the Kraken 2 reports using the `kraken2-to-mag-features` command:
```{code-cell}
mosh annotate kraken2-to-mag-features \
    --i-reports ./cache:kraken_reports_mags_derep_50 \
    --i-hits ./cache:kraken_hits_derep_50 \
    --p-coverage-threshold 0.1 \
    --o-taxonomy ./cache:mags_derep_taxonomy_50
 ```
