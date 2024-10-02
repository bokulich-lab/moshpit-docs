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

# Recovery of MAGs

## Background
Metagenome-assembled genomes (MAGs) are genomes reconstructed directly from environmental DNA samples without the need for culturing organisms in the laboratory. This approach allows researchers to explore the genetic makeup of microbial communities in various environments, providing insights into the diversity, functions, and ecological roles of uncultured microorganisms. Recovering MAGs involves assembling sequencing reads into contigs, binning contigs into draft genomes, and evaluating their quality.

This workflow describes a step-by-step process for metagenome-assembled genome (MAG) recovery using `qiime2` and other tools. Each command includes explanations of the parameters used. 

```{tip}
Genome assembly can be highly resource-intensive. Ensure that your system has sufficient CPU and memory resources before running these commands.
```

*For more information on each tool, refer to their official documentation*:

- MEGAHIT: [https://github.com/voutcn/megahit](https://github.com/voutcn/megahit)
- SPAdes: [http://cab.spbu.ru/software/spades/](http://cab.spbu.ru/software/spades/)
- QUAST: [http://quast.sourceforge.net/quast](http://quast.sourceforge.net/quast)
- MetaBAT: [https://bitbucket.org/berkeleylab/metabat/src/master/](https://bitbucket.org/berkeleylab/metabat/src/master/)
- BUSCO: [https://busco.ezlab.org/](https://busco.ezlab.org/)
- Sourmash: [https://sourmash.readthedocs.io/](https://sourmash.readthedocs.io/)
- Kraken2: [https://github.com/DerrickWood/kraken2/wiki](https://github.com/DerrickWood/kraken2/wiki)
- QIIME 2: [https://qiime2.org/](https://qiime2.org/)

## Assemble contigs with MEGAHIT
The first step in recovering metagenome-assembled genomes (MAGs) is genome assembly itself. There are many genome assemblers available, two of which you can use through our QIIME 2 plugin - here, we will use MEGAHIT. MEGAHIT takes short DNA sequencing reads, constructs a simplified De Bruijn graph, and generates longer contiguous sequences called contigs, providing valuable genetic information for the next steps of our analysis.

- The `--p-num-partition` specifies the number of partitions to split the dataset into for parallel processing during assembly.
- The `--p-presets` specifies the preset mode for MEGAHIT. In this case, it's set to "meta-sensitive" for metagenomic data.
- The `--p-cpu-threads` specifies the number of CPU threads to use during assembly.

```{code-cell}
qiime assembly assemble-megahit \
  --i-seqs paired-reads-0.qza \
  --p-presets "meta-sensitive" \          
  --p-num-cpu-threads 24 \            
  --p-num-partitions 4 \            
  --p-min-contig-len 200 \ 
  --p-coassemble False \    # Co-assembly is disabled for this example
  --o-contigs contigs-0.qza \
  --verbose   
```
- Alternatively, you can also use qiime assembly assemble-spades to assemble contigs with `SPAdes`.
- `p-coassemble` parameter can be TRUE if you wish to co-assemble reads into contigs from all samples.

```{note}
Make sure to allocate appropriate CPU and memory resources based on your system's capacity.
```
## Contig QC with QUAST
Once the reads are assembled into contigs, we can use QUAST to evaluate the quality of our assembly. There are many metrics which can be used for that purpose but here we will focus on the two most popular metrics:

- **N50**: represents the contiguity of a genome assembly. It's defined as the length of the contig (or scaffold) at which 50% of the entire genome is covered by contigs of that length or longer - the higher this number, the better.
- **L50**: represents the number of contigs required to cover 50% of the genome's total length - the smaller this number, the better.

In addition to calculating generic statistics like N50 and L50, QUAST will try to identify potential genomes from which the analyzed contigs originated. Alternatively, we can provide it with a set of reference genomes we would like it to run the analysis against using `--i-references`.

```{code-cell}
qiime assembly evaluate-contigs \
    --i-contigs contigs-0.qza  \
    --p-threads 128 \
    --p-memory-efficient \
    --o-visualization contigs-0.qzv \ 
    --verbose
```

## Index contigs
In this step, we generate an index for the assembled contigs. This index is required for mapping reads to the contigs later. Various parameters control the size and structure of the index, as well as resource usage.

```{code-cell}
qiime assembly index-contigs \
  --i-contigs contigs-0.qza \                       
  --p-threads 8 \                                  
  --o-index index-0.qza \
  --verbose                             
```

## Map reads to contigs
This step maps the input paired-end reads to the indexed contigs created in the previous step. We use various alignment settings to ensure optimal mapping, including local alignment mode and sensitivity settings.

```{code-cell}
qiime assembly map-reads-to-contigs \
  --i-indexed-contigs index-0.qza \                         
  --i-reads paired-reads-0.qza \                                                  
  --o-alignment-map alignment-map-0.qza \
  --verbose             
```

```{note}
As an optional parameter, you can request a desired number of partitions to split the contigs into using `--p-num-partitions`. Defaults to partitioning into individual samples.
```

## Bin contigs with METABAT
Binning contigs involves grouping assembled contigs into MAGs. This step uses Metabat to assign contigs based on co-abundance and other features, producing MAG files that represent putative genomes.

```{code-cell}
qiime moshpit bin-contigs-metabat \
  --i-contigs contigs-0.qza \                       
  --i-alignment-maps alignment-map-0.qza \         
  --p-num-threads 64 \                              
  --p-seed 100 \                                   
  --p-verbose \                                    
  --o-mags mags-0.qza \                             
  --o-contig-map contig-map-0.qza \                   
  --o-unbinned-contigs unbinned-contigs-0.qza \
  --verbose          
```
This tep generated a couple artifacts:

- `mags-0.qza`: these are our actual MAGS, per sample.
- `contig-map-0.qza`: this is a mapping between MAG IDs and IDs of contigs which belong to a given MAG.
- `unbinned-contigs-0.qza`: these are all the contigs that could not be assign to any particular MAG.
From now on, we will focus on the mags-0.qza

## Evaluate bins with BUSCO
This step evaluates the completeness and quality of the MAGs using the BUSCO tool, which checks for the presence of single-copy orthologs. The evaluation helps ensure the quality of the recovered MAGs.

```{code-cell}
qiime moshpit evaluate-busco \
  --i-bins mags-0.qza \                             
  --i-busco-db busco-db-0.qza \                     
  --p-lineage-dataset bacteria_odb10 \             
  --p-cpu 16 \                                     
  --o-visualization mags-qc-visualization-0.qzv \  
  --verbose                 
```

```{note}
 To examine our QIIME 2 Visualizations you can use QIIME 2 View (view.qiime2.org).
```

## Filter MAGs
This step filters the MAGs based on completeness. In this example, we filter out any MAGs with completeness below 50%. The filtering process ensures only high-quality genomes are kept for downstream analysis.

```{tip}
We recommed this step to be done before dereplication (as in this example), but we can also use the  dereplicated set and filter this one using `qiime moshpit filter-derep-mags`.
```

```{code-cell}
qiime moshpit filter-mags \
  --i-mags mags-0.qza \                             
  --m-metadata-file results-table-0.qza \           
  --p-where 'complete>50' \                        
  --p-no-exclude-ids \                              
  --p-on mag \                                     
  --o-filtered-mags filtered-mags-0.qza \
  --verbose           
```
## Compute MinHash signatures with Sourmash
In this step, Sourmash is used to compute MinHash signatures for the filtered MAGs. MinHash is a method used to compare large datasets efficiently by creating compressed representations of genomes.

```{code-cell}
qiime sourmash compute \
  --i-sequence-file filtered-mags-0.qza \           
  --p-ksizes 35 \                                  
  --p-scaled 10 \                                   
  --p-track-abundance \                             
  --o-min-hash-signature min-hash-signature-0.qza \
  --verbose
```
## Compare MinHash signatures
Here we compare the computed MinHash signatures to evaluate the similarity between the genomes. This step allows dereplication by identifying highly similar genomes.

```{code-cell}
qiime sourmash compare \
  --i-min-hash-signature min-hash-signature-0.qza \ 
  --p-ksize 35 \                                  
  --p-ignore-abundance \                           
  --o-compare-output compare-output-0.qza \
  --verbose         
```
## Dereplicate MAGs
This step dereplicates the filtered MAGs, ensuring that only unique MAGs are retained. Dereplication reduces redundancy by merging similar genomes based on a similarity threshold.

```{code-cell}
qiime moshpit dereplicate-mags \
  --i-mags filtered-mags-0.qza \                    
  --i-distance-matrix compare-output-0.qza \       
  --p-threshold 0.99 \                              # Similarity threshold for dereplication (99%)
  --o-dereplicated-mags dereplicated-mags-0.qza \   
  --o-feature-table dereplicated-mags-ft-0.qza  \
  --verbose              
```
## Get feature lengths
This step calculates the lengths of the dereplicated MAGs, which will be used in the next step to estimate abundance.

```{code-cell}
qiime moshpit get-feature-lengths \
  --i-features dereplicated-mags-ft-0.qza \              
  --o-lengths lengths-0.qza \ 
  --verbose                         
```
## Index dereplicated MAGs
This step indexes the dereplicated MAGs for read mapping. The index is necessary to efficiently map the input reads back to the MAGs.

```{code-cell}
qiime assembly index-derep-mags \
  --i-mags dereplicated-mags-0.qza \                  
  --p-threads 8 \  
  --p-seed 100 \                                   
  --o-index index-0.qza \
  --verbose                            
```
## Map reads to dereplicated MAGs
In this step, we map the input paired-end reads back to the dereplicated MAGs. This helps in calculating the abundance of each MAG in the sample.

```{code-cell}
qiime assembly map-reads \
  --i-index index-1.qza \                            
  --i-reads paired-reads-0.qza \   
  --p-threads 8 \  
  --p-seed 100 \                  
  --o-alignment-map alignment-map-0.qza \
  --verbose            
```
## Estimate MAG abundance
This step estimates the abundance of each MAG in the sample based on the read mapping results. 

- `metric` : for now, we support RPKM and TPM
- `min-mapq` : indicates the minimum required read mapping quality - for Bowtie2, 42 will allow only perfect matches to be retained
`- min-base-quality` : only keep alignments with this minimal Phred
quality score
- for more, see --help

```{code-cell}
qiime moshpit estimate-mag-abundance \
--i-mag-lengths lengths-0.qza \
--i-maps alignment-map-0.qza \
--p-threads 10 \
--p-metric tpm \
--p-min-mapq 42 \
--o-abundances mags-derep-0.qza \
--verbose
```

## Let's have a look at our estimated MAG abundance!
First we will use Kraken 2 to classify provided MAGs into taxonomic groups.

- The `--p-confidence` and `--p-minimum-base-quality` are deviations from kraken's defaults.
- The database used here is the `PlusPF` database, defined [here](https://benlangmead.github.io/aws-indexes/k2).
- The abbreviations in my `output-dir` are the database (`k2pf`), and shorthand for the values I set for confidence (`c60`) and minimum base quality (`mbq20`), respectively.

```{code-cell}
qiime moshpit classify-kraken2 \
  --i-seqs mags-derep-0.qza \
  --i-kraken2-db k2-plus-pf-kraken-db.qza \
  --p-threads 40 \
  --p-confidence 0.6 \
  --p-report-minimizer-data \
  --p-minimum-base-quality 20 \
  --o-reports kraken-k2pf-mags-derep-reports-0.qza \
  --o-hits kraken-k2pf-mags-derep-hits-0.qza \
  --verbose
```

Then we will convert a Kraken 2 report into a  generic taxonomy artifact for downstream analyses.

```{code-cell}
qiime moshpit kraken2-to-mag-features \
 --i-reports kraken-k2pf-mags-derep-reports-0.qza  \
 --i-hits kraken-k2pf-mags-derep-hits-0.qza  \
 --o-taxonomy kraken-k2pf-mags-derep-tax.qza \
 --verbose
```

Now we are ready to generate a taxa bar plot.

```{code-cell}
qiime taxa barplot \
 --i-table kraken-k2pf-mags-derep-reports-0.qza  \
 --i-taxonomy kraken-k2pf-mags-derep-tax-0.qza\
 --m-metadata-file metadata.qza \
 --o-visualization taxa-barplot-derep-mags-0.qzv \
 --verbose
```

```{note}
 To examine our QIIME 2 Visualizations you can use QIIME 2 View (view.qiime2.org).
```
