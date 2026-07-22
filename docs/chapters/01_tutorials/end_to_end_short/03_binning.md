---
authors:
- mz
---
(binning)=
# MAG binning

:::{seealso} Workflow Guide
Looking for a concise recipe you can adapt to your own data? See [How to bin MAGs](bin-mags).
:::

(read-mapping)=
## Read mapping
Before we continue to assemble MAGs, we need to index the contigs obtained in the assembly step and map the original 
reads to those contigs using that index. This read mapping can then be used by the contig binner to figure out which 
contigs originated from the same genome and put those together. Run the actions below to index the contigs and map the 
reads to the generated index:

### Contig indexing
`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.
```{code} bash
mosh assembly index-contigs \
    --i-contigs contigs.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-index contigs-index.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````

````{tab-item} Without parallelization
```{code} bash
mosh assembly index-contigs \
    --i-contigs contigs.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-index contigs-index.qza \
    --verbose
```
````
`````

### Read mapping
`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.

You can then run the action in the following way:
```{code} bash
mosh assembly map-reads \
    --i-index contigs-index.qza \
    --i-reads reads.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-alignment-maps reads-to-contigs-aln.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````

````{tab-item} Without parallelization
```{code} bash
mosh assembly map-reads \
    --i-index contigs-index.qza \
    --i-reads reads.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-alignment-maps reads-to-contigs-aln.qza \
    --verbose
```
````
`````

## Contig binning
Finally, we are ready to perform contig binning. This process involves categorizing contigs into distinct bins or groups 
based on their likely origin from different microbial species or strains within a mixed community. MOSHPIT supports 
multiple binners through the [q2-mag](https://github.com/bokulich-lab/q2-mag) plugin—here we show two options: 
[MetaBAT 2](https://doi.org/10.7717/peerj.7359), which uses tetranucleotide frequency together with abundance 
(coverage) information, and [SemiBin2](https://doi.org/10.1093/bioinformatics/btad209), a deep-learning approach 
that can leverage pre-trained models for common environments.

Both actions take the contigs from assembly and the read-to-contig alignment maps generated above. Pick one binner 
to continue; the downstream quality-control steps work with either set of outputs.

`````{tab-set}
````{tab-item} MetaBAT 2
MetaBAT 2 is a fast binner that also reports contigs that could not be assigned to any bin. 
Those unbinned contigs are used later in the BUSCO visualization.

```{code} bash
mosh mag bin-contigs-metabat \
    --i-contigs contigs.qza \
    --i-alignment-maps reads-to-contigs-aln.qza \
    --p-num-threads 4 \
    --p-seed 100 \
    --o-mags mags.qza \
    --o-contig-map contig-map.qza \
    --o-unbinned-contigs unbinned-contigs.qza \
    --verbose
```
````

````{tab-item} SemiBin2
SemiBin2 uses deep learning together with coverage information to group contigs into bins. For this mock-community 
tutorial we use the `global` pre-trained model setting. Unlike MetaBAT 2, SemiBin2 does not return a 
separate unbinned-contigs artifact.

```{code} bash
mosh mag bin-contigs-semibin2 \
    --i-contigs contigs.qza \
    --i-alignment-maps reads-to-contigs-aln.qza \
    --p-environment global \
    --p-training-type semi \
    --p-threads 4 \
    --p-random-seed 100 \
    --o-mags mags.qza \
    --o-contig-map contig-map.qza \
    --verbose
```
````
`````

:::{note} SemiBin2 and BUSCO
If you binned with SemiBin2, omit `--i-unbinned-contigs` from the `evaluate-busco` commands below. The BUSCO 
quality metrics for your MAGs will still be computed; only the optional unbinned-contig summary in the visualization 
will be omitted.
:::

## MAG quality control
Once we have our contigs binned into Metagenome-Assembled Genomes (MAGs), we need to check what the quality of those 
bins is. There are a couple of different tools which can be used for this purpose, many of which use the single-copy 
marker genes to estimate the completeness and purity (or contamination) of the recovered genomes. Here, we will use 
[BUSCO](https://doi.org/10.1093/nar/gkae987) which uses a set of curated ortholog genes to estimate those metrics.

We begin by fetching the required BUSCO database: we know that all species in our samples are strictly bacteria so we 
can fetch only this lineage to save some space and resources:

```{code} bash
mosh mag fetch-busco-db \
    --p-lineages bacteria_odb12 \
    --o-db busco-db-bacteria.qza \
    --verbose
```

Next, we use the database we fetched to run BUSCO with our recovered MAGs as input:

`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.

```{code} bash
mosh mag evaluate-busco \
    --i-mags mags.qza \
    --i-db busco-db-bacteria.qza \
    --i-unbinned-contigs unbinned-contigs.qza \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 2 \
    --o-results busco-results.qza \
    --o-visualization mags.qzv \
    --parallel-config parallel.config.toml \
    --verbose
```
````

````{tab-item} Without parallelization
```{code} bash
mosh mag evaluate-busco \
    --i-mags mags.qza \
    --i-db busco-db-bacteria.qza \
    --i-unbinned-contigs unbinned-contigs.qza \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 2 \
    --o-results busco-results.qza \
    --o-visualization mags.qzv \
    --verbose
```
````
`````

The action above generated a result table and a neat visualization which will allow us to investigate the quality of all our genomes.

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/end-to-end/mags.qzv).

Now that we evaluated the quality of our MAGs, we can use this information to filter out only the best ones. We do not 
want to continue with MAGs of low quality (not very complete or highly contaminated) as it may lead to incorrect results 
in the downstream analyses. We want to keep the MAGs which are at least 50% complete and have less than 10% contamination 
(these are considered to be of medium quality according to the [MIMAG standard](https://doi.org/10.1038/nbt.3893)). 
We can easily achieve this with the following action:

```{code} bash
mosh mag filter-mags \
    --i-mags mags.qza \
    --m-metadata-file busco-results.qza \
    --p-where "completeness>50 AND contamination<10" \
    --p-on "mag" \
    --o-filtered-mags mags-filtered.qza \
    --verbose
```
