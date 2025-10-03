---
authors:
- mz
---
# Genome assembly
The first step in recovering metagenome-assembled genomes (MAGs) is genome assembly itself. There are many genome 
assemblers available, two of which you can use through our MOSHPIT plugin - here, we will use [MEGAHIT](https://doi.org/10.1093/bioinformatics/btv033). 
MEGAHIT takes short DNA sequencing reads, constructs a simplified [De Bruijn graph](https://en.wikipedia.org/wiki/De_Bruijn_graph), and generates longer contiguous 
sequences called {term}`contig`s, providing valuable genetic information for the next steps of our analysis.

The reads generated for this tutorial can be downloaded using the following command:
```{code} bash
wget -O reads.qza \
    https://polybox.ethz.ch/index.php/s/rgXpDtCMgRgyeKB/download
```

You can run the assembly using the following command:
`````{tab-set}
````{tab-item} With parsl parallelization
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
    --p-num-cpu-threads 2 \
    --p-min-contig 500 \
    --o-contigs contigs.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````

````{tab-item} Without parallelization
```{code} bash
mosh assembly assemble-megahit \
    --i-reads reads.qza \
    --p-presets meta-sensitive \
    --p-num-cpu-threads 2 \
    --p-min-contig 500 \
    --o-contigs contigs.qza \
    --verbose
```
````
`````

Once the reads are assembled into contigs, we can use [QUAST](https://doi.org/10.1093/bioinformatics/btt086) to evaluate the quality of our assembly. There are many metrics 
that can be used for that purpose, but here we will focus on the two most popular [metrics](https://en.wikipedia.org/wiki/N50,_L50,_and_related_statistics): 
{term}`N50` and {term}`L50`. In addition to calculating generic statistics like N50 and L50, QUAST will try to identify potential genomes from which 
the analyzed contigs originated. Alternatively, we can provide it with a set of reference genomes we would like it to 
run the analysis against. Since we generated the reads from an "artificial" mock community, we will provide the 
reference sequences for those genomes—this will save us a bit of work and time. 

First, fetch the reference genomes that QUAST will use to compare our contigs against:
```{code} bash
wget -O reference-genomes.qza \
    https://polybox.ethz.ch/index.php/s/dRdDSZJcxH4LRgk/download
```

Then, run the following command to assess the quality of contigs assembled in the previous step:

```{code} bash
mosh assembly evaluate-quast \
    --i-contigs contigs.qza \
    --i-references reference-genomes.qza \
    --p-threads 4 \
    --p-min-contig 500 \
    --o-ref-genomes ref-genomes.qza \
    --o-results-table quast-results.qza \
    --o-visualization contigs-qc.qzv \
    --verbose
```

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
