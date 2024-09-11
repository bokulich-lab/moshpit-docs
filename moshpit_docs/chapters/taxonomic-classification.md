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

> **What is the goal of read-Based classification?**
>
> Read-based classification is commonly used to determine the taxonomic groups present within a given sample. This technique is useful for assessing the biodiversity or the composition of microbial communities by assigning DNA reads to known organisms. One significant advantage of read-based classification is that it allows for the classification of all reads, including those that may not be directly involved in downstream analyses (e.g. assemblies or MAGs).
>
> **Key Factors Influencing Read Classification:**
>
> The outcome of read classification is heavily influenced by the selection of reference databases. These databases vary in size, quality, and scope, which means that the more comprehensive and accurate the reference database is, the more accurate the classification of reads will be. Some databases might be specific to certain taxonomic groups, while others could provide a broader reference, potentially affecting the results depending on the sample type and research goals.
>
> **Types of Read-Based Classification:**
>
> - **DNA-to-DNA Classification (BLASTn-like):** This type compares DNA sequences from the sample directly to DNA sequences from reference databases. It is ideal for detecting organisms with available genomic sequences and is more accurate but may miss organisms that are poorly represented in genomic databases.
> - **DNA-to-Protein Classification (BLASTx-like):** This classification translates DNA reads into potential protein sequences and compares them to known protein databases. This is useful for identifying organisms based on conserved protein functions, which can be helpful when nucleotide sequences are too divergent to yield results through DNA-to-DNA methods.
> - **Marker-Based Classification:** Marker-based classification focuses on specific genetic markers that are conserved within certain taxonomic groups. These markers are known for their taxonomic relevance, allowing more precise identification at various taxonomic levels.
>   
>   For more information and a benchmark, consult [Ye et al., 2019](https://www.cell.com/cell/fulltext/S0092-8674(19)30775-5?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0092867419307755%3Fshowall%3Dtrue).

### Kraken 2: DNA-to-DNA Classification Tool
>
> Kraken 2 is a DNA-to-DNA classification tool that assigns taxonomic labels to reads by directly comparing k-mers (short DNA sequence fragments of a fixed length, typically 31 base pairs) from the query read to a database of known sequences. Kraken 2 classifies the read based on the majority of k-mer matches within the read, providing fast and accurate taxonomic classification.
>
> For more information on Kraken 2, consult [Wood et al., 2019](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-019-1891-0).

```{code-cell}
print(2 + 2)
```

### Kaiju: Protein-Based Classification Tool
> Kaiju compares reads by translating DNA sequences into protein sequences (BLASTx-like). This allows Kaiju to identify organisms accurately when nucleotide sequences are too divergent to be identified with DNA-based methods. Kaiju uses a fast exact matching algorithm based on Burrows-Wheeler Transform (BWT) and FM-index to align translated DNA reads against a reference database of protein sequences.
>
> For more information on Kaiju, consult [Menzel et al., 2016](https://www.nature.com/articles/ncomms11257).

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

```{code-cell}
qiime moshpit fetch-kaiju-db \
  --p-database-type nr_euk \
  --o-database database-0.qza
```

```{code-cell}
qiime moshpit classify-kaiju \
  --i-seqs paired-reads-0.qza \
  --i-db database-0.qza \
  --p-z 16 \
  --p-a greedy \
  --p-e 3 \
  --p-m 11 \
  --p-s 65 \
  --p-evalue 0.01 \
  --p-x \
  --p-r species \
  --p-c 0.1 \
  --p-no-exp \
  --p-no-u \
  --o-taxonomy taxonomy-0.qza \
  --o-abundances XX_abundances
```

```{code-cell}
qiime taxa filter-table \
  --i-table feature-table-frequency-0.qza \
  --i-taxonomy taxonomy-0.qza \
  --p-exclude unclassified,belong,cannot \
  --p-query-delimiter , \
  --p-mode contains \
  --o-filtered-table filtered-table-0.qza
  ```
