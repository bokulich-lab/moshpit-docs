---
authors:
- mz
---
# MAG abundance estimation
Once we recover MAGs from metagenomic data, we may be interested in estimating their abundance in the samples. We can do 
it by mapping the original reads to the dereplicated MAGs and calculating the abundance based on the read mapping results.
There are a couple of ways to estimate MAG abundance, such as RPKM (Reads Per Kilobase per Million mapped reads) and TPM
(Transcripts Per Million). Here we will use TPM to estimate the abundance of each MAG in all samples.

## Get MAG lengths
This step calculates the lengths of each dereplicated MAG, which will be used in the next step to estimate abundance.
```{code-cell}
mosh annotate get-feature-lengths \
    --i-features ./cache:mags_derep \              
    --o-lengths ./cache:mags_derep_length \ 
    --verbose                         
```

## Index dereplicated MAGs
This step indexes the dereplicated MAGs for read mapping. The index is necessary to efficiently map the input reads back to the MAGs.
```{code-cell}
mosh assembly index-derep-mags \
    --i-mags ./cache:mags_derep \                  
    --p-threads 8 \  
    --p-seed 100 \                                   
    --o-index ./cache:mags_derep_index \
    --verbose                            
```

## Map reads to dereplicated MAGs
In this step, we map the input paired-end reads back to the dereplicated MAGs. This helps in calculating the abundance 
of each MAG in the sample.
```{code-cell}
mosh assembly map-reads \
    --i-index ./cache:mags_derep_index \                            
    --i-reads ./cache:reads_filtered \   
    --p-threads 8 \  
    --p-seed 100 \                  
    --o-alignment-maps ./cache:reads_to_derep_mags \
    --verbose            
```

## Estimate MAG abundance
This step estimates the abundance of each MAG in the sample based on the read mapping results.
- `metric` : currently, we support RPKM and TPM
- `min-mapq` : indicates the minimum required read mapping quality — for Bowtie2, 42 will allow only perfect matches to be retained
- `min-base-quality` : only keep alignments with this minimal Phred quality score

For more options, see `--help`.
```{code-cell}
mosh annotate estimate-abundance \
    --i-feature-lengths ./cache:mags_derep_length \
    --i-alignment-maps ./cache:reads_to_derep_mags \
    --p-threads 10 \
    --p-metric tpm \
    --p-min-mapq 42 \
    --o-abundances ./cache:mags_derep_ft \
    --verbose
```

## Let's have a look at our estimated MAG abundance!
First, we will use Kraken 2 to classify provided MAGs into taxonomic groups.
```{note}
Refer to {ref}`kraken-reads` section for more details on taxonomic classification with Kraken 2.
```

The database used here is the `PlusPF` database, defined [here](https://benlangmead.github.io/aws-indexes/k2).
```{code-cell}
mosh annotate classify-kraken2 \
    --i-seqs ./cache:mags_derep \
    --i-db ./cache:kraken2_db \
    --p-threads 40 \
    --p-confidence 0.5 \
    --p-report-minimizer-data \
    --o-reports ./cache:kraken_reports_mags_derep \
    --o-outputs ./cache:kraken_hits_mags_derep \
    --verbose
```

Then we will convert a Kraken 2 report into a generic taxonomy artifact for downstream analyses.
```{code-cell}
mosh annotate kraken2-to-mag-features \
    --i-reports ./cache:kraken_reports_mags_derep  \
    --i-outputs ./cache:kraken_hits_mags_derep  \
    --o-taxonomy ./cache:mags_derep_taxonomy \
    --verbose
```

Now we are ready to generate a taxa bar plot.
```{code-cell}
mosh taxa barplot \
    --i-table ./cache:mags_derep_ft \
    --i-taxonomy ./cache:mags_derep_taxonomy \
    --m-metadata-file ./cocoa-metadata.tsv \
    --o-visualization ./results/mags-derep-taxa-bar-plot.qzv \
    --verbose
```
Your visualization should look similar to [this one](https://view.qiime2.org/visualization/?src=https://raw.githubusercontent.com/bokulich-lab/moshpit-docs/main/moshpit_docs/data/mags-derep-taxa-bar-plot.qzv).
