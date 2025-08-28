(data-export)=
# How to connect with other tools
QIIME 2 offers various ways of visualizing and processing your data further, but sometimes you may want to use other tools 
that are not (yet) available through QIIME 2. This is, of course, possible and very easy to do: you can export your data 
from any QIIME 2 artifact and use it with any of your other favourite tools, as long as the underlying format is compatible. 
The formats that QIIME 2 supports are common and should be readable by most bioinformatics tools - most of the time, the 
artifacts will contain data in the original format that the underlying tool uses. Below are some examples of how you can
export data from QIIME 2 and connect it with other tools.

```{warning}
QIIME 2 does not yet support exporting data from the cache (see below). This means that you will need to manually copy the data from the 
cache directory to a location where you can access it with other tools. In our examples, the cache directory is located directly 
in the working directory and that is where we will copy the data from. Keep in mind that you should never tamper with the files 
in the cache directory directly, as this may lead to broken artifacts and failed analyses. 
```

## Visualizing Kraken 2 reports with Pavian
If you have used Kraken 2 to [classify your reads](kraken-reads), you can export the resulting reports from the corresponding 
QIIME 2 artifact and visualize them with [Pavian](https://github.com/fbreitwieser/pavian) which will allow you to explore the 
taxonomic composition of your samples in an interactive way. To export the Kraken 2 reports, you can use the following commands:

`````{tab-set}
````{tab-item} Direct export
Support for extracting data out of the cache is not yet available but is coming soon! You can track the progress of 
the issue [here](https://github.com/qiime2/qiime2/issues/822).
````

````{tab-item} Workaround 1: without using QIIME
```bash
UUID=$(cat ./cache/keys/kraken_reports_reads | grep 'data' | awk '{print $2}')
mkdir ./exported_reports
cp -r ./cache/data/$UUID/data/* ./exported_reports/
```
This will find the UUID of the reports artifact, use it to locate the data within the cache directory, create a directory 
for the exported data and copy the files from the cache into it.
````

````{tab-item} Workaround 2: with QIIME
```bash
mosh tools cache-fetch \
    --cache ./cache \
    --key kraken_reports_reads \
    --output-path ./kraken_reports_reads.qza

mosh tools export \
    --input-path ./kraken_reports_reads.qza \
    --output-path ./exported_reports
```
This will first fetch the reports artifact from the cache and then export it to the `exported_reports` directory.
````
`````

Once you got the data into the `exported_reports` directory, you can then use those with Pavian. 
To give it a quick try, navigate to [Pavian's demo site](https://fbreitwieser.shinyapps.io/pavian/) and upload the exported files.

## Microbial pangenomics with Anvi'o
Another suite of tools you may be familiar with is the [Anvi'o](http://anvio.org/) platform. One of the workflows that Anvi'o 
provides is the microbial pangenomics analysis, which can be used to explore the gene clusters within your samples. You 
could export the MAGs obtained from the [binning step](mag-recovery) and use them as input to the `anvi-pan-genome` workflow, as 
described [here](https://merenlab.org/2016/11/08/pangenomics-v2/). To export the MAGs, you can use the following command:
`````{tab-set}
````{tab-item} Direct export
Support for extracting data out of the cache is not yet available but is coming soon! You can track the progress of 
the issue [here](https://github.com/qiime2/qiime2/issues/822).
````

````{tab-item} Workaround 1: without using QIIME
```bash
UUID=$(cat ./cache/keys/mags | grep 'data' | awk '{print $2}')
mkdir ./exported_mags
cp -r ./cache/data/$UUID/data/* ./exported_mags/
```
This will find the UUID of the MAGs artifact, use it to locate the data within the cache directory, create a directory 
for the exported data and copy the files from the cache into it.
````

````{tab-item} Workaround 2: with QIIME
```bash
mosh tools cache-fetch \
    --cache ./cache \
    --key mags \
    --output-path ./mags.qza

mosh tools export \
    --input-path ./mags.qza \
    --output-path ./exported_mags
```
This will first fetch the MAGs artifact from the cache and then export it to the `exported_mags` directory.
````
`````
