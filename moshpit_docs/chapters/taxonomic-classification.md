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

# Taxonomic classification

## Read-Based Classification Overview

**What is the goal of read-Based classification?**

 Read-based classification is commonly used to determine the taxonomic groups present within a given sample. This technique is useful for assessing the biodiversity or the composition of microbial communities by assigning DNA reads to known organisms. One significant advantage of read-based classification is that it allows for the classification of all reads, including those that may not be directly involved in downstream analyses (e.g. assemblies or MAGs).

**Key Factors Influencing Read Classification:**

The outcome of read classification is heavily influenced by the selection of reference databases. These databases vary in size, quality, and scope, which means that the more comprehensive and accurate the reference database is, the more accurate the classification of reads will be. Some databases might be specific to certain taxonomic groups, while others could provide a broader reference, potentially affecting the results depending on the sample type and research goals.

**Types of Read-Based Classification:**

 - **DNA-to-DNA Classification (BLASTn-like):** This type compares DNA sequences from the sample directly to DNA sequences from reference databases. It is ideal for detecting organisms with available genomic sequences and is more accurate but may miss organisms that are poorly represented in genomic databases.
 - **DNA-to-Protein Classification (BLASTx-like):** This classification translates DNA reads into potential protein sequences and compares them to known protein databases. This is useful for identifying organisms based on conserved protein functions, which can be helpful when nucleotide sequences are too divergent to yield results through DNA-to-DNA methods.
 - **Marker-Based Classification:** Marker-based classification focuses on specific genetic markers that are conserved within certain taxonomic groups. These markers are known for their taxonomic relevance, allowing more precise identification at various taxonomic levels.


```{seealso}
For more information and a benchmark, consult [Ye et al., 2019](https://www.cell.com/cell/fulltext/S0092-8674(19)30775-5?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0092867419307755%3Fshowall%3Dtrue).
```


### Kraken 2: DNA-to-DNA Classification Tool

 Kraken 2 is a DNA-to-DNA classification tool that assigns taxonomic labels to reads by directly comparing k-mers (short DNA sequence fragments of a fixed length, typically 31 base pairs) from the query read to a database of known sequences. Kraken 2 classifies the read based on the majority of k-mer matches within the read, providing fast and accurate taxonomic classification.


```{seealso}
For more information on Kraken 2, consult [Wood et al., 2019](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-019-1891-0).
```

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

```{note}
To use Kraken we need to download a reference database, in this case we select the pluspf database which contains the Standard plus Refeq protozoa & fungi sequences [(more info)](https://benlangmead.github.io/aws-indexes/k2).
```

```{code-cell}
qiime moshpit build-kraken-db \
  --p-collection pluspf \
  --o-kraken2-database kraken2-database-0.qza \
  --o-bracken-database bracken-database-0.qza \
  --verbose
```

We use the classify-kraken2 command to run kraken2 using the paired reads as a query and the pluspf artifact that we generated.

```{code-cell}
qiime moshpit classify-kraken2 \
  --i-seqs paired-reads-0.qza \
  --i-kraken2-db kraken2-database-0.qza \
  --p-threads 72 \
  --p-confidence 0.5 \
  --p-minimum-base-quality 0 \
  --p-no-memory-mapping \
  --p-minimum-hit-groups 2 \
  --p-report-minimizer-data \
  --o-reports reports-0.qza \
  --verbose
```

```{seealso}
[Bracken](https://ccb.jhu.edu/software/bracken/) is a related tool that additionally estimates relative abundances of species or genera.
In order to use this tool we need the bracken database that was generated before.
```

```{code-cell}
qiime moshpit estimate-bracken \
  --i-kraken-reports reports-0.qza \
  --i-bracken-db bracken-database-0.qza \
  --p-threshold 5 \
  --p-read-len 150 \
  --p-level S \
  --o-taxonomy taxonomy-0.qza \
  --o-table table-0.qza \
  --o-reports XX_reports
```

Finally we filter the table to remove the unclassified read fraction.

```{code-cell}
qiime taxa filter-table \
  --i-table table-0.qza \
  --i-taxonomy taxonomy-0.qza \
  --p-exclude Unclassified \
  --p-query-delimiter , \
  --p-mode contains \
  --o-filtered-table filtered-table-0.qza
```

### Kaiju: Protein-Based Classification Tool
 Kaiju compares reads by translating DNA sequences into protein sequences (BLASTx-like). This allows Kaiju to identify organisms accurately when nucleotide sequences are too divergent to be identified with DNA-based methods. Kaiju uses a fast exact matching algorithm based on Burrows-Wheeler Transform (BWT) and FM-index to align translated DNA reads against a reference database of protein sequences.

 
```{seealso}
For more information on Kaiju, consult [Menzel et al., 2016](https://www.nature.com/articles/ncomms11257).
```

Firstly we use the q2-fondue plugin to download the reads from a preexisting artifact containing the SRA ids. For this step it is necessary to provide an email address.

```{code-cell}
qiime fondue get-all \
  --i-accession-ids ncbi-accession-i-ds-0.qza \
  --p-email YOUR.EMAIL@domain.com \
  --p-n-jobs 5 \
  --p-retries 5 \
  --p-log-level DEBUG \
  --o-paired-reads paired-reads-0.qza \
  --o-metadata XX_metadata \
  --o-single-reads XX_single_reads \
  --o-failed-runs XX_failed_runs
```

Then we download the reference [nr_euk](https://bioinformatics-centre.github.io/kaiju/downloads.html) database for kaiju that includes both prokaryotes and eukaryotes (more info on the [taxa](https://github.com/bioinformatics-centre/kaiju/blob/master/util/kaiju-taxonlistEuk.tsv)).

```{code-cell}
qiime moshpit fetch-kaiju-db \
  --p-database-type nr_euk \
  --o-database database-0.qza
```

We run kaiju enabling greedy mode using the paired reads as a query and the nr_euk artifact that we generated.

```{code-cell}
qiime moshpit classify-kaiju \
  --i-seqs paired-reads-0.qza \
  --i-db database-0.qza \
  --p-a greedy \
  --p-evalue 0.01 \
  --p-r species \
  --o-taxonomy taxonomy-0.qza \
  --o-abundances XX_abundances
```

Finally we filter the table to remove the unclassified read fraction.

```{code-cell}
qiime taxa filter-table \
  --i-table feature-table-frequency-0.qza \
  --i-taxonomy taxonomy-0.qza \
  --p-exclude unclassified,belong,cannot \
  --p-query-delimiter , \
  --p-mode contains \
  --o-filtered-table filtered-table-0.qza
  ```

### Kraken 2: MAG Classification
Kraken can also be used to obtain a classification of metagenome assembled genomes (MAGs), in this example we use this tool to classify a subset of dereplicated MAGs.

```{code-cell}
qiime moshpit classify-kraken2 \
  --i-seqs dereplicated-mags-0.qza \
  --i-kraken2-db kraken2-database-0.qza \
  --p-threads 72 \
  --p-confidence 0.5 \
  --p-minimum-base-quality 0 \
  --p-no-memory-mapping \
  --p-minimum-hit-groups 2 \
  --p-no-quick \
  --p-report-minimizer-data \
  --o-hits hits-0.qza \
  --o-reports reports-0.qza
  ```

Finally we create a taxonomy table for the MAGs.

```{code-cell}
qiime moshpit kraken2-to-mag-features \
  --i-reports reports-0.qza \
  --i-hits hits-0.qza \
  --p-coverage-threshold 0.1 \
  --o-taxonomy taxonomy-0.qza
 ```
