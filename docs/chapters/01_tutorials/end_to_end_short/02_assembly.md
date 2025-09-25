# Genome assembly
The first step in recovering metagenome-assembled genomes (MAGs) is genome assembly itself. There are many genome 
assemblers available, two of which you can use through our MOSHPIT plugin - here, we will use [MEGAHIT](https://doi.org/10.1093/bioinformatics/btv033). 
MEGAHIT takes short DNA sequencing reads, constructs a simplified [De Bruijn graph](https://en.wikipedia.org/wiki/De_Bruijn_graph), and generates longer contiguous 
sequences called **contigs**, providing valuable genetic information for the next steps of our analysis.

The reads generated for this tutorial can be downloaded using the following command:
:::{describe-usage}
:scope: end-to-end
reads = use.init_artifact_from_url(
    'reads', 
    'https://polybox.ethz.ch/index.php/s/rgXpDtCMgRgyeKB/download'
)
:::

::::{hint} With parsl parallelization
:class: dropdown
:open: true
You can speed up the assembly by taking advantage of parsl parallelization support. The config for local execution could 
look like this:

```{code} bash
:filename: parallel.config.toml
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"

[parsl.executors.provider]
class = "LocalProvider"
max_blocks = 2
```

You can then run the action in the following way:
```{code} bash
mosh assembly assemble-megahit \
    --i-reads reads.qza \
    --p-presets meta-sensitive \
    --p-cpu-threads 2 \
    --p-min-contig 500 \
    --o-contigs contigs.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
::::

::::{note} Without parallelization
:class: dropdown

:::{describe-usage}
:scope: end-to-end
contigs, = use.action(
  use.UsageAction(
    plugin_id='assembly',
    action_id='assemble_megahit'
  ),
  use.UsageInputs(
    reads=reads, 
    presets='meta-sensitive', 
    num_cpu_threads=2, 
    min_contig_len=500,
  ),
  use.UsageOutputNames(contigs='contigs')
)
:::
::::

Once the reads are assembled into contigs, we can use [QUAST](https://doi.org/10.1093/bioinformatics/btt086) to evaluate the quality of our assembly. There are many metrics  
that can be used for that purpose, but here we will focus on the two most popular [metrics](https://en.wikipedia.org/wiki/N50,_L50,_and_related_statistics):
- **N50**: represents the contiguity of a genome assembly. It's defined as the length of the contig (or scaffold) at which 50% of the entire genome is covered by contigs of that length or longer - the higher this number, the better.
- **L50**: represents the number of contigs required to cover 50% of the genome's total length - the smaller this number, the better.

In addition to calculating generic statistics like N50 and L50, QUAST will try to identify potential genomes from which 
the analyzed contigs originated. Alternatively, we can provide it with a set of reference genomes we would like it to 
run the analysis against. Since we generated the reads from an "artificial" mock community, we will provide the 
reference sequences for those genomes—this will save us a bit of work and time. Run the following cell to assess the 
quality of contigs assembled in the previous step:

:::{describe-usage}
:scope: end-to-end
reference_genomes = use.init_artifact_from_url(
    'reference_genomes', 
    'https://polybox.ethz.ch/index.php/s/dRdDSZJcxH4LRgk/download'
)
:::

:::{describe-usage}
:scope: end-to-end
ref_genomes, contigs_qc, quast_results = use.action(
  use.UsageAction(
    plugin_id='assembly',
    action_id='evaluate_quast'
  ),
  use.UsageInputs(
    contigs=contigs,
    references=reference_genomes,
    min_contig=500,
    threads=4,
  ),
  use.UsageOutputNames(
    reference_genomes='ref_genomes',
    visualization='contigs_qc',
    results_table='quast_results'
  )
)
:::

Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/docs/data/end-to-end/contigs.qzv).

There are many things to look at here! Don't worry, it is not our goal to try to understand all of that information, 
though. Let's focus on the metrics we mentioned above - you will find them on the "QC report" tab, in the colorful table 
right above the plot. Click on the "Extended report" and use the values you find there to answer the checkpoint questions below.

:::{exercise}
:label: question1
Which of the samples has the highest N50 value?
:::
:::{solution} question1
:label: solution1
:class: dropdown
__sample4__: N50 = ~84797
:::

:::{exercise}
:label: question2
Which of the samples has the highest L50 value?
:::
:::{solution} question2
:label: solution2
:class: dropdown
__sample1__: L50 = ~2758
:::

:::{exercise}
:label: question3
Which of the samples has the highest number of mismatches per 100 kbp?
:::
:::{solution} question3
:label: solution3
:class: dropdown
__sample1__: ~308
:::

:::{exercise}
:label: question4
What is the length of the largest contig in _sample2_?
:::
:::{solution} question4
:label: solution4
:class: dropdown
__~77570 bp__
:::

:::{exercise}
:label: question5
In your opinion, which of the samples represents the best assembly? Provide a short justification.
:::
:::{solution} question5
:label: solution5
:class: dropdown
__sample4__: it has the best N50 value, it comprises a (relatively) small number of large contigs with the smallest count of mismatches and misassemlbies.
:::
