---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.11.5
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---
(data-export)=
# Exporting data and connecting with other tools
QIIME 2 offers various ways of visualizing and processing your data further, but sometimes you may want to use other tools 
that are not (yet) available through QIIME 2. This is, of course, possible and very easy to do: you can export your data 
from any QIIME 2 artifact and use it with any of your other favourite tools, as long as the underlying format is compatible. 
The formats that QIIME 2 supports are common and should be readable by most bioinformatics tools - most of the time, the 
artifacts will contain data in the original format that the underlying tool uses. Below are some examples of how you can
export data from QIIME 2 and connect it with other tools.

```{warning}
QIIME 2 does not yet support exporting data from the cache. This means that you will need to manually copy the data from the 
cache directory to a location where you can access it with other tools. In our examples, the cache directory is located directly 
in the working directory and that is where we will copy the data from. Keep in mind that you should never temper with the files 
in the cache directory directly, as this may lead to broken artifacts and failed analyses. 
```

## Visualizing Kraken 2 reports with Pavian
If you have used Kraken 2 to [classify your reads](kraken-reads), you can export the resulting reports from the corresponding 
QIIME 2 artifact and visualize them with [Pavian](https://github.com/fbreitwieser/pavian) which will allow you to explore the 
taxonomic composition of your samples in an interactive way. To export the Kraken 2 reports, you can use the following commands:
```bash
UUID=$(cat ./cache/keys/kraken_reports_reads | grep 'data' | awk '{print $2}')
mkdir exported_reports
cp -r ./cache/data/$UUID/data/* exported_reports/
```
This will find the UUID of the reports artifact, use it to locate the data within the cache directory, create a directory 
for the exported data and copy the files from the cache into it. You can then use those files (within the `exported_reports` 
directory) with Pavian. To give it a quick try, navigate to [Pavian's demo site](https://fbreitwieser.shinyapps.io/pavian/) 
and upload the exported files.

## Microbial pangenomics with Anvi'o
Another suite of tools you may be familiar with is the [Anvi'o](http://anvio.org/) platform. One of the workflows that Anvi'o 
provides is the microbial pangenomics analysis, which can be used to explore the gene clusters within your samples. You 
could export the MAGs obtained from the [binning step](mag-recovery) and use them as input to the `anvi-pan-genome` workflow, as 
described [here](https://merenlab.org/2016/11/08/pangenomics-v2/). To export the MAGs, you can use the following command:
```bash
UUID=$(cat ./cache/keys/mags | grep 'data' | awk '{print $2}')
mkdir exported_mags
cp -r ./cache/data/$UUID/data/* exported_mags/
```
