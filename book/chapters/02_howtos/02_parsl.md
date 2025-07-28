(parsl)=
# How to use parsl parallelization
Many of the QIIME 2 actions can be parallelized by executing actions on smaller subsets of the data 
called **partitions**. To make use of parallelization, you will need a[parsl](https://parsl.readthedocs.io/en/stable/index.html) config file which 
will define the resources available to the parallel execution. You can read more about how parallelization 
works in QIIME 2 by heading to one of the following resources:

- [parallel pipeline execution](https://use.qiime2.org/en/latest/tutorials/parallel-pipeline.html)
- [pipeline configuration](https://use.qiime2.org/en/latest/references/parallel-configuration.html)

Here is an example of a config file which was used to assemble contigs through the `assemble-megahit` 
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
worker_init = "source ~/.bashrc && conda activate q2-moshpit-2025.4"
walltime = "24:00:00"
nodes_per_block = 1
cores_per_node = 24
max_blocks = 14
```

This will start up to 14 parallel workers (`max_blocks`), each with 24 cores (`cores_per_node`) on a single node (`nodes_per_block`). 
We tell each worker which conda environment to use (`worker_init`) and for how long the resources should be requested (`walltime`). 
Finally, we can pass any additional flag to the scheduler using the `scheduler_options` directive - here we are specifying that each 
worker should receive 4GB of RAM per CPU (so 96GB total per worker).
