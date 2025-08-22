(parsl)=
# How to use parsl parallelization
Many of the QIIME 2 actions can be parallelized by executing actions on smaller subsets of the data 
called **partitions**. To make use of parallelization, you will need a [parsl](https://parsl.readthedocs.io/en/stable/index.html) config file which 
will define the resources available to the parallel execution. You can read more about how parallelization 
works in QIIME 2 by heading to one of the following resources:

- [parallel pipeline execution](https://use.qiime2.org/en/latest/tutorials/parallel-pipeline.html)
- [pipeline configuration](https://use.qiime2.org/en/latest/references/parallel-configuration.html)

:::{tip} Example
:class: tip:
Imagine you want to run genome assembly on 100 samples. You would like to 
request **25 workers**, each with **12 CPUs** and **96GB RAM** (if you let MOSHPIT partition the data for 
you by not specifying the number of partitions through the `--p-num-partitions` parameter this configuration 
would mean that on average 4 samples will be process by a single worker). You will run your analysis in 
an HPC environment with the **Slurm** job scheduler. You want to request the resources for 24 hours.
:::

The table below shows the parameters which you need to set in the parsl config file for each of 
the above values:

| requirement  | parsl config parameter | value |
|--------------|------------------------|-------|
| worker cpus  | cores_per_node         | 12    |
| worker RAM   | mem_per_node           | 96GB  |
| worker count | max_blocks             | 25    |
| runtime      | walltime               | 24h   |

The final config file would then look like this:
```{code-cell} 
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"

[parsl.executors.provider]
class = "SlurmProvider"
worker_init = "source ~/.bashrc && conda activate q2-moshpit-2025.10"
walltime = "24:00:00"
nodes_per_block = 1
cores_per_node = 12
mem_per_node = 96
max_blocks = 25
```

Some HPCs may not allow passing certain flags to the batch system, e.g., sometimes it is not 
possible to set the total amount of memory per node but rather per CPU. In those cases you can 
use the `scheduler_options` directive to pass any flag that your HPC supports, e.g.:
```{code-cell} 
[parsl]

[[parsl.executors]]
class = "HighThroughputExecutor"
label = "default"

[parsl.executors.provider]
class = "SlurmProvider"
scheduler_options = "#SBATCH --mem-per-cpu=8G"
worker_init = "source ~/.bashrc && conda activate q2-moshpit-2025.10"
walltime = "24:00:00"
nodes_per_block = 1
cores_per_node = 12
max_blocks = 25
```

Notice how we are also adding the `worker_init` directive to properly activate the same conda 
environment in each worker. 


This is, of course, only one scenario — depending on your exact use case, resource requirements and 
HPC configuration, the final config file may look different. To see the list of all available resource 
providers, you can head to the [parsl documentation](https://parsl.readthedocs.io/en/stable/reference.html#providers).

