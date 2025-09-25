---
authors:
- mz
---
# MAG binning
## Read mapping
Before we continue to assemble MAGs, we need to index the contigs obtained in the assembly step and map the original 
reads to those contigs using that index. This read mapping can then be used by the contig binner to figure out which 
contigs originated from the same genome and put those together. Run the actions below to index the contigs and map the 
reads to the generated index:

:::{describe-usage}
:scope: end-to-end
contigs = use.init_artifact_from_url(
    'contigs', 
    'https://polybox.ethz.ch/index.php/s/SLHzx2ewfJjkiWJ/download'
)
reads = use.init_artifact_from_url(
    'reads', 
    'https://polybox.ethz.ch/index.php/s/rgXpDtCMgRgyeKB/download'
)
:::

### Contig indexing
:::{hint} With parsl parallelization
:class: dropdown
:open: true
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
:::

::::{note} Without parallelization
:class: dropdown

:::{describe-usage}
:scope: end-to-end
contigs_index, = use.action(
  use.UsageAction(
    plugin_id='assembly',
    action_id='index_contigs'
  ),
  use.UsageInputs(
    contigs=contigs,
    threads=2,
    seed=100,
  ),
  use.UsageOutputNames(index='contigs-index')
)
:::
::::

### Read mapping
:::{hint} With parsl parallelization
:class: dropdown
:open: true
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
    index=contigs_index,
    reads=reads,
    threads=2,
    seed=100,
  ),
  use.UsageOutputNames(alignment_maps='alignment-maps')
)
:::
::::

## Contig binning
Finally, we are ready to perform contig binning. This process involves categorizing contigs into distinct bins or groups 
based on their likely origin from different microbial species or strains within a mixed community. Here, we will use the 
[MetaBAT 2](https://doi.org/10.7717/peerj.7359) tool, which uses tetranucleotide frequency together with abundance (coverage) information to assign 
contigs to individual bins.

:::{describe-usage}
:scope: end-to-end
mags, contig_map, unbinned_contigs = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='bin_contigs_metabat'
  ),
  use.UsageInputs(
    contigs=contigs,
    alignment_maps=alignment_maps,
    num_threads=4,
    seed=100,
  ),
  use.UsageOutputNames(
    mags='mags',
    contig_map='contig-map',
    unbinned_contigs='unbinned-contigs'
  )
)
:::

## MAG quality control
Once we have our contigs binned into Metagenome-Assembled Genomes (MAGs), we need to check what the quality of those 
bins is. There are a couple of different tools which can be used for this purpose, many of which use the single-copy 
marker genes to estimate the completeness and purity (or contamination) of the recovered genomes. Here, we will use 
[BUSCO](https://doi.org/10.1093/nar/gkae987) which uses a set of curated ortholog genes to estimate those metrics.

We begin by fetching the required BUSCO database: we know that all species in our samples are strictly bacteria so we 
can fetch only this lineage to save some space and resources:

:::{describe-usage}
:scope: end-to-end
busco_db, = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='fetch_busco_db'
  ),
  use.UsageInputs(
    lineages=['bacteria_odb12']
  ),
  use.UsageOutputNames(
    db='busco-db'
  )
)
:::

Next, we use the database we fetched to run BUSCO with our recovered MAGs as input:

:::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up this action by taking advantage of parsl parallelization support. We will use the same config as for genome assembly.

```{code} bash
mosh annotate evaluate-busco \
    --i-mags mags.qza \
    --i-db busco-db-bacteria.qza \
    --p-lineage-dataset bacteria_odb12 \
    --p-cpu 2 \
    --o-results busco-results.qza \
    --o-visualization ./mags.qzv \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

::::{note} Without parallelization
:class: dropdown

:::{describe-usage}
:scope: end-to-end
busco_results, busco_visualization = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='evaluate_busco'
  ),
  use.UsageInputs(
    mags=mags,
    db=busco_db,
    lineage_dataset='bacteria_odb12',
    cpu=4,
  ),
  use.UsageOutputNames(
    results='busco-results',
    visualization='mags-visualization'
  )
)
:::
::::

The action above generated a result table and a neat visualization which will allow us to investigate the quality of all our genomes.

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/end-to-end/mags.qzv).

Now that we evaluated the quality of our MAGs, we can use this information to filter out only the best ones. We do not 
want to continue with MAGs of low quality (not very complete or highly contaminated) as it may lead to incorrect results 
in the downstream analyses. We want to keep the MAGs which are at least 50% complete and have less than 10% contamination 
(these are considered to be of medium quality according to the [MIMAG standard](https://doi.org/10.1038/nbt.3893)). 
We can easily achieve this with the following action:

:::{describe-usage}
:scope: end-to-end
filtered_mags, = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='filter_mags'
  ),
  use.UsageInputs(
    mags=mags,
    metadata=busco_results,
    where="completeness>50 AND contamination<10",
    on="mag",
  ),
  use.UsageOutputNames(
    filtered_mags='filtered-mags'
  )
)
:::
