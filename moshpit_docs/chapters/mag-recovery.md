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

# Recovery of MAGs

This workflow describes a step-by-step process for metagenome-assembled genome (MAG) recovery using `qiime2` and other tools. Each command includes explanations of the parameters used. 

## Step 1: Assemble Contigs with Megahit
This step involves assembling the paired-end sequencing reads into contigs using the `megahit` assembler. `Megahit` is optimized for metagenomics data and can handle large datasets with low memory requirements. The parameters allow you to fine-tune the assembly process, adjusting sensitivity, memory usage, and other factors critical for generating high-quality contigs from metagenomics data.

```{code-cell}
qiime assembly assemble-megahit \
  --i-seqs paired-reads-0.qza \
  --p-presets meta-sensitive \          # Use meta-sensitive presets for assembly
  --p-min-count 2 \                     # Minimum coverage for contigs is set to 2
  --p-k-list 21 29 39 59 79 99 119 141 \ # List of k-mer sizes for assembly
  --p-no-no-mercy \                     # Disable lenient treatment of conflicting bubbles
  --p-bubble-level 2 \                  # Bubble detection threshold level
  --p-prune-level 2 \                   # Pruning level to simplify the assembly graph
  --p-prune-depth 2 \                   # Minimum depth for pruning
  --p-disconnect-ratio 0.1 \            # Disconnect ratio for graph simplification
  --p-low-local-ratio 0.2 \             # Set a low local ratio for pruning
  --p-max-tip-len auto \                # Automatic tip length setting
  --p-cleaning-rounds 5 \               # Number of cleaning rounds for assembly
  --p-no-no-local \                     # Disable local assembly
  --p-no-kmin-1pass \                   # Disable the one-pass Kmin method
  --p-memory 0.9 \                      # Use 90% of available memory
  --p-mem-flag 1 \                      # Memory allocation flag
  --p-num-cpu-threads 24 \              # Number of threads to use
  --p-no-no-hw-accel \                  # Disable hardware acceleration
  --p-min-contig-len 200 \              # Minimum contig length is set to 200 bp
  --p-coassemble False \                # Co-assembly is disabled
  --o-contigs contigs-0.qza             # Output contig file
```

:::{warning}
Make sure to allocate appropriate CPU and memory resources based on your system's capacity.
:::


## Step 2: Index Contigs

In this step, we generate an index for the assembled contigs. This index is required for mapping reads to the contigs later. Various parameters control the size and structure of the index, as well as resource usage.

```{code-cell}
qiime assembly index-contigs \
  --i-contigs contigs-0.qza \                       # Input contig file from previous step
  --p-no-large-index \                              # Disable creation of a large index
  --p-no-debug \                                    # Disable debug mode
  --p-no-sanitized \                                # Do not sanitize the output
  --p-verbose \                                     # Enable verbose output
  --p-no-noauto \                                   # Disable auto mode
  --p-no-packed \                                   # Do not pack index data
  --p-bmax auto \                                   # Automatically set the maximum index size
  --p-bmaxdivn 4 \                                  # Set bmax divisor to reduce memory usage
  --p-dcv 1024 \                                    # Set direct compression value for memory efficiency
  --p-no-nodc \                                     # Disable double-checking of index integrity
  --p-offrate 5 \                                   # Set offrate for index compression (lower values increase memory)
  --p-ftabchars 10 \                                # Set the number of characters for the ftab
  --p-threads 8 \                                   # Use 8 CPU threads to build the index
  --p-seed 100 \                                    # Set seed for reproducibility
  --o-index index-0.qza                             # Output index file
```

## Step 3: Map Reads to Contigs
This step maps the input paired-end reads to the indexed contigs created in the previous step. We use various alignment settings to ensure optimal mapping, including local alignment mode and sensitivity settings.

