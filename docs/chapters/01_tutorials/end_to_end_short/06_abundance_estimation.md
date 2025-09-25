---
authors:
- mz
---
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
taxonomy = use.init_artifact_from_url(
    'taxonomy', 
    'https://polybox.ethz.ch/index.php/s/kimCx8b2SSdsTSZ/download'
)
:::

:::{describe-usage}
:scope: end-to-end
mags_index, = use.action(
  use.UsageAction(
    plugin_id='assembly',
    action_id='index_derep_mags'
  ),
  use.UsageInputs(
    mags=mags_derep, 
    threads=4, 
    seed=100,
  ),
  use.UsageOutputNames(index='mags-index')
)
:::

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
    --i-index mags-derep-index.qza \
    --i-reads reads.qza \
    --p-threads 2 \
    --p-seed 100 \
    --o-alignment-maps reads-to-mags-aln.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
:::

::::{note} Without parallelization
:class: dropdown

:::{describe-usage}
:scope: end-to-end
alignment_maps, = use.action(
  use.UsageAction(
    plugin_id='assembly',
    action_id='map_reads'
  ),
  use.UsageInputs(
    index=mags_index,
    reads=reads,
    threads=4,
    seed=100,
  ),
  use.UsageOutputNames(alignment_maps='alignment-maps')
)
:::
::::

## MAG length estimation
To estimate MAG abundance, we need to find the length of each recovered genome so that 
we can normalize counts of reads based on genome length. To achieve that, you can use 
the `get-feature-lengths` action:

:::{describe-usage}
:scope: end-to-end
lengths, = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='get_feature_lengths'
  ),
  use.UsageInputs(
    features=mags_derep,
  ),
  use.UsageOutputNames(lengths='lengths')
)
:::

## Abundance estimation
Finally, we are ready to estimate the abundance of our MAGs. The action we will use 
below supports two different kinds of metric which can be used as a proxy of genome 
abundance: RPKM (Reads Per Kilobase per Million mapped reads) and TPM 
(Transcripts Per Million)—for now we will continue with TPM but feel free to check 
out [this post](https://www.rna-seqblog.com/rpkm-fpkm-and-tpm-clearly-explained/) to 
learn more about those. We will also set minimal mapping quality to 42 to ensure we are 
taking into account only the reads which mapped to our MAGs perfectly.

:::{describe-usage}
:scope: end-to-end
abundances, = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='estimate_abundance'
  ),
  use.UsageInputs(
    alignment_maps=alignment_maps, 
    feature_lengths=lengths, 
    metric='tpm', 
    min_mapq=42, 
    threads=4,
  ),
  use.UsageOutputNames(abundances='abundances')
)
:::

## Taxonomic composition visualization
Great! Finally, we can now combine our new feature table with the taxonomy obtained 
previously to visualize the abundances of the dereplicated MAGs:

:::{describe-usage}
:scope: end-to-end
taxa_barplot, = use.action(
  use.UsageAction(
    plugin_id='taxa',
    action_id='barplot'
  ),
  use.UsageInputs(
    table=abundances, 
    taxonomy=taxonomy,
  ),
  use.UsageOutputNames(visualization='taxa-barplot')
)
:::

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/end-to-end/mags-taxa-barplot.qzv).
