(setup)=
# How to install MOSHPIT
MOSHPIT is available as a QIIME 2 distribution. You can find detailed installation instructions 
on the [QIIME 2 Library](https://library.qiime2.org/quickstart/moshpit) page. 

## Quick start
```{attention}
As of the 2026.4 release the MOSHPIT distribution will only be vailable for Linux-based operating systems. 
For more details please see [this](https://forum.qiime2.org/t/qiime-2-2026-4-is-now-available/34140) forum post. 
It is possible to run MOSHPIT on macOS using a container-based approach - see below for details.
```

Below you will find a quick installation guide for different operating systems:
`````{tab-set}
````{tab-item} Linux (Ubuntu)
These instructions are for users running on Linux or the Windows Subsystem for Linux (WSL v2).
```bash
conda env create \
  --name rachis-moshpit-2026.7 \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/2026.7/moshpit/released/rachis-moshpit-linux-64-conda.yml
```
````

````{tab-item} macOS (Apple Silicon)
These instructions are for users with Apple Silicon chips (M1, M2, etc) using Docker.
Run the following command to pull the selected image:
```bash
docker pull quay.io/qiime2/moshpit:2026.7
```
Verify things are working by running:
```bash
docker run \
  -v $(pwd):/data \
  -it quay.io/qiime2/moshpit:2026.7 \
  qiime info
```
````
`````

## Development version
```{attention}
This version is provided without any guarantee on the new features - these are under active development so 
some bugs are possible. If you uncover any unexpected behaviour, feel free to report in on our GitHub issue 
tracker of the respective plugin repository. 
```

````{note} Linux (Ubuntu)
These instructions are for users running on Linux or the Windows Subsystem for Linux (WSL v2).
```bash
conda env create \
  --name rachis-moshpit-dev \
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/latest/passed/rachis-moshpit-linux-64-conda.yml
```
````
