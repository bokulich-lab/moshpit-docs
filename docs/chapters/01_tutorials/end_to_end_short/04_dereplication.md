# MAG dereplication
Since our samples were generated from the same mock community (i.e., we know they most likely contain the same set of 
genomes), we can simplify our MAG collection by performing __dereplication__, similarly to how you do it for 16S 
amplicon sequences.

We begin by computing hash sketches of every genome using [sourmash](https://sourmash.readthedocs.io/en/latest/) - you 
can think of those sketches as tiny representations of our genomes (_sourmash_ compresses a lot of information into a 
much smaller space):
```{code} bash
mosh sourmash compute \
    --i-sequence-file ./mags-filtered.qza \
    --p-ksizes 105 \
    --p-scaled 100 \
    --o-min-hash-signature ./mags-hashes.qza
```

Then, we compare all of those sketches (genomes) to one another to generate a matrix of pairwise distances between our MAGs:
```{code} bash
mosh sourmash compare \
    --i-min-hash-signature ./mags-hashes.qza \
    --p-ksize 105 \
    --o-compare-output ./mags-dist.qza
```

Finally, we dereplicate the genomes using the distance matrix and a fixed similarity threshold—the last action will 
simply choose the most complete genome from all the genomes belonging to the same cluster, given a similarity threshold:
```{code} bash
mosh annotate dereplicate-mags \
    --i-mags ./mags-filtered.qza \
    --i-distance-matrix ./mags-dist.qza \
    --m-metadata-file ./busco-results.qza \
    --p-metadata-column "completeness" \
    --p-threshold 0.9 \
    --o-dereplicated-mags ./mags-derep.qza \
    --o-table ./mags-table-pa.qza
```
