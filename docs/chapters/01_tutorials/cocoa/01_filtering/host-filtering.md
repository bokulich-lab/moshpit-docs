---
authors:
- mz
---
# Host read removal
There are a few different options to perform host read removal in QIIME 2: a more generic one using the `filter-reads` action
and a more specific one using the `filter-reads-pangenome` action. Below you can learn how to use both of them. In this tutorial we will 
use the `filter-reads-pangenome` action to remove human reads from the dataset.

### Multiple host read removal
For cases in which a pangenome reference does not exist, or filtering reads from multiple hosts is warented, the example commands below can be "daisy-chained" (*i.e.* output from one filtering step is fed into the next) to remove reads from several host reference genomes. That is, you may want to remove all murine and human host reads from your samples prior to analyes. It's often a good idea to start read removal with the host from which you are generating microbial sequence data. 

For example, let's assume you are generating microbial sequence data from the rat host, *Rattus norvegicus*. You'd likely start with the removal of reads from the rat reference (pan)genome, and perhaps followed by filtering against the mouse, *Mus musculus* (pan)genome. This will better ensure that murine host reads are removed from the sequencing data. You can then continue with host removal the human (pan)genome as well, to ensure general read removal of mamalian reads from your data. 

## Removal of contaminating reads
Removal of contaminating reads can generally be done by mapping the reads to a reference database and filtering out the reads
that map to it. In QIIME 2 this can be done by using the `filter-reads` action from the `quality-control` plugin. Before filtering
we need to construct the index of the reference database that will be used by Bowtie 2:
- start with the FASTA files containing the reference sequences - we will import them into a QIIME 2 artifact:
```{code} bash
mosh tools cache-import \
    --cache cache \
    --key reference_seqs \
    --type "FeatureData[Sequence]" \
    --input-path reference_seqs.fasta
```
- build the Bowtie 2 index:
```{code} bash
mosh quality-control bowtie2-build \
    --i-sequences cache:reference_seqs \
    --o-database cache:reference_index
```
- filter out the reads that map to the reference database:
```{code} bash
mosh quality-control filter-reads \
    --i-demultiplexed-sequences cache:reads_trimmed \
    --i-database cache:reference_index \
    --o-filtered-sequences cache:reads_filtered
```

## Human host reads
Contaminating human reads can also be filtered out using the approach shown above by providing a human reference genome.
Since a single human reference genome is not enough to cover all the human genetic diversity, it is recommended to use a
collection of genomes represented by the human pangenome (https://doi.org/10.1038/s41467-025-56077-5). We have built a new QIIME 2 action `filter-reads-pangenome`
which allows to first fetch the human pangenome sequence, combine it with the GRCh38 reference genome, build a combined 
Bowtie 2 index and, finally, filter the reads against it. Next to the filtered reads, the action will also return the generated 
index so that it can be used in any other experiments.
```{code} bash
mosh annotate filter-reads-pangenome \
    --i-reads cache:reads_trimmed \
    --o-filtered-reads cache:reads_filtered \
    --o-reference-index cache:human_reference_index
```
