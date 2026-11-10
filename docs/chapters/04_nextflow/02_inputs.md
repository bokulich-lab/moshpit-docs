(nf-moshpit-inputs)=
# Inputs

Configure **one input method per run**. The workflow chooses the first configured method in the order below; it warns if several are supplied. Clear unused input paths to `null`, including `read_simulation.samples`.

| Priority | Input | Required settings | File format |
| --- | --- | --- | --- |
| 1 | FASTQ files | `inputReadsManifest` | CSV: `id,forward,reverse` for paired-end reads |
| 2 | QIIME 2 cached reads | `inputReads`, `inputReadsCache`, `metadata` | Cache key and directory; metadata TSV with an `id` column |
| 3 | SRA data | `fondueAccessionIds`, `email` | TSV with an `id` column |
| 4 | MASON simulation | `read_simulation.samples` | **CSV** with the five columns below |

The workflow does not take a reads `.qza` path directly. Store an artifact in a QIIME 2 cache for the cache route, or provide FASTQ files through a manifest.

## FASTQ manifest

The paired-end route used in the [quick start](#nf-moshpit-quick-start) is the most direct entry point. One row identifies one sample and its forward/reverse files:

```csv
id,forward,reverse
Sample1,/data/Sample1_R1.fastq.gz,/data/Sample1_R2.fastq.gz
Sample2,/data/Sample2_R1.fastq.gz,/data/Sample2_R2.fastq.gz
```

```yaml
inputReadsManifest: /data/manifest.csv
```

Use unique sample IDs and accessible absolute paths. Choose simple IDs without whitespace or shell punctuation; sample IDs become directory names and cache-key suffixes. The workflow imports each sample into its own QIIME 2 cache.

## Existing reads in a QIIME 2 cache

Set the **cache directory** and the **key name within it** separately:

```yaml
inputReadsManifest: null
inputReadsCache: /data/reads-cache
inputReads: study_reads
metadata: /data/samples.tsv
```

The cached artifact should contain demultiplexed reads with the sample IDs you want to analyze. Inspect it with `qiime tools cache-status --cache /data/reads-cache`. To store an existing `.qza`, follow [the artifact-cache guide](#artifact-cache).

## SRA accessions with q2-fondue

Create a TSV containing the accessions that q2-fondue should retrieve. The header must be `id`:

```tsv
id
SRR123456
SRR789012
```

These accessions illustrate the format; replace them with accessions for your dataset.

```yaml
inputReadsManifest: null
fondueAccessionIds: /data/accessions.tsv
email: researcher@example.org
fondue:
  paired: true
```

`fondue.paired: true` selects the paired-end output stream; `false` selects the single-end stream. It does not convert single-end experiments into paired-end data. Choose accessions compatible with that setting. Inspect sample-count reports for failed downloads or excluded samples, and review the q2-fondue failed-run output in the sample caches.

SRA retrieval needs network access from the compute jobs. On clusters that use a module to provide access, set `internetModule`; see [Execution](#nf-moshpit-execution). For more about accession selection, see [the data retrieval guide](#fetch).

## Simulated reads with MASON

Use a `.csv` file with these exact headers:

```csv
id,profile,readCount,readLength,genomesPath
Sim1,uniform,10000,150,/data/reference-genomes.qza
Sim2,lognormal,10000,150,/data/reference-genomes.qza
```

| Column | Meaning |
| --- | --- |
| `id` | Unique simulated sample ID |
| `profile` | Abundance profile: `uniform`, `lognormal`, or `exponential` |
| `readCount` | Positive integer number of reads requested for the sample |
| `readLength` | Positive integer read length |
| `genomesPath` | Accessible QIIME 2 reference-genome artifact of type `GenomeData[DNASequence]` |

```yaml
inputReadsManifest: null
read_simulation:
  samples: /data/simulation.csv
  seed: 100
```

This route calls `assembly simulate-reads-mason` and also collates the simulated ground-truth feature tables.

**Next:** [Choose your analysis](#nf-moshpit-configuration) and [prepare its databases](#nf-moshpit-databases).