```{code-cell}
qiime assembly map-reads \
  --i-index index-0.qza \                           # Input indexed contig file
  --i-reads paired-reads-0.qza \                    # Input sequence file (paired-end reads)
  --p-skip 0 \                                      # No reads are skipped
  --p-qupto unlimited \                             # Map all reads without limit
  --p-trim5 0 \                                     # No trimming at the 5' end of the reads
  --p-trim3 0 \                                     # No trimming at the 3' end of the reads
  --p-trim-to untrimmed \                           # Keep reads untrimmed
  --p-no-phred33 \                                  # Disable PHRED33 base quality scoring
  --p-no-phred64 \                                  # Disable PHRED64 base quality scoring
  --p-mode local \                                  # Use local alignment mode
  --p-sensitivity sensitive \                       # Set high sensitivity for the aligner
  --p-n 0 \                                         # Set ambiguous base handling to 0
  --p-len 22 \                                      # Set seed length for the alignment
  --p-i S,1,1.15 \                                  # Alignment scoring parameters
  --p-n-ceil L,0,0.15 \                             # Ceiling for ambiguous base penalties
  --p-dpad 15 \                                     # Set padding for alignment
  --p-gbar 4 \                                      # Set gap-bar setting for alignment
  --p-no-ignore-quals \                             # Do not ignore quality scores
  --p-no-nofw \                                     # Allow forward strand mapping
  --p-no-norc \                                     # Allow reverse complement mapping
  --p-no-no-1mm-upfront \                           # Allow 1 mismatch at the seed
  --p-no-end-to-end \                               # Disable end-to-end alignment mode
  --p-no-local \                                    # Disable local alignment (keep in local mode)
  --p-ma 2 \                                        # Set mismatch penalty
  --p-mp 6 \                                        # Set gap open penalty
  --p-np 1 \                                        # Set gap extension penalty
  --p-rdg 5,3 \                                     # Read gap penalties
  --p-rfg 5,3 \                                     # Reference gap penalties
  --p-k off \                                       # Disable seeding
  --p-no-a \                                        # Disable ambiguous alignment handling
  --p-d 15 \                                        # Distance between seeds
  --p-r 2 \                                         # Set re-seeding ratio
  --p-minins 0 \                                    # Set minimum insert size
  --p-maxins 500 \                                  # Set maximum insert size
  --p-valid-mate-orientations fr \                  # Set valid mate-pair orientations
  --p-no-no-mixed \                                 # Disallow mixed read orientation
  --p-no-no-discordant \                            # Disallow discordant read pairs
  --p-no-dovetail \                                 # Disable dovetail alignment
  --p-no-no-contain \                               # Disallow containment of one read in another
  --p-no-no-overlap \                               # Disallow overlap of reads
  --p-offrate off \                                 # Disable offrate compression
  --p-threads 12 \                                  # Use 12 threads for mapping
  --p-no-reorder \                                  # Do not reorder the output
  --p-no-mm \                                       # Disable memory-mapped I/O
  --p-seed 100 \                                    # Set seed for reproducibility
  --p-no-non-deterministic \                        # Disable non-deterministic mapping
  --o-alignment-map alignment-map-0.qza             # Output alignment map
```
## Step 4: Bin Contigs with Metabat
Binning contigs involves grouping assembled contigs into MAGs. This step uses Metabat to assign contigs based on co-abundance and other features, producing MAG files that represent putative genomes.

```{code-cell}
qiime moshpit bin-contigs-metabat \
  --i-contigs contigs-0.qza \                       # Input contigs file from assembly step
  --i-alignment-maps alignment-map-0.qza \          # Input alignment map from mapping step
  --p-num-threads 64 \                              # Use 64 threads to speed up binning
  --p-seed 100 \                                    # Set seed for reproducibility
  --p-verbose \                                     # Enable verbose output
  --o-mags mags-0.qza \                             # Output metagenome-assembled genomes (MAGs)
  --o-contig-map XX_contig_map \                    # Output contig map
  --o-unbinned-contigs XX_unbinned_contigs          # Output unbinned contigs
```
## Step 5: Evaluate Bins with BUSCO
This step evaluates the completeness and quality of the MAGs using the BUSCO tool, which checks for the presence of single-copy orthologs. The evaluation helps ensure the quality of the recovered MAGs.

