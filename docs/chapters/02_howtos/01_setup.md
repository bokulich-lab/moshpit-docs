(setup)=
# How to install MOSHPIT
MOSHPIT is available as a QIIME 2 distribution. You can find detailed installation instructions 
on the [QIIME 2 Library](https://library.qiime2.org/) page. 

## Quick start
Below you will find a quick installation guide for different operating systems:
`````{tab-set}
````{tab-item} Linux (Ubuntu)
These instructions are for users running on Linux or the Windows Subsystem for Linux (WSL v2).
```bash
conda env create \
  --name qiime2-moshpit-2025.7 \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/2025.7/moshpit/released/qiime2-moshpit-ubuntu-latest-conda.yml
```
````

````{tab-item} macOS (Apple Silicon)
These instructions are for users with Apple Silicon chips (M1, M2, etc), and configures the installation of QIIME 2 in Rosetta 2 emulation mode.
```bash
CONDA_SUBDIR=osx-64 conda env create \
  --name qiime2-moshpit-2025.7 \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/2025.7/moshpit/released/qiime2-moshpit-macos-latest-conda.yml
conda activate qiime2-moshpit-2025.7
conda config --env --set subdir osx-64
```
````

````{tab-item} macOS (Intel)
These instructions are for users older Intel-based Apple hardware (NOT M1, M2, etc).
```bash
conda env create \
  --name qiime2-moshpit-2025.7 \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/2025.7/moshpit/released/qiime2-moshpit-macos-latest-conda.yml
```
````
`````

## Development version
```{attention}
This version is provided without any guarantee on the new features - these are under active development so 
some bugs are possible. If you uncover any unexpected behaviour, feel free to report in on our GitHub issue 
tracker of the respective plugin repository. 
```
`````{tab-set}
````{tab-item} Linux (Ubuntu)
These instructions are for users running on Linux or the Windows Subsystem for Linux (WSL v2).
```bash
conda env create \
  --name qiime2-moshpit-dev \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/latest/passed/qiime2-moshpit-ubuntu-latest-conda.yml
```
````

````{tab-item} macOS (Apple Silicon)
These instructions are for users with Apple Silicon chips (M1, M2, etc), and configures the installation of QIIME 2 in Rosetta 2 emulation mode.
```bash
CONDA_SUBDIR=osx-64 conda env create \
  --name qiime2-moshpit-dev \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/latest/passed/qiime2-moshpit-macos-latest-conda.yml
conda activate qiime2-moshpit-dev
conda config --env --set subdir osx-64
```
````

````{tab-item} macOS (Intel)
These instructions are for users older Intel-based Apple hardware (NOT M1, M2, etc).
```bash
conda env create \
  --name qiime2-moshpit-dev \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/latest/passed/qiime2-moshpit-macos-latest-conda.yml
```
````
`````
