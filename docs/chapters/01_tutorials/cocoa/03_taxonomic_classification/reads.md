---
authors:
- rhv
- mz
---
(kraken-reads)=
# Taxonomic classification of reads
In this section we will focus on the taxonomic classification of shotgun metagenomic reads using two different tools: Kraken 2 and Kaiju. 
We will use the data obtained in the [data retrieval section](../00_data_retrieval.md).

## Approach 1: Kraken 2
Before we can use Kraken 2, we need to build or download a database. We will use the `build-kraken-db` action to fetch the PlusPF database 
from [here](https://benlangmead.github.io/aws-indexes/k2) - this database covers RefSeq sequences for archaea, bacteria, viral, plasmid, 
human, UniVec_Core, protozoa and fungi.
```{code} bash
mosh annotate build-kraken-db \
    --p-collection pluspf \
    --o-kraken2-db cache:kraken2_db \
    --o-bracken-db cache:bracken_db \
```

We can now use the `classify-kraken2` command to run Kraken2 using the paired-end reads as a query and the PlusPF database retrieved in the previous step:
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs cache:reads_filtered \
    --i-db cache:kraken2_db \
    --p-threads 72 \
    --p-confidence 0.5 \
    --p-memory-mapping False \
    --p-report-minimizer-data \
    --o-reports cache:kraken_reports_reads \
    --o-outputs cache:kraken_hits_reads
    --verbose
```

::::{aside}
```{seealso}
[Bracken](https://ccb.jhu.edu/software/bracken/) is a related tool that additionally estimates relative abundances of species or genera to adjust for
the genome size the organisms from which each read originated. In order to use this tool we need the Bracken database that was fetched in the first step.
```
::::

```{code} bash
mosh annotate estimate-bracken \
    --i-kraken2-reports cache:kraken_reports_reads \
    --i-db cache:bracken_db \
    --p-threshold 5 \
    --p-read-len 150 \
    --o-taxonomy cache:bracken_taxonomy \
    --o-table cache:bracken_ft \
    --o-reports cache:bracken_reports
```

To remove the unclassified read fraction we can use the `filter-table` action from the `q2-taxa` QIIME 2 plugin:
```{code} bash
mosh taxa filter-table \
    --i-table cache:bracken_ft \
    --i-taxonomy cache:bracken_taxonomy \
    --p-exclude Unclassified \
    --o-filtered-table cache:bracken_ft_filtered
```

## Approach 2: Kaiju
Similarly to Kraken 2, Kaiju requires a reference database to perform taxonomic classification. We will use the `fetch-kaiju-db` 
action to download the [nr_euk](https://bioinformatics-centre.github.io/kaiju/downloads.html) database that includes both 
prokaryotes and eukaryotes (more info on the taxa [here](https://github.com/bioinformatics-centre/kaiju/blob/master/util/kaiju-taxonlistEuk.tsv)).
```{code} bash
mosh annotate fetch-kaiju-db \
    --p-database-type nr_euk \
    --o-db cache:kaiju_nr_euk
```

We run Kaiju with the confidence of 0.1 using the paired-end reads as a query and the database artifact that was generated in the previous step:
```{code} bash
mosh annotate classify-kaiju \
    --i-seqs cache:reads_paired \
    --i-db cache:kaiju_nr_euk \
    --p-z 16 \
    --p-c 0.1 \
    --o-taxonomy cache:kaiju_taxonomy \
    --o-abundances cache:kaiju_ft
```

Finally, we filter the table to remove the unclassified reads:
```{code} bash
mosh taxa filter-table \
    --i-table cache:kaiju_ft \
    --i-taxonomy cache:kaiju_taxonomy \
    --p-exclude unclassified,belong,cannot \
    --o-filtered-table cache:kaiju_ft_filtered
```

## Visualization
You can try to generate a taxa bar plot with either of these results now! We will continue with the Kaiju results - to
generate a taxa bar plot, you can run:
```{code} bash
mosh taxa barplot \
    --i-table cache:kaiju_ft_filtered \
    --i-taxonomy cache:kaiju_taxonomy \
    --m-metadata-file metadata.tsv \
    --o-visualization results/kaiju_barplot.qzv
```
Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/kaiju-filtered.qzv).
