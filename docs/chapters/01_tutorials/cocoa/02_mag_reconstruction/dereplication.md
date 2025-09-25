---
authors:
- pmc
- mz
---
(dereplication)=
# MAG set dereplication
Depending on the application, it may be necessary to dereplicate the set of MAGs to remove redundancy and retain only 
unique genome representatives. Our workflow includes a dereplication step that can use any genome distance matrix to 
find clusters of similar genomes (based on a specific similarity threshold) and identify the most representative 
MAG (in our case, it will be the longest genome in the cluster). Here we use Sourmash to generate the distance matrix 
but any other tool could also be used. 
## Compute MinHash signatures with Sourmash
In this step, Sourmash is used to compute MinHash signatures for the filtered MAGs. MinHash is a method used to compare 
large datasets efficiently by creating compressed representations of genomes.
```{code-cell}
mosh sourmash compute \
    --i-sequence-file ./cache:mags_filtered_50 \           
    --p-ksizes 35 \                                  
    --p-scaled 10 \                                                             
    --o-min-hash-signature ./cache:mags_minhash_50 \
    --verbose
```
## Compare MinHash signatures
Here we compare the computed MinHash signatures to evaluate the similarity between the genomes. This step will allow for
dereplication by identifying highly similar genomes.
```{code-cell}
mosh sourmash compare \
    --i-min-hash-signature ./cache:mags_minhash_50 \ 
    --p-ksize 35 \                                                          
    --o-compare-output ./cache:mags_dist_matrix_50 \
    --verbose         
```
## Dereplicate MAGs
This step dereplicates the filtered MAGs, ensuring that only unique MAGs are retained. Dereplication reduces redundancy 
by merging similar genomes based on a similarity threshold.
```{code-cell}
mosh annotate dereplicate-mags \
    --i-mags ./cache:mags_filtered_50 \                    
    --i-distance-matrix ./cache:mags_dist_matrix_50 \       
    --p-threshold 0.99 \
    --o-dereplicated-mags ./cache:mags_derep_50 \   
    --o-table ./cache:mags_ft_50  \
    --verbose              
```
