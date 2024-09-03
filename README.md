# moshpit-docs
MOSHPIT plugin suite documentation


## Build the book
Create the conda environment:
```shell
mamba create -n jupyter-book -c conda-forge jupyter-book
```
Activate:
```shell
conda activate jupyter-book
```
Build the book:
```shell
jupyter-book build --all moshpit_doc
```
