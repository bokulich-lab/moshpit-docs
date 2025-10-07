---
authors:
- vr
---
# MAG annotation

In this section we will focus on AMR gene annotation of assembled sequences using 
the plugin q2-amrfinderplus.

## Fetch database

First we need to download the AMRFinderPlus database with the `fetch-amrfinderplus-db` 
action. It automatically downloads the newest version of the database.

```{code} bash
qiime amrfinderplus fetch-amrfinderplus-database \
    --o-amrfinderplus-db amrfinderplus-db \
    --verbose
```

## Predict genes

To annotate assembled sequences with AMR genes, we first have to perform gene 
prediction. This can be done with the action `predict-prodigal` from the package 
q2-annotate. 

```{code} bash
mosh annotate predict-genes-prodigal \
  --i-sequences contigs.qza \
  --o-loci loci_contigs.qza \
  --o-genes genes_contigs.qza \
  --o-proteins proteins_contigs.qza \
  --verbose
```

## Annotate contigs

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

```{code} bash
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