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

This workflow describes a step-by-step process for metagenome-assembled genome (MAG) recovery using `qiime2` and other tools. Each command includes explanations of the parameters used. 

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
  --o-contigs contigs-0.qza     
```

Alternatively, you can also use qiime assembly assemble-spades to assemble contigs with SPAdes.

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
  --o-index index-0.qza                           
```

## Map reads to contigs
This step maps the input paired-end reads to the indexed contigs created in the previous step. We use various alignment settings to ensure optimal mapping, including local alignment mode and sensitivity settings.

```{code-cell}
qiime assembly map-reads-to-contigs \
  --i-indexed-contigs index-0.qza \                         
  --i-reads paired-reads-0.qza \                                                  
  --o-alignment-map alignment-map-0.qza           
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
  --o-contig-map XX_contig_map \                   
  --o-unbinned-contigs XX_unbinned_contigs          
```
## Evaluate bins with BUSCO
This step evaluates the completeness and quality of the MAGs using the BUSCO tool, which checks for the presence of single-copy orthologs. The evaluation helps ensure the quality of the recovered MAGs.

```{code-cell}
qiime moshpit evaluate-busco \
  --i-bins mags-0.qza \                             
  --i-busco-db busco-db-0.qza \                     
  --p-lineage-dataset bacteria_odb10 \             
  --p-cpu 16 \                                     
  --o-visualization XX_visualization                
```
## Filter MAGs

This step filters the MAGs based on completeness. In this example, we filter out any MAGs with completeness below 50%. The filtering process ensures only high-quality genomes are kept for downstream analysis.

```{code-cell}
qiime moshpit filter-mags \
  --i-mags mags-0.qza \                             
  --m-metadata-file results-table-0.qza \           
  --p-where 'complete>50' \                        
  --p-no-exclude-ids \                              
  --p-on mag \                                     
  --o-filtered-mags filtered-mags-0.qza             
```
## Compute MinHash signatures with Sourmash
In this step, Sourmash is used to compute MinHash signatures for the filtered MAGs. MinHash is a method used to compare large datasets efficiently by creating compressed representations of genomes.

```{code-cell}
qiime sourmash compute \
  --i-sequence-file filtered-mags-0.qza \           
  --p-ksizes 35 \                                  
  --p-scaled 10 \                                   
  --p-track-abundance \                             
  --o-min-hash-signature min-hash-signature-0.qza  
```
## Compare MinHash signatures
Here we compare the computed MinHash signatures to evaluate the similarity between the genomes. This step allows dereplication by identifying highly similar genomes.

```{code-cell}
qiime sourmash compare \
  --i-min-hash-signature min-hash-signature-0.qza \ 
  --p-ksize 35 \                                  
  --p-ignore-abundance \                           
  --o-compare-output compare-output-0.qza          
```
## Dereplicate MAGs
This step dereplicates the filtered MAGs, ensuring that only unique MAGs are retained. Dereplication reduces redundancy by merging similar genomes based on a similarity threshold.

```{code-cell}
qiime moshpit dereplicate-mags \
  --i-mags filtered-mags-0.qza \                    
  --i-distance-matrix compare-output-0.qza \       
  --p-threshold 0.99 \                              # Similarity threshold for dereplication (99%)
  --o-dereplicated-mags dereplicated-mags-0.qza \   
  --o-feature-table XX_feature_table                
```
##  Get feature lengths
This step calculates the lengths of the dereplicated MAGs, which will be used in the next step to estimate abundance.

```{code-cell}
qiime moshpit get-feature-lengths \
  --i-features dereplicated-mags-0.qza \              
  --o-lengths lengths-0.qza                           
```
## Index dereplicated MAGs
This step indexes the dereplicated MAGs for read mapping. The index is necessary to efficiently map the input reads back to the MAGs.

```{code-cell}
qiime assembly index-derep-mags \
  --i-mags dereplicated-mags-0.qza \                  
  --p-threads 8 \                                     
  --o-index index-1.qza                              

```
## Map reads to dereplicated MAGs
In this step, we map the input paired-end reads back to the dereplicated MAGs. This helps in calculating the abundance of each MAG in the sample.

```{code-cell}
qiime assembly map-reads \
  --i-index index-1.qza \                            
  --i-reads paired-reads-0.qza \                    
  --o-alignment-map alignment-map-1.qza             

```
## Estimate MAG abundance
This step estimates the abundance of each MAG in the sample based on the read mapping results. The RPKM metric is used for abundance estimation.

```{code-cell}
qiime moshpit estimate-mag-abundance \
  --i-maps alignment-map-1.qza \                     # Input alignment map from the mapping step
  --i-mag-lengths lengths-0

```
