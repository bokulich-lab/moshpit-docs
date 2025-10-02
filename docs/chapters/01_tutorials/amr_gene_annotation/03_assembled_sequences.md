---
authors:
- vr
---
# AMR gene annotation of assembled sequences

In this section we will focus on AMR gene annotation of assembled sequences using two 
different 
tools: 
AMRFinderPlus and RGI. 

## Approach 1: AMRFinderPlus

First we need to download the AMRFinderPlus database with the `fetch-amrfinderplus-db` 
action. It automatically downloads the newest version of the database.

```{code-cell}
qiime amrfinderplus fetch-amrfinderplus-database \
    --o-amrfinderplus-db amrfinderplus-db \
    --verbose
```

To annotate assembled sequences with AMR genes, we first have to perform gene 
prediction. This can be done with the action `predict-prodigal` from the package 
q2-annotate. 

```{code-cell}
mosh annotate predict-genes-prodigal \
  --i-sequences contigs.qza \
  --o-loci loci_contigs.qza \
  --o-genes genes_contigs.qza \
  --o-proteins proteins_contigs.qza \
  --verbose
```

The database and the predicted proteins and loci can now be used to annotate the 
contigs, 
with the `annotate` action. The action uses assembled sequences (`SampleData[MAGs]`, 
`SampleData[Contigs]` and `FeatureData[MAG]`), proteins (`GenomeData[Proteins]`) and 
loci (`GenomeData[Loci]`) as inputs. It is recommended to run the annotation in the 
combined mode with sequences, predicted proteins and predicted loci, as this is the 
most sensitive.
The outputs are the amr annotations in form of a TXT file and the detected AMR gene and 
protein sequences in FASTA format. Also provided are annotations called "all mutations", 
they contain the genotypes at all locations screened for point mutations if an organism 
is specified with the `organism` parameter. For this run the all mutations output will 
be empty. For more information on the outputs or parameters please run `qiime 
amrfinderplus annotate --help` and consult the 
[AMRFinderPlus documentations](https://github.com/ncbi/amr/wiki/Running-AMRFinderPlus).

```{code-cell}
qiime amrfinderplus annotate \
  --i-amrfinderplus-db amrfinderplus-db \
  --i-sequences contigs.qza \
  --i-proteins proteins_contigs.qza \
  --i-loci loci_contigs.qza \
  --o-amr-annotations amr_annotations_amrfinderplus.qza \
  --o-amr-all-mutations amr_all_mutations_amrfinderplus.qza \
  --o-amr-genes amr_genes_amrfinderplus.qza \
  --o-amr-proteins amr_proteins_amrfinderplus.qza \
  --verbose
```

## Approach 2: RGI

The plugin q2-rgi is not part of the MOSHPIT distribution because of dependency issues. 
It has to be installed with an older qiime version in a separate environment. Refer to 
the [installation instructions](https://github.com/bokulich-lab/q2-rgi?tab=readme-ov-
file#installation).

To annotate sequences with the RGI tool, we first have to download the CARD database 
with the `fetch-card-db` action. It automatically 
downloads  the newest version of the CARD, WildCARD and Kmer databases and does all 
necessary preprocessing. The CARD and WildCARD databases are combined into a single 
artifact, while the K-mer database is stored in a separate artifact. The CARD and 
WildCARD databases are used to annotate reads and MAGs with ARGs. The K-mer database is 
used to predict the taxonomic origin of ARGs.

```{code-cell}
qiime rgi fetch-card-database \
  --o-card_db ./cache:card_db.qza \
  --o-kmer-db ./cache:kmer_db.qza \
  --verbose
```

To annotate MAGs with ARGs from CARD we can use the `annotate-mags-card` action. We can 
choose from two different alignment tools. While 
[DIAMOND](https://www.nature.com/articles/nmeth.3176) is faster, 
[BLAST](https://blast.ncbi.nlm.nih.gov/Blast.cgi) is more sensitive. By default, 
annotations include perfect matches (100% sequence identity) and strict matches (>95% 
sequence identity). loose matches (>95% sequence identity) are optional and can be 
added if preferred. Please run `qiime rgi annotate --help` and refer to the 
[RGI](https://github.com/arpcard/rgi) documentation for more information about the 
parameters. The outputs include the annotations in form of a TXT file and as a feature 
table.

```{code-cell}
qiime rgi annotate-mags-card \
  --i-mag ./cache:mags_derep_50 \
  --i-card-db ./cache:card_db \
  --p-alignment-tool BLAST \
  --o-amr_annotations ./cache:amr_annotations_rgi_mags.qza \
  --o-feature_table ./cache:feature_table_rgi_mags.qza \
  --verbose
```