```{code-cell}
qiime moshpit evaluate-busco \
  --i-bins mags-0.qza \                             # Input MAGs file
  --i-busco-db busco-db-0.qza \                     # Input BUSCO database for lineage evaluation
  --p-mode genome \                                 # Run BUSCO in genome mode
  --p-lineage-dataset bacteria_odb10 \              # Use bacterial lineage dataset
  --p-no-augustus \                                 # Disable Augustus gene prediction
  --p-auto-lineage False \                          # Disable auto lineage detection
  --p-cpu 16 \                                      # Use 16 CPU threads for evaluation
  --p-contig-break 10 \                             # Contig break threshold for evaluation
  --p-evalue 0.001 \                                # E-value threshold for BUSCO search
  --o-results-table results-table-0.qza \           # Output results table
  --o-visualization XX_visualization                # Output BUSCO visualization

```
## Step 6: Filter MAGs

This step filters the MAGs based on completeness. In this example, we filter out any MAGs with completeness below 50%. The filtering process ensures only high-quality genomes are kept for downstream analysis.

```{code-cell}
qiime moshpit filter-mags \
  --i-mags mags-0.qza \                             # Input MAGs from binning step
  --m-metadata-file results-table-0.qza \           # Input metadata results from BUSCO evaluation
  --p-where 'complete>50' \                         # Only keep MAGs with >50% completeness
  --p-no-exclude-ids \                              # Do not exclude specific MAG IDs
  --p-on mag \                                      # Apply filtering based on MAG features
  --o-filtered-mags filtered-mags-0.qza             # Output filtered MAGs file
```
## Step 7: Compute MinHash Signatures with Sourmash
In this step, Sourmash is used to compute MinHash signatures for the filtered MAGs. MinHash is a method used to compare large datasets efficiently by creating compressed representations of genomes.

```{code-cell}
qiime sourmash compute \
  --i-sequence-file filtered-mags-0.qza \           # Input filtered MAGs file
  --p-ksizes 35 \                                   # Use k-mer size of 35
  --p-scaled 10 \                                   # Scale factor for signature compression
  --p-track-abundance \                             # Track k-mer abundances in signatures
  --o-min-hash-signature min-hash-signature-0.qza   # Output MinHash signature file  
```
## Step 8: Compare MinHash Signatures
Here we compare the computed MinHash signatures to evaluate the similarity between the genomes. This step allows dereplication by identifying highly similar genomes.

```{code-cell}
qiime sourmash compare \
  --i-min-hash-signature min-hash-signature-0.qza \ # Input MinHash signature file
  --p-ksize 35 \                                   # Use k-mer size of 35 for comparison
  --p-ignore-abundance \                           # Ignore k-mer abundance during comparison
  --o-compare-output compare-output-0.qza          # Output comparison results
```
## Step 9: Dereplicate MAGs
This step dereplicates the filtered MAGs, ensuring that only unique MAGs are retained. Dereplication reduces redundancy by merging similar genomes based on a similarity threshold.

```{code-cell}
qiime moshpit dereplicate-mags \
  --i-mags filtered-mags-0.qza \                    # Input filtered MAGs
  --i-distance-matrix compare-output-0.qza \        # Input distance matrix from MinHash comparison
  --p-threshold 0.99 \                              # Similarity threshold for dereplication (99%)
  --o-dereplicated-mags dereplicated-mags-0.qza \   # Output dereplicated MAGs
  --o-feature-table XX_feature_table                # Output feature table
```
## Step 10: Get Feature Lengths
This step calculates the lengths of the dereplicated MAGs, which will be used in the next step to estimate abundance.

```{code-cell}
qiime moshpit get-feature-lengths \
  --i-features dereplicated-mags-0.qza \              # Input dereplicated MAGs file
  --o-lengths lengths-0.qza                           # Output lengths of dereplicated MAGs
```
## Step 11: Index Dereplicated MAGs
This step indexes the dereplicated MAGs for read mapping. The index is necessary to efficiently map the input reads back to the MAGs.

