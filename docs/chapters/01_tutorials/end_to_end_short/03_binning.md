# MAG binning
## Read mapping
Before we continue to assemble MAGs, we need to index the contigs obtained in the assembly step and map the original 
reads to those contigs using that index. This read mapping can then be used by the contig binner to figure out which 
contigs originated from the same genome and put those together. Run the actions below to index the contigs and map the 
reads to the generated index:

### Indexing
:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.
```{code} bash
mosh assembly index-contigs \
    --i-contigs ./contigs.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-index ./contigs-index.qza \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh assembly index-contigs \
    --i-contigs ./contigs.qza \
    --p-threads 4 \
    --p-seed 100 \
    --o-index ./contigs-index.qza \
    --verbose
```
:::

### Read mapping
:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.

You can then run the action in the following way:
```{code} bash
mosh assembly map-reads \
    --i-index ./contigs-index.qza \
    --i-reads ./reads.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-alignment-maps ./reads-to-contigs-aln.qza \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh assembly index-contigs \
    --i-contigs ./contigs.qza \
    --p-threads 4 \
    --p-seed 100 \
    --o-index ./contigs-index.qza \
    --verbose
```
:::

## Contig binning
Finally, we are ready to perform contig binning. This process involves categorizing contigs into distinct bins or groups 
based on their likely origin from different microbial species or strains within a mixed community. Here, we will use the 
[MetaBAT 2](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6662567/) tool, which uses tetranucleotide frequency together with abundance (coverage) information to assign 
contigs to individual bins.

```{code} bash
mosh annotate bin-contigs-metabat \
    --i-contigs ./contigs.qza \
    --i-alignment-maps ./reads-to-contigs-aln.qza \
    --p-num-threads 4 \
    --p-seed 100 \
    --o-mags ./mags.qza \
    --o-contig-map ./contig-map.qza \
    --o-unbinned-contigs ./unbinned-contigs.qza \
    --verbose
```

## MAG quality control
Once we have our contigs binned into Metagenome-Assembled Genomes (MAGs), we need to check what the quality of those 
bins is. There are a couple of different tools which can be used for this purpose, many of which use the single-copy 
marker genes to estimate the completeness and purity (or contamination) of the recovered genomes. Here, we will use 
[BUSCO](https://busco.ezlab.org/) which uses a set of curated ortholog genes to estimate those metrics.

We begin by fetching the required BUSCO database: we know that all species in our samples are strictly bacteria so we 
can fetch only this lineage to save some space and resources:

```{code} bash
mosh annotate fetch-busco-db \
    --p-lineages bacteria_odb12 \
    --o-db ./busco-db-bacteria.qza
```

Next, we use the database we fetched to run BUSCO with our recovered MAGs as input:

:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.

```{code} bash
mosh annotate evaluate-busco \
    --i-mags ./mags.qza \
    --i-db ./busco-db-bacteria.qza \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 2 \
    --o-results ./busco-results.qza \
    --o-visualization ./mags.qzv \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh annotate evaluate-busco \
    --i-mags ./mags.qza \
    --i-db ./busco-db-bacteria.qza \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 4 \
    --o-results ./busco-results.qza \
    --o-visualization ./mags.qzv \
    --verbose
```
:::

The action above generated a result table and a neat visualization which will allow us to investigate the quality of all our genomes.
Navigate to the [QIIME 2 View](https://view.qiime2.org) and upload the `mags.qzv` file to see the visualization.

Now that we evaluated the quality of our MAGs, we can use this information to filter out only the best ones. We do not 
want to continue with MAGs of low quality (not very complete or highly contaminated) as it may lead to incorrect results 
in the downstream analyses. We want to keep the MAGs which are at least 50% complete and have less than 10% contamination 
(these are considered to be of medium quality according to the [MIMAG standard](https://doi.org/10.1038/nbt.3893)). 
We can easily achieve this with the following action:
```{code} bash
mosh annotate filter-mags \
    --i-mags ./mags.qza \
    --m-metadata-file ./busco-results.qza \
    --p-where "completeness>50 AND contamination<10" \
    --p-on "mag" \
    --o-filtered-mags ./mags-filtered.qza \
    --verbose
```