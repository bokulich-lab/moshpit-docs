# moshpit-docs
[![Github Pages](https://img.shields.io/badge/github%20pages-121013?style=for-the-badge&logo=github&logoColor=white)](https://bokulich-lab.github.io/moshpit-docs/)

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
