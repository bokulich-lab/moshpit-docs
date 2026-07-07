---
authors:
- mz
---
(e2e-functional-profiling)=
# Functional profiling of reads

:::{seealso} Workflow Guide
For a side-by-side comparison of read-based (HUMAnN 3) and MAG-based (EggNOG) functional profiling, see [How to profile functional potential](functional-profiling).
:::
So far we have focused on recovering and characterizing genomes from our mock-community 
reads. Another common question in shotgun metagenomics is what biochemical functions are 
present in a sample. For read-based functional profiling we will use 
[HUMAnN 3](https://doi.org/10.7554/eLife.65088), which maps reads to microbial gene 
families and reconstructs metabolic pathway abundances. In MOSHPIT, HUMAnN 3 is 
available through the [q2-humann3](https://github.com/bokulich-lab/q2-humann3) plugin.

HUMAnN 3 first performs taxonomic prescreening with MetaPhlAn 3, then searches reads 
against a nucleotide database (ChocoPhlAn) and a translated protein database (UniRef). 
The outputs include gene-family abundances, pathway abundances, a merged MetaPhlAn 
profile, and a reaction table derived from the gene families.

```{attention}
HUMAnN 3 is computationally intensive and its reference databases are large. The steps 
below may take a long time to run and require tens of gigabytes of disk space. If you 
are working on a laptop, consider running this section on a workstation or HPC cluster.
```

We will use the same `reads.qza` artifact generated in the [assembly section](assembly).

```{attention}
The functionality in this section is not available in the core MOSHPIT distribution.
Instead, it is provided by the separate `q2-humann3` plugin. Installation and usage
instructions are available from the QIIME 2 Library:
<https://library.qiime2.org/plugins/bokulich-lab/q2-humann3>.
```

## Database preparation
Before running HUMAnN 3, we need to download three reference databases. The 
`q2-humann3` plugin stages each database as a QIIME 2 artifact that can be passed 
directly to the profiling action.

First, download the ChocoPhlAn nucleotide database used for mapping reads to microbial 
gene families:

```{code} bash
qiime humann3 download-chocophlan-database \
    --o-database chocophlan-db.qza \
    --verbose
```

Next, download a MetaPhlAn 3 database for the taxonomic prescreening step:

```{code} bash
qiime humann3 download-metaphlan-database \
    --p-index latest \
    --p-cpus 4 \
    --o-database metaphlan-db.qza \
    --verbose
```

Finally, download a translated-search protein database. For this tutorial we will use 
the `uniref90_diamond` build, which provides a good balance between sensitivity and 
resource requirements:

```{code} bash
qiime humann3 download-translated-search-database \
    --p-build uniref90_diamond \
    --o-database uniref-db.qza \
    --verbose
```

## Run HUMAnN 3
With the databases in place, we can profile the tutorial reads using the `run-humann` 
pipeline action. This action runs HUMAnN 3 on every sample in the input artifact and 
returns merged tables of gene families, pathways, MetaPhlAn profiles, and reactions.

`````{tab-set}
````{tab-item} With parsl parallelization
You can speed up profiling by taking advantage of parsl parallelization support. We will 
use the same config as for genome assembly.

```{code} bash
qiime humann3 run-humann \
    --i-reads reads.qza \
    --i-nucleotide-database chocophlan-db.qza \
    --i-translated-search-database uniref-db.qza \
    --i-metaphlan-database metaphlan-db.qza \
    --p-threads 4 \
    --p-memory-use minimum \
    --o-gene-families humann-gene-families.qza \
    --o-path-abundance humann-path-abundance.qza \
    --o-metaphlan-profile humann-metaphlan-profile.qza \
    --o-reactions humann-reactions.qza \
    --parallel-config parallel.config.toml \
    --verbose
```
````

````{tab-item} Without parallelization
```{code} bash
qiime humann3 run-humann \
    --i-reads reads.qza \
    --i-nucleotide-database chocophlan-db.qza \
    --i-translated-search-database uniref-db.qza \
    --i-metaphlan-database metaphlan-db.qza \
    --p-threads 4 \
    --p-memory-use minimum \
    --o-gene-families humann-gene-families.qza \
    --o-path-abundance humann-path-abundance.qza \
    --o-metaphlan-profile humann-metaphlan-profile.qza \
    --o-reactions humann-reactions.qza \
    --verbose
```
````
`````

The action above produces four artifacts:

- `humann-gene-families.qza`: abundances of UniRef gene families detected in each sample.
- `humann-path-abundance.qza`: abundances of metabolic pathways (by default annotated with [MetaCyc](https://metacyc.org/)).
- `humann-metaphlan-profile.qza`: merged MetaPhlAn 3 taxonomic abundances from the HUMAnN prescreening step.
- `humann-reactions.qza`: reaction-level abundances regrouped from the gene-family table.

## MetaPhlAn visualization
In the [taxonomic classification section](05_taxonomic_classification) we classified 
reads with Kraken 2. The MetaPhlAn profile produced by HUMAnN 3 provides a 
complementary read-based view of community composition that is tightly integrated with 
the functional profiling workflow. Comparing the two can be a useful sanity check, 
though the tools use different reference databases and classification strategies.

To plot species-level abundances, convert the merged MetaPhlAn profile into standard 
QIIME 2 feature table and taxonomy artifacts using the `metaphlan-taxon` action from 
the `q2-sapienns` plugin:

```{code} bash
qiime sapienns metaphlan-taxon \
    --i-stratified-table humann-metaphlan-profile.qza \
    --p-level 7 \
    --o-table metaphlan-table.qza \
    --o-taxonomy metaphlan-taxonomy.qza \
    --verbose
```

The `--p-level 7` parameter selects species-level features (seven pipe-delimited 
taxonomic ranks in the MetaPhlAn clade names).

We can then visualize the results with the familiar `barplot2` action and compare them 
with the Bracken barplot from the taxonomic classification section:

```{code} bash
qiime taxa barplot2 \
    --i-table metaphlan-table.qza \
    --i-taxonomy metaphlan-taxonomy.qza \
    --o-visualization metaphlan-barplot.qzv \
    --verbose
```

## Pathway visualization
HUMAnN pathway tables are stratified by default, meaning that the same pathway can 
appear multiple times with taxonomic suffixes. For an overview plot across samples, it 
is often easier to work with a destratified table. We can convert the pathway 
abundances into standard QIIME 2 feature table and taxonomy artifacts using the 
`humann-pathway` action from the `q2-sapienns` plugin:

```{code} bash
qiime sapienns humann-pathway \
    --i-pathway-table humann-path-abundance.qza \
    --p-destratify \
    --o-table humann-pathways-table.qza \
    --o-taxonomy humann-pathways-taxonomy.qza \
    --verbose
```

We can then visualize the most abundant pathways using the familiar `barplot` action 
(you may need to switch back to the MOSHPIT conda environment):

```{code} bash
qiime taxa barplot \
    --i-table humann-pathways-table.qza \
    --i-taxonomy humann-pathways-taxonomy.qza \
    --o-visualization humann-pathways-barplot.qzv \
    --verbose
```

## Gene family visualization
If you are interested in the functional potential at the level of individual gene 
families rather than pathways, you can convert the gene-family table in the same way:

```{code} bash
qiime sapienns humann-genefamily \
    --i-genefamily-table humann-gene-families.qza \
    --p-destratify \
    --o-table humann-genefamilies-table.qza \
    --o-taxonomy humann-genefamilies-taxonomy.qza \
    --verbose
```

:::{tip} Next steps
- Explore stratified pathway tables by omitting `--p-destratify` from the `humann-pathway` action.
- Compare read-based HUMAnN profiles with the MAG-based functional annotation workflow in the {ref}`cocoa functional annotation tutorial <functional-annotation>`.
:::
