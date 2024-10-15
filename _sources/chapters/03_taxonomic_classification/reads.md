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
(kraken-reads)=
# Taxonomic classification of reads
In this section we will focus on the taxonomic classification of shotgun metagenomic reads using two different tools: Kraken 2 and Kaiju. 
We will use the data which we got from the steps described in the [data retrieval section](../00_data_retrieval.md).

## Approach 1: Kraken 2
Before we can use Kraken 2, we need to build or download a database. We will use the `build-kraken-db` action to fetch the PlusPF database 
from [here](https://benlangmead.github.io/aws-indexes/k2) - this database covers RefSeq sequences for archaea, bacteria, viral, plasmid, 
human, UniVec_Core, protozoa and fungi.
```{code-cell}
qiime moshpit build-kraken-db \
  --p-collection pluspf \
  --o-kraken2-database ./cache:kraken2_db \
  --o-bracken-database ./cache:bracken_db \
```

We can now use the `classify-kraken2` command to run Kraken2 using the paired-end reads as a query and the PlusPF database retrieved in the previous step:
```{code-cell}
qiime moshpit classify-kraken2 \
  --i-seqs ./cache:reads_filtered \
  --i-kraken2-db ./cache:kraken2_db \
  --p-threads 72 \
  --p-confidence 0.5 \
  --p-memory-mapping False \
  --p-report-minimizer-data \
  --o-reports ./cache:kraken_reports_reads \
  --o-hits ./cache:kraken_hits_reads
  --verbose
```

```{seealso}
[Bracken](https://ccb.jhu.edu/software/bracken/) is a related tool that additionally estimates relative abundances of species or genera to adjust for
genome size which the reads originated from. In order to use this tool we need the Bracken database that was fetched in the first step.
```

```{code-cell}
qiime moshpit estimate-bracken \
  --i-kraken-reports ./cache:kraken_reports_reads \
  --i-bracken-db ./cache:bracken_db \
  --p-threshold 5 \
  --p-read-len 150 \
  --o-taxonomy ./cache:bracken_taxonomy \
  --o-table ./cache:bracken_ft \
  --o-reports ./cache:bracken_reports
```

To remove the unclassified read fraction we can use the `filter-table` action from the `taxa` QIIME 2 plugin:
```{code-cell}
qiime taxa filter-table \
  --i-table ./cache:bracken_ft \
  --i-taxonomy ./cache:bracken_taxonomy \
  --p-exclude Unclassified \
  --o-filtered-table ./cache:bracken_ft_filtered
```

## Approach 2: Kaiju
Similarly to Kraken 2, Kaiju requires a reference database to perform the classification. We will use the `fetch-kaiju-db` 
action to download the [nr_euk](https://bioinformatics-centre.github.io/kaiju/downloads.html) database that includes both, 
prokaryotes and eukaryotes (more info on the taxa [here](https://github.com/bioinformatics-centre/kaiju/blob/master/util/kaiju-taxonlistEuk.tsv)).
```{code-cell}
qiime moshpit fetch-kaiju-db \
  --p-database-type nr_euk \
  --o-database ./cache:kaiju_nr_euk
```

We run Kaiju with the confidence of 0.1 using the paired-end reads as a query and the database artifact that was generated in the previous step:
```{code-cell}
qiime moshpit classify-kaiju \
  --i-seqs ./cache:reads_paired \
  --i-db ./cache:kaiju_nr_euk \
  --p-z 16 \
  --p-c 0.1 \
  --o-taxonomy ./cache:kaiju_taxonomy \
  --o-abundances ./cache:kaiju_ft
```

Finally, we filter the table to remove the unclassified reads:
```{code-cell}
qiime taxa filter-table \
  --i-table ./cache:kaiju_ft \
  --i-taxonomy ./cache:kaiju_taxonomy \
  --p-exclude Unclassified \
  --o-filtered-table ./cache:kaiju_ft_filtered
```
