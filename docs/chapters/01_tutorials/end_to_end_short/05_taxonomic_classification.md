---
authors:
- mz
---
# Taxonomic classification
Let's now find out what the taxonomic composition of our samples is. There are at least 
two ways to do this. We can classify the reads directly to get an early glimpse into the 
taxa within, or we can classify the MAGs we recovered to get a more accurate picture of
the community members. Let's try both approaches. In this section we will use 
[Kraken 2](https://doi.org/10.1186/s13059-019-1891-0) as the classifier of choice.

:::{describe-usage}
:scope: end-to-end
:hidden:
mags_derep = use.init_artifact_from_url(
    'mags-derep', 
    'https://polybox.ethz.ch/index.php/s/WMsLAzHtej8ERPG/download'
)
reads = use.init_artifact_from_url(
    'reads', 
    'https://polybox.ethz.ch/index.php/s/rgXpDtCMgRgyeKB/download'
)
:::

## Database preparation
Before we perform the classification, we need to get the reference database. For this 
tutorial, we will use the "standard" Kraken 2 database with the smallest memory 
footprint so that it's easier to run on a laptop.

:::{describe-usage}
:scope: end-to-end
kraken2_db, bracken_db = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='build_kraken_db'
  ),
  use.UsageInputs(
    collection='standard8'
  ),
  use.UsageOutputNames(
    kraken2_db='kraken2-db',
    bracken_db='bracken-db'
  )
)
:::

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
    --i-seqs reads.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-reads.qza \
    --o-outputs kraken2-hits-reads.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
:::

::::{note} Without parallelization
:class: dropdown

:::{describe-usage}
:scope: end-to-end
reports_reads, outputs_reads = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='classify_kraken2'
  ),
  use.UsageInputs(
    seqs='reads',
    db='kraken2-db',
    threads=4,
    memory_mapping=True,
  ),
  use.UsageOutputNames(
    reports='reports-reads',
    outputs='outputs-reads'
  )
)
:::
::::

Before we can visualize the abundance of the identified taxa, we need to correct the 
read counts slightly to take into account their genome sizes and database composition. 
For this purpose, we can use the [Bracken](https://doi.org/10.7717/peerj-cs.104) tool 
which uses statistical methods to re-estimate read counts to account for those factors. 
Run the action below to perform that correction:

:::{describe-usage}
:scope: end-to-end
bracken_reports, bracken_taxonomy, bracken_table = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='estimate_bracken'
  ),
  use.UsageInputs(
    kraken2_reports='reports-reads',
    db='bracken-db',
    read_len=150,
  ),
  use.UsageOutputNames(
    reports='bracken-reports',
    taxonomy='bracken-taxonomy',
    table='bracken-table'
  )
)
:::

Now, we can use the familiar `barplot` action to plot the taxa abundance in our samples:

:::{describe-usage}
:scope: end-to-end
taxa_barplot, = use.action(
  use.UsageAction(
    plugin_id='taxa',
    action_id='barplot'
  ),
  use.UsageInputs(
    table=bracken_table, 
    taxonomy=bracken_taxonomy,
  ),
  use.UsageOutputNames(visualization='taxa-barplot')
)
:::

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/end-to-end/bracken-barplot.qzv).

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
    --i-seqs mags-derep.qza \
    --i-db kraken2-db.qza \
    --p-threads 4 \
    --p-memory-mapping \
    --o-reports kraken2-reports-mags.qza \
    --o-outputs kraken2-hits-mags.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
:::

::::{note} Without parallelization
:class: dropdown

:::{describe-usage}
:scope: end-to-end
reports_mags, outputs_mags = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='classify_kraken2'
  ),
  use.UsageInputs(
    seqs=mags_derep,
    db='kraken2-db',
    threads=4,
    memory_mapping=True,
  ),
  use.UsageOutputNames(
    reports='reports-mags',
    outputs='outputs-mags'
  )
)
:::
::::

We got two new artifacts: `FeatureData[Kraken2Report % Properties('mags')]` and 
`FeatureData[Kraken2Output % Properties('mags')]`. The first one contains the Kraken 2 
report: a tree-like representation of all the identified taxa. The second one is a list 
of all MAGs with their corresponding identified taxa. To convert those into a more 
QIIME-like taxonomy, run the following action:

:::{describe-usage}
:scope: end-to-end
taxonomy_mags, = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='kraken2_to_mag_features'
  ),
  use.UsageInputs(
    reports=reports_mags,
    outputs=outputs_mags,
  ),
  use.UsageOutputNames(
    taxonomy='taxonomy-mags'
  )
)
:::

A natural next step would now be to estimate the relative frequencies of those taxa in 
our samples. It is, however, a little bit more complicated in the case of MAGs, since 
we would need to take into account how many reads map to each of our MAGs and from 
there try to infer their abundance. Head to the next section to learn how to do that.
