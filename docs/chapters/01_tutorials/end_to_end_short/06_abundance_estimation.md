# MAG abundance estimation
At this point we still have no information about how much of each MAG was present in 
the original samples—this is something we will try to do in this section. To estimate 
MAG abundance, we will take the original reads and map them back to the recovered MAGs. 
After that we can count all the reads that mapped to each genome, normalize the counts 
to genome lengths and present the results using one of the available metrics 
(RPKM or TPM, more below).

## MAG indexing
Similarly to how it was done for MAG recovery, we first need to index our dereplicated 
MAGs. We can do it using the `index-derep-mags` action from the `q2-annotate` plugin:

```{code} bash
mosh annotate assembly index-derep-mags \
    --i-mags ./mags-derep.qza \
    --p-threads 4 \
    --p-seed 100 \
    --o-index ./mags-derep-index.qza \
    --verbose
```

## Read mapping
The next step is read mapping—this time we will map the original reads to the 
dereplicated MAGs using the index generated in the previous step:

:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. 
We will use the same config as for genome assembly.
```{code} bash
mosh assembly map-reads \
    --i-index ./mags-derep-index.qza \
    --i-reads ./reads.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-alignment-maps ./reads-to-mags-aln.qza \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh assembly map-reads \
    --i-index ./mags-derep-index.qza \
    --i-reads ./reads.qza \
    --p-threads 4 \
    --p-seed 100 \
    --o-alignment-maps ./reads-to-mags-aln.qza \
    --verbose
```
:::

## MAG length estimation
To estimate MAG abundance, we need to find the length of each recovered genome so that 
we can normalize counts of reads based on genome length. To achieve that, you can use 
the `get-feature-lengths` action:

```{code} bash
mosh annotate annotate get-feature-lengths \
    --i-features ./mags-derep.qza \
    --o-lengths ./mags-derep-lengths.qza \
    --verbose
```

## Abundance estimation
Finally, we are ready to estimate the abundance of our MAGs. The action we will use 
below supports two different kinds of metric which can be used as a proxy of genome 
abundance: RPKM (Reads Per Kilobase per Million mapped reads) and TPM 
(Transcripts Per Million)—for now we will continue with TPM but feel free to check 
out [this post](https://www.rna-seqblog.com/rpkm-fpkm-and-tpm-clearly-explained/) to 
learn more about those. We will also set minimal mapping quality to 42 to ensure we are 
taking into account only the reads which mapped to our MAGs perfectly.

```{code} bash
mosh annotate estimate-abundance \
    --i-alignment-maps ./reads-to-mags-aln.qza \
    --i-feature-lengths ./mags-derep-lengths.qza \
    --p-metric "tpm" \
    --p-min-mapq 42 \
    --p-threads 4 \
    --o-abundances ./mags-derep-ft.qza \
    --verbose
```

## Taxonomic composition visualization
Great! Finally, we can now combine our new feature table with the taxonomy obtained 
previously to visualize the abundances of the dereplicated MAGs:

```{code} bash
mosh taxa barplot \
    --i-table ./mags-derep-ft.qza \
    --i-taxonomy ./mags-taxonomy.qza \
    --o-visualization ./mags-derep-barplot.qzv \
    --verbose
```

Navigate to the [QIIME 2 View](https://view.qiime2.org) and upload the `mags-derep-barplot.qzv` 
file to see the visualization.
