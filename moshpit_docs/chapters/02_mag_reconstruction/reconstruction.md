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
(mag-recovery)=
# Recovery of MAGs
In this part of the tutorial we will go thorugh the steps required to recover metagenome-assembled genomes (MAGs) from 
metagenomic data. The workflow is divided into several steps, from contig assembly to binning and quality control.
```{warning}
Genome assembly and contig binning can be highly resource-intensive. Ensure that your system has sufficient CPU and 
memory resources before running these commands.
```
## Assemble contigs with MEGAHIT
The first step in recovering MAGs is genome assembly itself. There are many genome assemblers available, two of which 
you can use through the q2-assembly plugin - here, we will use MEGAHIT. MEGAHIT takes short DNA sequencing reads, 
constructs a simplified [De Bruijn graph](https://en.wikipedia.org/wiki/De_Bruijn_graph), and generates longer contiguous 
sequences called contigs, providing valuable genetic information for the next steps of our analysis.

- The `--p-presets` specifies the preset mode for MEGAHIT. In this case, it's set to "meta-sensitive" for metagenomic data.
- The `--p-cpu-threads` specifies the number of CPU threads to use during assembly.
- The `--p-min-contig-len` specifies the minimum length of contigs to keep.

```{warning}
`--p-coassemble` parameter can be set to "True" if you wish to co-assemble reads into contigs from all samples. 
**This parameter is still under development**: you will not be able to use the generated contigs for further analysis.
```
```{code-cell}
mosh assembly assemble-megahit \
    --i-reads ./cache:reads_filtered \
    --p-presets "meta-sensitive" \          
    --p-num-cpu-threads 24 \                      
    --p-min-contig-len 200 \ 
    --p-coassemble False \    # Co-assembly is disabled for this example
    --o-contigs ./cache:contigs \
    --verbose   
```
- Alternatively, you can also use `mosh assembly assemble-spades` to assemble contigs with SPAdes.

## Contig QC with QUAST
Once the reads are assembled into contigs, we can use QUAST to evaluate the quality of our assembly. There are many 
metrics that can be used for that purpose but here we will focus on the two most popular metrics:
- **N50**: represents the contiguity of a genome assembly. It's defined as the length of the contig (or scaffold) at 
    which 50% of the entire genome is covered by contigs of that length or longer - the higher this number, the better.
- **L50**: represents the number of contigs required to cover 50% of the genome's total length - the smaller this number, 
    the better.

In addition to calculating generic statistics like N50 and L50, QUAST will try to identify potential genomes from which 
the analyzed contigs originated. Alternatively, we can provide it with a set of reference genomes we would like it to 
run the analysis against using `--i-references`.
```{code-cell}
mosh assembly evaluate-quast \
    --i-contigs ./cache:contigs  \
    --p-threads 128 \
    --p-memory-efficient \
    --o-visualization ./results/contigs.qzv \ 
    --verbose
```
Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/contigs.qzv).

## Index contigs
In this step, we generate an index for the assembled contigs. This index is required for mapping reads to the contigs 
later. Various parameters control the size and structure of the index, as well as resource usage.
```{code-cell}
mosh assembly index-contigs \
    --i-contigs ./cache:contigs \                       
    --p-threads 8 \                                  
    --o-index ./cache:contigs_index \
    --verbose                             
```

## Map reads to contigs
Here we map the input paired-end reads to the indexed contigs created in the previous step. We use various alignment 
settings to ensure optimal mapping, including local alignment mode and sensitivity settings.
```{code-cell}
mosh assembly map-reads \
    --i-index ./cache:contigs_index \                         
    --i-reads ./cache:reads_filtered \                                                  
    --o-alignment-maps ./cache:reads_to_contigs \
    --verbose             
```

## Bin contigs with MetaBAT
Binning contigs involves grouping assembled contigs into MAGs. This step uses MetaBAT to assign contigs based on 
co-abundance and other features, producing MAG files that represent putative genomes.
```{code-cell}
mosh annotate bin-contigs-metabat \
    --i-contigs ./cache:contigs \                       
    --i-alignment-maps ./cache:reads_to_contigs \         
    --p-num-threads 64 \                              
    --p-seed 100 \                                   
    --p-verbose \                                    
    --o-mags ./cache:mags \                             
    --o-contig-map ./cache:contig_map \                   
    --o-unbinned-contigs ./cache:unbinned_contigs \
    --verbose          
```
This step generated several artifacts:

- `mags`: these are our actual MAGS, per sample.
- `contig_map`: this is a mapping between MAG IDs and IDs of contigs that belong to a given MAG.
- `unbinned_contigs`: these are all the contigs that could not be assign to any particular MAG.
From now on, we will focus on the `mags`.

## Evaluate bins with BUSCO
This step evaluates the completeness and quality of MAGs using the BUSCO tool, which checks for the presence of 
single-copy orthologs. The evaluation helps ensure the quality of the recovered MAGs.

First we will use `mosh annotate fetch-busco-db` to download a specific lineage's BUSCO database. BUSCO databases are 
precompiled collections of orthologous genes, tailored to specific lineages such as viruses, prokaryotes 
(bacteria and archaea), eukaryotes or more specific ones like bacteria_odb12.

- The `--p-lineages` parameter set to `bacteria_odb12` specifies that we want to download the bacterial dataset.

```{code-cell}
mosh annotate fetch-busco-db \
    --p-lineages bacteria_odb12 \
    --o-db ./cache:busco_db
    --verbose
```

Once the appropriate BUSCO database is fetched, the next step is to evaluate the completeness and quality of the MAGs.
```{code-cell}
mosh annotate evaluate-busco \
    --i-mags ./cache:mags \                             
    --i-db ./cache:busco_db \                     
    --p-lineage-dataset bacteria_odb12 \             
    --p-cpu 16 \                                     
    --o-visualization ./results/mags.qzv \
    --o-results ./cache:busco_results \
    --verbose                 
```
The `--p-lineage-dataset bacteria_odb12` parameter specifies the particular lineage dataset to use, in this case, 
the bacteria_odb12 dataset. This is a standard database for bacterial genomes.

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/mags.qzv).

## Filter MAGs
This step filters MAGs based on completeness. In this example, we filter out any MAGs with completeness below 50%. 
The filtering process ensures only high-quality genomes are kept for downstream analysis.
```{tip}
We recommed that this step is done before dereplication (as in this example). Alternatively, we can also use the 
[dereplicated set](dereplication) and filter this one using `mosh annotate filter-derep-mags`.
```

```{code-cell}
mosh annotate filter-mags \
    --i-mags ./cache:mags \                             
    --m-metadata-file ./cache:busco_results \           
    --p-where 'complete>50' \                        
    --p-no-exclude-ids \                              
    --p-on mag \                                     
    --o-filtered-mags ./cache:mags_filtered_50 \
    --verbose           
```
