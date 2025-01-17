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
(setup)=
# Setup
Before we dive into the tutorial, let's make sure we have all the necessary components in place. Make sure you have a 
working MOSHPIT environment available - please follow the instructions from the developer 
[QIIME 2 documentation](https://develop.qiime2.org/en/latest/plugins/how-to-guides/set-up-development-environment.html#moshpit-previously-known-as-the-metagenome-distribution) 
to install all the required components. These installation instructions will also become available 
through the official QIIME 2 user documentation in the 2025.4 release later this year.

In this tutorial we will be storing all the data in the QIIME 2 cache. To learn more about how the cache works, you can refer to the [*Using an Artifact Cache* tutorial](https://use.qiime2.org/en/latest/tutorials/use-the-artifact-cache.html). (Note that all calls to `qiime` in that document can be replaced by calls to `mosh`.) 
You should create a single cache directory in the current working directory by running the following command:

```{code-cell}
mosh tools cache-create --cache ./cache
```

## Note on parallelization
While we do not explicitly mention parallelization in the tutorial, many of the QIIME 2 actions can be parallelized by 
executing actions on smaller subsets of the data called **partitions**. To make use of parallelization, you will need a
[parsl](https://parsl.readthedocs.io/en/stable/index.html) config file which will define the resources available to the 
parallel execution. Here is an example of a config file which was used to assemble contigs through the `assemble-megahit` 
action:
```{code-cell} 
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"
max_workers = 1

[parsl.executors.provider]
class = "SlurmProvider"
scheduler_options = "#SBATCH --mem-per-cpu=4G"
exclusive = false
worker_init = "source ~/.bashrc && conda activate q2-metagenome-2024.5"
walltime = "24:00:00"
nodes_per_block = 1
cores_per_node = 24
max_blocks = 14
```

To learn more about how to configure parallelization in QIIME 2, please consult the [official documentation](https://develop.qiime2.org/en/latest/framework/how-to-guides/parallel-configuration.html#parallel-configuration).

```{note}
 To examine your generated QIIME 2 visualizations, you can use [QIIME 2 View](view.qiime2.org).
```