```{code-cell}
qiime assembly index-derep-mags \
  --i-mags dereplicated-mags-0.qza \                  # Input dereplicated MAGs file
  --p-no-large-index \                                # Disable large index creation
  --p-no-debug \                                      # Disable debug mode
  --p-no-sanitized \                                  # Do not sanitize the output
  --p-verbose \                                       # Enable verbose output
  --p-no-noauto \                                     # Disable auto mode
  --p-no-packed \                                     # Do not create packed index
  --p-bmax auto \                                     # Automatically set the maximum index size
  --p-bmaxdivn 4 \                                    # Set bmax divisor to reduce memory usage
  --p-dcv 1024 \                                      # Set direct compression value for memory efficiency
  --p-no-nodc \                                       # Disable double-checking of index integrity
  --p-offrate 5 \                                     # Set offrate for index compression
  --p-ftabchars 10 \                                  # Number of characters in the ftab
  --p-threads 8 \                                     # Use 8 threads to build the index
  --p-seed 100 \                                      # Set seed for reproducibility
  --o-index index-1.qza                               # Output indexed MAGs file

```
## Step 12: Map Reads to Dereplicated MAGs
In this step, we map the input paired-end reads back to the dereplicated MAGs. This helps in calculating the abundance of each MAG in the sample.

```{code-cell}
qiime assembly map-reads \
  --i-index index-1.qza \                             # Input indexed MAGs file
  --i-reads paired-reads-0.qza \                      # Input paired-end reads
  --p-skip 0 \                                        # No reads are skipped
  --p-qupto unlimited \                               # Map all reads without limit
  --p-trim5 0 \                                       # No trimming at the 5' end of the reads
  --p-trim3 0 \                                       # No trimming at the 3' end of the reads
  --p-trim-to untrimmed \                             # Keep reads untrimmed
  --p-no-phred33 \                                    # Disable PHRED33 base quality scoring
  --p-no-phred64 \                                    # Disable PHRED64 base quality scoring
  --p-mode local \                                    # Use local alignment mode
  --p-sensitivity sensitive \                         # Set high sensitivity for the aligner
  --p-n 0 \                                           # Set ambiguous base handling to 0
  --p-len 22 \                                        # Set seed length for the alignment
  --p-i S,1,1.15 \                                    # Alignment scoring parameters
  --p-n-ceil L,0,0.15 \                               # Ceiling for ambiguous base penalties
  --p-dpad 15 \                                       # Set padding for alignment
  --p-gbar 4 \                                        # Set gap-bar setting for alignment
  --p-no-ignore-quals \                               # Do not ignore quality scores
  --p-no-nofw \                                       # Allow forward strand mapping
  --p-no-norc \                                       # Allow reverse complement mapping
  --p-no-no-1mm-upfront \                             # Allow 1 mismatch at the seed
  --p-no-end-to-end \                                 # Disable end-to-end alignment mode
  --p-no-local \                                      # Disable local alignment (keep in local mode)
  --p-ma 2 \                                          # Set mismatch penalty
  --p-mp 6 \                                          # Set gap open penalty
  --p-np 1 \                                          # Set gap extension penalty
  --p-rdg 5,3 \                                       # Read gap penalties
  --p-rfg 5,3 \                                       # Reference gap penalties
  --p-k off \                                         # Disable seeding
  --p-no-a \                                          # Disable ambiguous alignment handling
  --p-d 15 \                                          # Distance between seeds
  --p-r 2 \                                           # Set re-seeding ratio
  --p-minins 0 \                                      # Set minimum insert size
  --p-maxins 500 \                                    # Set maximum insert size
  --p-valid-mate-orientations fr \                    # Set valid mate-pair orientations
  --p-no-no-mixed \                                   # Disallow mixed read orientation
  --p-no-no-discordant \                              # Disallow discordant read pairs
  --p-no-dovetail \                                   # Disable dovetail alignment
  --p-no-no-contain \                                 # Disallow containment of one read in another
  --p-no-no-overlap \                                 # Disallow overlap of reads
  --p-offrate off \                                   # Disable offrate compression
  --p-threads 12 \                                    # Use 12 threads for mapping
  --p-no-reorder \                                    # Do not reorder the output
  --p-no-mm \                                         # Disable memory-mapped I/O
  --p-seed 100 \                                      # Set seed for reproducibility
  --p-no-non-deterministic \                          # Disable non-deterministic mapping
  --o-alignment-map alignment-map-1.qza               # Output alignment map

```
## Step 13: Estimate MAG Abundance
This step estimates the abundance of each MAG in the sample based on the read mapping results. The RPKM metric is used for abundance estimation.

```{code-cell}
qiime moshpit estimate-mag-abundance \
  --i-maps alignment-map-1.qza \                     # Input alignment map from the mapping step
  --i-mag-lengths lengths-0

```
