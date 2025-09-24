# MAG dereplication
Since our samples were generated from the same mock community (i.e., we know they most likely contain the same set of 
genomes), we can simplify our MAG collection by performing __dereplication__, similarly to how you do it for 16S 
amplicon sequences.

We begin by computing hash sketches of every genome using [sourmash](https://doi.org/10.12688/f1000research.19675.1) - you 
can think of those sketches as tiny representations of our genomes (_sourmash_ compresses a lot of information into a 
much smaller space):

:::{describe-usage}
:scope: end-to-end
mags_filtered = use.init_artifact_from_url(
    'mags-filtered', 
    'https://polybox.ethz.ch/index.php/s/ybYprmXwrFLSfBC/download'
)
busco_results = use.init_artifact_from_url(
    'busco-results', 
    'https://polybox.ethz.ch/index.php/s/q59wSM3GSJXGDEG/download'
)
:::

:::{describe-usage}
:scope: end-to-end
min_hash, = use.action(
  use.UsageAction(
    plugin_id='sourmash',
    action_id='compute'
  ),
  use.UsageInputs(
    sequence_file=mags_filtered, 
    ksizes=105, 
    scaled=100,
  ),
  use.UsageOutputNames(min_hash_signature='min-hash')
)
:::

Then, we compare all of those sketches (genomes) to one another to generate a matrix of pairwise distances between our MAGs:

:::{describe-usage}
:scope: end-to-end
min_hash_compare, = use.action(
  use.UsageAction(
    plugin_id='sourmash',
    action_id='compare'
  ),
  use.UsageInputs(
    min_hash_signature=min_hash, 
    ksize=105,
  ),
  use.UsageOutputNames(compare_output='min-hash-compare')
)
:::

Finally, we dereplicate the genomes using the distance matrix and a fixed similarity threshold—the last action will 
simply choose the most complete genome from all the genomes belonging to the same cluster, given a similarity threshold:

:::{describe-usage}
:scope: end-to-end
mags_derep, table = use.action(
  use.UsageAction(
    plugin_id='annotate',
    action_id='dereplicate_mags'
  ),
  use.UsageInputs(
    mags=mags_filtered, 
    distance_matrix=min_hash_compare, 
    metadata=busco_results, 
    metadata_column='completeness', 
    threshold=0.9,
  ),
  use.UsageOutputNames(
    dereplicated_mags='mags-derep', 
    table='table'
  )
)
:::
