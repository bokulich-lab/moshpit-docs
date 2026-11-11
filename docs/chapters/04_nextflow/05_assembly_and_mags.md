(nf-moshpit-assembly-mags)=
# Assembly and MAG reconstruction

Enable stages in this order: **assembly → binning → dereplication**. Assembly and binning operate on individual samples; dereplication selects representatives from the collated MAG collection. The snippets update your existing parameter file.

## Assemble contigs

```yaml
genome_assembly:
  enabled: true
  assembler: "megahit"
  fetchArtifact: true
  megahit:
    presets: "meta-large"
    kList: "21 29 39 59 79 99 119 141"
    minContigLen: 200
    additionalFlags: ""
  filtering:
    enabled: true
    removeEmpty: true
    lengthThreshold: 500
assembly_qc:
  enabled: true
  useMappedReads: false
  quast:
    enabled: false
    useMappedReads: false
    additionalFlags: ""
```

`assembler` accepts `megahit` or `metaspades`. MEGAHIT options go under `genome_assembly.megahit`; metaSPAdes options go under `genome_assembly.spades`, including `k`, `covCutoff`, and `additionalFlags`. The workflow does not currently configure coassembly across samples.

Contig filtering is separate from the assembler's minimum output length. In this example the assembler produces contigs of at least 200 bases and the downstream filter retains contigs according to a 500-base threshold. Adjust both deliberately.

`assembly_qc.enabled` enables contig evaluation; `assembly_qc.quast.enabled` adds QUAST. Read mapping also runs when required for binning or contig abundance.

## Reconstruct MAGs

With assembly enabled, add binning. MetaBAT 2 is the default binner:

```yaml
binning:
  enabled: true
  primary: "metabat2"
  fetchArtifact: true
  metabat2:
    enabled: true
    min_contig: 1500
    seed: 42
  semibin2:
    enabled: false
```

MetaBAT 2's explicit `min_contig` value must be at least `1500`. Alternatively enable SemiBin 2:

```yaml
binning:
  enabled: true
  primary: "semibin2"
  metabat2:
    enabled: false
  semibin2:
    enabled: true
    environment: "global"
    training_type: "semi"
    min_len: 1500
    epochs: 15
    batch_size: 2048
    random_seed: 100
```

`training_type` accepts `semi` or `self`. You can enable multiple binners to compare outputs. `primary` must name an enabled binner and selects the MAG collection used for subsequent dereplication and profiling.

### Use VAMB

VAMB is also available in `2026.10.0`. To use it instead of MetaBAT 2, merge these settings into your configuration:

```yaml
binning:
  enabled: true
  primary: "vamb"
  metabat2:
    enabled: false
  semibin2:
    enabled: false
  vamb:
    enabled: true
    min_contig_len: 2000
    minfasta: 2000
    seed: 42
    additionalFlags: ""
```

VAMB runs per sample, using the assembled contigs and read mappings; this does not enable coassembly across samples.

## Assess and filter MAG quality

BUSCO and CheckM are optional and have separate database requirements. To enable BUSCO and use its results for filtering, merge these settings into `binning.qc`:

```yaml
binning:
  qc:
    busco:
      enabled: true
      mode: "genome"
      lineageDatasets: "bacteria_odb12"
      selectLineage: "bacteria_odb12"
      fetchArtifact: true
    filtering:
      enabled: true
      condition: "complete>50 AND dataset='bacteria_odb12'"
      exclude_ids: false
      fetchArtifact: true
```

Provide the corresponding [BUSCO database settings](#nf-moshpit-databases). `lineageDatasets` selects datasets to evaluate; `selectLineage` identifies the results used downstream. The filtering expression above is illustrative, rather than a universal quality standard. MAG filtering currently requires BUSCO; enabling CheckM alone does not satisfy that dependency.

For CheckM, enable `binning.qc.checkm.enabled`, set `databases.checkm.path`, and use a runtime containing q2-checkm and its required software. Container runs can use `containerCheckM`. The validator currently also requires `containerCheckM` or `container` when CheckM is enabled, including for a conda run; check your revision before choosing that combination.

For interpretation of completeness and contamination, see [MAG quality-control guidance](#qc-every-step).

## Dereplicate MAGs

```yaml
dereplication:
  enabled: true
  method: "sourmash"
  threshold: 0.99
  fetchArtifact: true
  sourmash:
    ksizes: 35
    scaled: 100
    trackAbundance: true
```

The current subworkflow computes and compares sourmash MinHash signatures, then runs `mag dereplicate-mags`. `threshold` is the threshold passed to that action for the sourmash comparison; do not interpret it automatically as a Skani ANI cutoff. Check the action documentation for its meaning in your installed version.

## Estimate abundance

Enable contig abundance, dereplicated MAG abundance, or both:

```yaml
abundance_estimation:
  enabledFor: "contigs,derep"
  metric: "tpm"
  min_mapq: 42
  min_query_len: 0
  min_base_quality: 0
  fetchArtifact: true
```

Contig abundance needs assembly and read-to-contig mappings. Dereplicated MAG abundance needs dereplication and read-to-MAG mappings. Mapping quality, query length, and base-quality thresholds affect which alignments contribute to abundance. Use the abundance action's help to choose other supported metrics.

The dereplication presence/absence table is distinct from abundance estimated by mapping reads. For functional abundance profiles, also enable eggNOG on the relevant targets; see [Profiling](#nf-moshpit-profiling).

**Next:** [Taxonomic and functional profiling](#nf-moshpit-profiling), [Databases](#nf-moshpit-databases), and [Execution](#nf-moshpit-execution).
