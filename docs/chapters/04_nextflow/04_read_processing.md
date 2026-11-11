(nf-moshpit-read-processing)=
# Read processing

Reads pass through **optional subsampling → fastp QC → optional host removal → optional sample filtering**. All downstream analyses use the retained reads. Start by inspecting the fastp and read-count reports, then adjust filters for your dataset.

The snippets below update sections of an existing parameter file; retain its other settings.

## Subsampling

Subsampling reduces the data entering every subsequent stage. It can be useful for a pilot run; it also changes the data supporting your analysis.

```yaml
read_subsampling:
  enabled: true
  paired: true
  fraction: 0.1
```

`fraction` is the fraction of reads to retain (the configured default is `0.8`). Match `paired` to your input layout. Disable subsampling for a full-depth run when appropriate.

## Quality control with fastp

fastp runs for every sample; there is no workflow-level switch to skip it. The main settings are:

| Parameter under `read_qc.fastp` | Code default | Effect |
| --- | --- | --- |
| `disableQualityFiltering` | `false` | Set `true` to disable fastp quality filtering. |
| `deduplicate` | `false` | Set `true` to enable deduplication. |
| `disableAdapterTrimming` | `true` | Set `false` to enable adapter trimming. |
| `enableBaseCorrection` | `true` | Enable overlap-based base correction where applicable. |
| `additionalFlags` | `""` | Additional flags passed to the QIIME 2 `fastp process-seqs` action. |

For quality filtering with adapter trimming enabled:

```yaml
read_qc:
  fastp:
    disableQualityFiltering: false
    deduplicate: false
    disableAdapterTrimming: false
    enableBaseCorrection: true
    additionalFlags: ""
```

`additionalFlags` must use the QIIME 2 action's options, rather than assuming that raw fastp command-line flags are accepted. Check `qiime fastp process-seqs --help` in your runtime. Samples with no reads left after fastp can be excluded while other samples continue; inspect sample counts as well as the final execution status.

## Host removal

To use an existing cached host-reference artifact:

```yaml
host_removal:
  enabled: true
  human: false
  mode: "local"
  sensitivity: "sensitive"
databases:
  hostRemoval:
    cache: /data/reference-cache
    key: host_reference
```

The workflow uses `quality-control filter-reads` when that cache entry exists. Check that the entry has the semantic type expected by that action in your runtime. `mode`, `sensitivity`, and the reference gap penalties configure the alignment behavior.

With `human: true` and no existing entry, the workflow calls `annotate filter-reads-pangenome` and writes a `human_reference_index` entry. This fallback needs internet access and writable database storage. To reuse the generated entry later, set the key to `human_reference_index`. For a non-human host, prepare the reference beforehand and use `human: false`.

See [Databases](#nf-moshpit-databases) for cache preparation and [quality-control guidance](#qc-every-step) for deciding which filtering strategy is appropriate.

## Exclude samples with too few reads

Filtering happens after fastp and host removal, so the cutoff applies to **retained reads**:

```yaml
sample_filtering:
  enabled: true
  minReads: 1000
```

The query uses a strict **greater-than** comparison: a sample with exactly `1000` counted reads is excluded in this example. Choose the threshold for your intended analysis.

## Keep or remove intermediates

Keep the default retention flags during a pilot run:

```yaml
retain:
  input: true
  subsampling: true
  fastp: true
  host_removal: true
```

Setting a flag to `false` removes the upstream cache key once the corresponding downstream step has finished. For example, `retain.input: false` removes input reads after subsampling, or after fastp if subsampling is disabled. See [Results and resuming](#nf-moshpit-retention) before using cleanup to save space.

**Next:** inspect the [QC reports](#nf-moshpit-results), then add [profiling](#nf-moshpit-profiling) or [assembly](#nf-moshpit-assembly-mags).
