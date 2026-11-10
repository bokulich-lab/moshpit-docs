(nf-moshpit-execution)=
# Execution: local runs and Slurm

Choose **one executor** and **one runtime**, then optionally add resource profiles. The parameter file determines the analysis; profiles determine where and how its jobs run.

## Choose a runtime

| Runtime profile | Parameter | Requirement |
| --- | --- | --- |
| `conda` | `condaEnv` | Absolute path to an installed MOSHPIT environment available on execution nodes. |
| `docker` | `container` | Docker image tag/reference containing the required software; Docker available to execution jobs. |
| `singularity` | `container` | Accessible Singularity SIF image containing the required software; Singularity available on execution nodes. |

The workflow invokes `qiime` and `multiqc`, so ensure both commands and every selected plugin are available. The validator checks runtime parameters, but does not activate a runtime automatically: you still need the matching `-profile`.

### Local conda

```bash
nextflow run bokulich-lab/nf-moshpit \
  -r 2026.10.0 \
  -params-file params.yml \
  -profile standard,conda \
  -work-dir /scratch/study-work
```

Use a host with enough RAM for concurrent tasks. The [quick start](#nf-moshpit-quick-start) gives a database-free conda configuration.

### Local Docker

Set `container` to your actual MOSHPIT image reference, clear `condaEnv`, then run:

```bash
nextflow run bokulich-lab/nf-moshpit \
  -r 2026.10.0 \
  -params-file params.yml \
  -profile standard,docker \
  -work-dir /scratch/study-work
```

### Slurm and Singularity

Set `container` to your SIF image and clear `condaEnv`. The configured Singularity profile uses `$HOME/q2_home` as the QIIME 2 home directory, and binds `$HOME`, `$TMPDIR`, and `outputDir`:

```bash
export NXF_SINGULARITY_HOME_MOUNT=true
mkdir -p "$HOME/q2_home"

nextflow run bokulich-lab/nf-moshpit \
  -r 2026.10.0 \
  -params-file params.yml \
  -profile slurm,singularity \
  -work-dir /scratch/study-work
```

Ensure `$TMPDIR` is set to a suitable path by your cluster job environment. The profile sets `singularity.autoMounts = false`: bind other locations needed by tasks, including input caches and reference databases. For example:

```yaml
additionalVolumeMounts: "-B /data:/data -B /scratch:/scratch"
additionalContainerOptions: ""
```

The same paths must be accessible inside the container and on the host. Network-drive permissions may also require a group-specific option such as `--security='gid:1234'`; use the group required by your site, rather than copying an example ID.

Keep the Nextflow driver running on a node or in a scheduler job supported by your cluster. Its Slurm executor submits process jobs; inspect them with `squeue -u "$USER"`. For steps labelled `needsInternet`, set `internetModule` if your cluster provides network access through an environment module.

## Site-specific Slurm settings

Keep scheduler configuration in a separate `site.config`, rather than editing the workflow's shipped resource file. For example:

```groovy
process {
    queue = 'batch'
    clusterOptions = '--account=myproject'
}
```

Replace the partition and account with those assigned to you. Pass the file with `-c site.config`. Some processes specify their own `clusterOptions`, so check the affected process settings when an account or partition is not applied as expected.

## Allocate resources

The workflow defines process resources in `conf/resources.config`. Profiles apply scaling factors:

| Profile | CPU scale | Memory scale | Time scale |
| --- | --- | --- | --- |
| `low` | 0.5 | 0.5 | 0.75 |
| `medium` | 1 | 1 | 1 |
| `high` | 2 | 2 | 1 |
| `quick_test` | 0.25 | 0.25 | 0.5 |
| `long_jobs` | 1 | 1 | 3 |

`cpu_intensive` and `mem_intensive` request a 1.5 multiplier where resource expressions use the corresponding parameter. Not all processes use these expressions; some set resources explicitly, including database-dependent memory.

Choose at most one general scaling profile. `quick_test` is a resource reduction, not a bundled test dataset. `long_jobs` and the emphasis profiles also assign other scaling values, so combining them can reset earlier settings. Check the resolved configuration for your installed Nextflow version rather than assuming multipliers accumulate.

For precise overrides, add a selector to `site.config`:

```groovy
process {
    withName: ASSEMBLE_MEGAHIT {
        cpus = 8
        memory = '32 GB'
        time = '24h'
    }
}
```

Use the names in your task log; account for subworkflow-qualified names if needed. CPU, memory, and time belong in the Nextflow config, not as arbitrary keys in `params.yml`.

## Plugin-specific containers

With Docker or Singularity, `container` is the general fallback. You can override selected groups with `containerAnnotate`, `containerAssembly`, `containerMag`, `containerFastp`, `containerSourmash`, `containerCheckM`, or `containerHumann3`. MAG processes can also fall back to `containerAnnotate`. Inspect `conf/containers.config` for the exact process selectors.

Prefer a complete base image and add overrides where required. Overrides must be compatible with the QIIME 2 artifacts passed between steps.

**Next:** [Monitor outputs and resume a run](#nf-moshpit-results).
