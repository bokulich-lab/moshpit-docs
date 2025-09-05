# Genome assembly
The first step in recovering metagenome-assembled genomes (MAGs) is genome assembly itself. There are many genome 
assemblers available, two of which you can use through our QIIME 2 plugin - here, we will use [MEGAHIT](https://github.com/voutcn/megahit). MEGAHIT 
takes short DNA sequencing reads, constructs a simplified [De Bruijn graph](https://en.wikipedia.org/wiki/De_Bruijn_graph), and generates longer contiguous 
sequences called **contigs**, providing valuable genetic information for the next steps of our analysis.

:::{hint} With parsl parallelization
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
    --i-reads ./reads.qza \
    --p-presets meta-sensitive \
    --p-cpu-threads 2 \
    --p-min-contig-len 200 \
    --o-contigs ./contigs.qza \
    --parallel-config ./parallel.config.toml \
    --verbose
```
:::

:::{note} Without parallelization
:class: dropdown
```{code} bash
mosh assembly assemble-megahit \
    --i-reads ./reads.qza \
    --p-presets meta-sensitive \
    --p-cpu-threads 2 \
    --p-min-contig-len 200 \
    --o-contigs ./contigs.qza \
    --verbose
```
:::

Once the reads are assembled into contigs, we can use QUAST to evaluate the quality of our assembly. There are many metrics, 
which can be used for that purpose, but here we will focus on the two most popular [metrics](https://en.wikipedia.org/wiki/N50,_L50,_and_related_statistics):
- **N50**: represents the contiguity of a genome assembly. It's defined as the length of the contig (or scaffold) at which 50% of the entire genome is covered by contigs of that length or longer - the higher this number, the better.
- **L50**: represents the number of contigs required to cover 50% of the genome's total length - the smaller this number, the better.

In addition to calculating generic statistics like N50 and L50, QUAST will try to identify potential genomes from which 
the analyzed contigs originated. Alternatively, we can provide it with a set of reference genomes we would like it to 
run the analysis against. Since we generated the reads from an "artificial" mock community, we will provide the 
reference sequences for those genomes—this will save us a bit of work and time. Run the following cell to assess the 
quality of contigs assembled in the previous step:

```{code} bash
mosh assembly evaluate-quast \
    --i-contigs ./contigs.qza \
    --i-references ./ref-seqs.qza \
    --p-min-contig 500 \
    --p-threads 4 \
    --o-reference-genomes ./ref-genomes.qza \
    --o-visualization ./contigs.qzv \
    --o-results-table ./quast-results.qza
```
Navigate to the [QIIME 2 View](https://view.qiime2.org) and upload the `contigs.qzv` file to see the visualization.
There are many things to look at here! Don't worry, it is not our goal to Let's try to understand all of that information, 
though. Let's focus on the metrics we mentioned above - you will find them on the "QC report" tab, in the colorful table 
right above the plot. Click on the "Extended report" and use the values you find there to answer the checkpoint questions below.

<div style="background-color: aliceblue; padding: 10px;">
    
**Checkpoint A**

1. Which of the samples has the highest N50 value?

    __sample4__: N50 = ~84797

2. Which of the samples has the highest L50 value?
    
    __sample1__: L50 = ~2758

3. Which of the samples has the highest number of mismatches per 100 kbp?

    __sample1__: ~308

4. What is the length of the largest contig in _sample2_?
    
    __~77570 bp__

5. In your opinion, which of the samples represents the best assembly? Provide a short justification.

    __sample4__: it has the best N50 value, it comprises a (relatively) small number of large contigs with the smallest count of mismatches and misassemlbies.
</div>
