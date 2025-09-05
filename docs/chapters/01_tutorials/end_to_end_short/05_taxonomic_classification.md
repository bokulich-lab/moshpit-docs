# Taxonomic classification
Let's now find out what the taxonomic composition of our samples is. There are at least 
two ways to do this. We can classify the reads directly to get an early glimpse into the 
taxa within, or we can classify the MAGs we recovered to get a more accurate picture of
the community members. Let's try both approaches. In this section we will use 
[Kraken 2](https://doi.org/10.1186/s13059-019-1891-0) as the classifier of choice.

## Database preparation
Before we perform the classification, we need to get the reference database. For this 
tutorial, we will use the "standard" Kraken 2 database with the smallest memory 
footprint so that it's easier to run on a laptop.

```{code} bash
mosh annotate build-kraken-db \
    --p-collection standard8 \
    --o-kraken2-db ./kraken2-db.qza \
    --o-bracken-db ./bracken-db.qza \
    --verbose
```

## Read-based classification
Let's start with read-based classification. We can use the `classify-kraken2` action 
to perform the classification and then correct the read counts to account for the 
genome size and database composition using the `estimate-bracken` action.

:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. 
We will use the same config as for genome assembly.
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs ./reads.qza \
    --i-db ./kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports ./kraken2-reports-reads.qza \
    --o-outputs ./kraken2-hits-reads.qza \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs ./reads.qza \
    --i-db ./kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports ./kraken2-reports-reads.qza \
    --o-outputs ./kraken2-hits-reads.qza \
    --verbose
```
:::

Before we can visualize the abundance of the identified taxa, we need to correct the 
read counts slightly to take into account their genome sizes and database composition. 
For this purpose, we can use the [Bracken](https://peerj.com/articles/cs-104/) tool 
which uses statistical methods to re-estimate read counts to account for those factors. 
Run the action below to perform that correction:

```{code} bash
mosh annotate annotate estimate-bracken \
    --i-kraken2-reports ./kraken2-reports-reads.qza \
    --i-db ./bracken-db.qza \
    --p-read-len 150 \
    --o-reports ./bracken-reports.qza \
    --o-taxonomy ./bracken-taxonomy.qza \
    --o-table ./bracken-table.qza \
    --verbose
```
Now, we can use the familiar `barplot` action to plot the taxa abundance in our samples:

```{code} bash
mosh annotate taxa barplot \
    --i-table ./bracken-table.qza \
    --i-taxonomy ./bracken-taxonomy.qza \
    --o-visualization ./bracken-barplot.qzv \
    --verbose
```

Navigate to the [QIIME 2 View](https://view.qiime2.org) and upload the `bracken-barplot.qzv` file to see the visualization.

## MAG-based classification
It is also possible to classify the MAGs we recovered using Kraken 2. We can use the 
same `classify-kraken2` action as before but pass the dereplicated MAGs we got in 
the previous section as input.

:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. 
We will use the same config as for genome assembly.
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs ./mags-derep.qza \
    --i-db ./kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports ./kraken2-reports-mags.qza \
    --o-outputs ./kraken2-hits-mags.qza \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh annotate classify-kraken2 \
    --i-seqs ./mags-derep.qza \
    --i-db ./kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports ./kraken2-reports-mags.qza \
    --o-outputs ./kraken2-hits-mags.qza \
    --verbose
```
:::

We got two new artifacts: `FeatureData[Kraken2Report % Properties('mags')]` and 
`FeatureData[Kraken2Output % Properties('mags')]`. The first one contains the Kraken 2 
report: a tree-like representation of all the identified taxa. The second one is a list 
of all MAGs with their corresponding identified taxa. To convert those into a more 
QIIME-like taxonomy, run the following action:

```{code} bash
mosh annotate kraken2-to-mag-features \
    --i-reports ./kraken2-reports-mags.qza \
    --i-outputs ./kraken2-hits-mags.qza \
    --o-taxonomy ./mags-taxonomy.qza \
    --verbose
```

A natural next step would now be to estimate the relative frequencies of those taxa in 
our samples. It is, however, a little bit more complicated in the case of MAGs, since 
we would need to take into account how many reads map to each of our MAGs and from 
there try to infer their abundance. Head to the next section to learn how to do that.
