(fetch)=
# How to fetch large datasets
The datasets originating from shotgun metagenomics experiments can demand substantial 
storage capacity. Fetching those from online archives like [Sequence Read Archive (SRA)](https://www.ncbi.nlm.nih.gov/sra) 
or [European Nucleotide Archive (ENA)](https://www.ebi.ac.uk/ena/browser/) can take, hence, 
take a lot of time if the download process is not parallelized in any way. The [q2-fondue](https://github.com/bokulich-lab/q2-fondue) 
plugin allows QIIME 2 users to easily fetch datasets from the SRA archive by simply providing 
a list of accession IDs. Since the 2025.7 release of the plugin it is also possible to accelerate 
the download process by using the built-in [parsl parallelization](parsl) support.

:::{tip} Example
:class: tip:
Imagine you want to fetch a dataset containing **30 samples**. For this purpose you 
would like to request **5 workers** which will be fetching the samples in parallel.
:::

We are assuming here that you already imported your accession IDs into the `NCBIAccessionIDs` 
artifact (see [here](https://github.com/bokulich-lab/q2-fondue#import-accession-ids) for more info). 
You will first need to construct a parsl config matching your resource requirements:

## Scenario 1: you are fetching on a local machine
```{code} bash 
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"

[parsl.executors.provider]
class = "LocalProvider"
max_blocks = 5
```

## Scenario 2: you are fetching on an HPC
```{code} bash 
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"

[parsl.executors.provider]
class = "SlurmProvider"
worker_init = "source ~/.bashrc && conda activate q2-moshpit-2025.10"
walltime = "6:00:00"
nodes_per_block = 1
cores_per_node = 1
mem_per_node = 4
max_blocks = 5
```
::::{aside}
:::{caution}
:class: caution:
Do not request more than one CPU per parsl worker — each worker will only process one run 
at a time, so requesting more than one CPU will not speed up the process.
:::
::::

Both of the above configurations will result in a pool of five workers, one CPU each. 
You can then run the `get-sequences` action in the following way:
```shell
mosh fondue get-sequences \
    --i-accession-ids <path to the accession ids> \
    --p-email <your e-mail address> \
    --p-threads <count of threads> \
    --parallel-config <path to the parsl config> \
    --output-dir <path to the results directory>
```

::::{aside}
:::{tip}
:class: tip:
You can set the `--p-threads` parameter to a small number, like 3–5. This is used by the 
`prefetch` tool to fetch the data using multiple threads and is _independent_ of the parsl 
parallelization.
:::
::::

:::{attention}
:class: attention:
Be mindful of how many parallel downloads (workers) you are requesting — going overboard 
with those may lead to a decrease in the performance of the NCBI servers.
:::
