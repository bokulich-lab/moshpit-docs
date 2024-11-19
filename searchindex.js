Search.setIndex({"alltitles": {"Annotate orthologs against eggNOG database": [[13, "annotate-orthologs-against-eggnog-database"]], "Approach 1: Kraken 2": [[11, "approach-1-kraken-2"]], "Approach 2: Kaiju": [[11, "approach-2-kaiju"]], "Assemble contigs with MEGAHIT": [[8, "assemble-contigs-with-megahit"]], "Bin contigs with MetaBAT": [[8, "bin-contigs-with-metabat"]], "Compare MinHash signatures": [[6, "compare-minhash-signatures"]], "Compute MinHash signatures with Sourmash": [[6, "compute-minhash-signatures-with-sourmash"]], "Contig QC with QUAST": [[8, "contig-qc-with-quast"]], "Data retrieval": [[0, null]], "Dereplicate MAGs": [[6, "dereplicate-mags"]], "EggNOG search using Diamond aligner": [[13, "eggnog-search-using-diamond-aligner"]], "Estimate MAG abundance": [[5, "estimate-mag-abundance"]], "Evaluate bins with BUSCO": [[8, "evaluate-bins-with-busco"]], "Extract annotations": [[13, "extract-annotations"]], "Filter MAGs": [[8, "filter-mags"]], "Functional annotation": [[12, null], [13, null]], "Get MAG lengths": [[5, "get-mag-lengths"]], "Host read removal": [[2, null]], "Human host reads": [[2, "human-host-reads"]], "Index contigs": [[8, "index-contigs"]], "Index dereplicated MAGs": [[5, "index-dereplicated-mags"]], "Kaiju: protein-based classification": [[9, "kaiju-protein-based-classification"]], "Kraken 2: DNA-to-DNA classification": [[9, "kraken-2-dna-to-dna-classification"]], "Let\u2019s have a look at our CAZymes functional diversity!": [[13, "let-s-have-a-look-at-our-cazymes-functional-diversity"]], "Let\u2019s have a look at our estimated MAG abundance!": [[5, "let-s-have-a-look-at-our-estimated-mag-abundance"]], "MAG abundance estimation": [[5, null]], "MAG set dereplication": [[6, null]], "MOSHPIT tutorial": [[14, null]], "Map reads to contigs": [[8, "map-reads-to-contigs"]], "Map reads to dereplicated MAGs": [[5, "map-reads-to-dereplicated-mags"]], "Multiply tables": [[13, "multiply-tables"]], "Note on parallelization": [[1, "note-on-parallelization"]], "Quality control": [[3, null]], "Quality filtering": [[4, null]], "Quality overview": [[4, "quality-overview"]], "Read trimming and quality filtering": [[4, "read-trimming-and-quality-filtering"]], "Read-based classification overview": [[9, "read-based-classification-overview"]], "Recovery of MAGs": [[8, null]], "Recovery of Metagenome-assembled Genomes": [[7, null]], "Removal of contaminating reads": [[2, "removal-of-contaminating-reads"]], "Required databases": [[13, "required-databases"]], "Setup": [[1, null]], "Taxonomic classification": [[9, null]], "Taxonomic classification of MAGs": [[10, null]], "Taxonomic classification of reads": [[11, null]], "Visualization": [[11, "visualization"]]}, "docnames": ["chapters/00_data_retrieval", "chapters/00_setup", "chapters/01_filtering/host-filtering", "chapters/01_filtering/intro", "chapters/01_filtering/quality-filtering", "chapters/02_mag_reconstruction/abundance", "chapters/02_mag_reconstruction/dereplication", "chapters/02_mag_reconstruction/intro", "chapters/02_mag_reconstruction/reconstruction", "chapters/03_taxonomic_classification/intro", "chapters/03_taxonomic_classification/mags", "chapters/03_taxonomic_classification/reads", "chapters/04_functional_annotation/intro", "chapters/04_functional_annotation/mags", "intro"], "envversion": {"sphinx": 62, "sphinx.domains.c": 3, "sphinx.domains.changeset": 1, "sphinx.domains.citation": 1, "sphinx.domains.cpp": 9, "sphinx.domains.index": 1, "sphinx.domains.javascript": 3, "sphinx.domains.math": 2, "sphinx.domains.python": 4, "sphinx.domains.rst": 2, "sphinx.domains.std": 2, "sphinx.ext.intersphinx": 1, "sphinxcontrib.bibtex": 9}, "filenames": ["chapters/00_data_retrieval.md", "chapters/00_setup.md", "chapters/01_filtering/host-filtering.md", "chapters/01_filtering/intro.md", "chapters/01_filtering/quality-filtering.md", "chapters/02_mag_reconstruction/abundance.md", "chapters/02_mag_reconstruction/dereplication.md", "chapters/02_mag_reconstruction/intro.md", "chapters/02_mag_reconstruction/reconstruction.md", "chapters/03_taxonomic_classification/intro.md", "chapters/03_taxonomic_classification/mags.md", "chapters/03_taxonomic_classification/reads.md", "chapters/04_functional_annotation/intro.md", "chapters/04_functional_annotation/mags.md", "intro.md"], "indexentries": {}, "objects": {}, "objnames": {}, "objtypes": {}, "terms": {"": [1, 8, 14], "0": [5, 6, 10, 11, 13], "00": 1, "0001": 13, "1": [1, 10], "10": [5, 6], "100": [5, 8], "128": 8, "14": 1, "150": 11, "16": [8, 11, 13], "2": [0, 1, 2, 3, 4, 5, 7, 10, 12, 14], "200": 8, "2016": 9, "2019": 9, "2024": 1, "24": [1, 8], "31": 9, "35": 6, "40": 5, "42": 5, "4g": 1, "5": [0, 1, 5, 10, 11], "50": 8, "64": 8, "72": [10, 11], "8": [5, 8], "90": 4, "99": 6, "As": 3, "For": [5, 7, 9, 12], "In": [1, 2, 4, 5, 6, 8, 10, 11, 12, 13], "It": 8, "One": 9, "The": [0, 3, 5, 8, 9, 13, 14], "Then": [5, 13, 14], "There": [2, 5, 8], "These": 9, "To": [0, 1, 4, 11], "__cit": 2, "abl": 8, "ablab": 7, "about": [1, 4], "abov": 2, "abund": [8, 11, 13], "access": 0, "accur": 9, "across": 13, "action": [0, 1, 2, 4, 11], "activ": 1, "actual": 8, "ad": 12, "adapt": 3, "addit": 8, "addition": 11, "address": [0, 3], "adjust": 11, "advantag": 9, "affect": 9, "against": [2, 8, 9], "al": 9, "algorithm": 9, "align": [5, 8, 9, 12], "all": [0, 1, 2, 4, 5, 8, 9, 13, 14], "allow": [2, 5, 6, 7, 9, 12, 13], "alreadi": 3, "also": [2, 6, 8, 10], "altern": [8, 13], "an": [0, 1, 4, 8], "analys": [5, 9], "analysi": [3, 8, 13, 14], "analyz": [8, 14], "ani": [0, 2, 3, 6, 8], "anim": 13, "annot": 14, "applic": 6, "approach": [2, 7, 10], "appropri": 8, "ar": [2, 4, 5, 6, 7, 8, 9, 12, 13], "archaea": [8, 11], "archiv": 0, "artifact": [0, 2, 5, 8, 10, 11], "aspect": 14, "assembl": [1, 10, 12, 14], "assembli": [5, 8, 9, 14], "assess": 9, "assign": [8, 9], "avail": [0, 1, 8, 14], "back": 5, "bacteri": 8, "bacteria": [8, 11], "bacteria_odb10": 8, "bar": [5, 11], "barplot": [5, 11], "base": [4, 5, 6, 8, 13, 14], "bashrc": 1, "bbuchfink": 12, "befor": [1, 2, 3, 8, 9, 11, 12], "begin": 14, "belong": [8, 11], "below": [2, 8, 13], "benchmark": 9, "benefit": 12, "berkeleylab": 7, "beta": 13, "better": 8, "between": [6, 8, 13], "bin": 7, "biodivers": 9, "bioinformat": 9, "bitbucket": 7, "blastx": 9, "bokulich": 0, "both": [2, 11], "bowti": 2, "bowtie2": [2, 5], "bp": 4, "bracken": 11, "bracken_db": 11, "bracken_ft": 11, "bracken_ft_filt": 11, "bracken_report": 11, "bracken_taxonomi": 11, "brai": 13, "braycurti": 13, "brief": 3, "broader": 9, "bruijn": 8, "build": [2, 11, 13], "built": 2, "burrow": 9, "busco": 7, "busco_db": 8, "busco_result": 8, "bwt": 9, "bypass": 12, "c": 11, "cach": [0, 1, 2, 4, 5, 6, 8, 10, 11, 13], "calcul": [5, 8, 13], "call": [1, 8], "can": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], "cannot": 11, "capabl": 14, "care": 0, "case": [0, 6, 8], "categori": 13, "caz": 13, "caz_annot_ft": 13, "caz_braycurtis_dist": 13, "caz_braycurtis_pcoa": 13, "caz_ft": 13, "centr": 9, "certain": 9, "chapter": 14, "check": 8, "choos": 13, "class": 1, "classif": [5, 12, 14], "classifi": [5, 9, 10, 11], "clean": 14, "click": 13, "cluster": 6, "co": 8, "coassembl": 8, "cocoa": 5, "code": 12, "cog": 13, "collect": [2, 8, 11], "color": 13, "com": 0, "combin": [2, 13], "command": [0, 1, 4, 7, 8, 9, 10, 11, 12], "commonli": 9, "commun": [7, 9, 12], "compar": 9, "complet": [8, 12], "complex": [7, 12], "compon": 1, "composit": 9, "comprehens": 9, "compress": 6, "comput": 14, "conda": 1, "confid": [5, 10, 11], "config": 1, "configur": 1, "connect": 12, "construct": [2, 8], "consult": [1, 9], "contact": 0, "contain": [0, 2, 3, 10], "contig": [1, 7, 10, 12], "contig_map": 8, "contigs_index": 8, "contigu": [8, 12], "continu": 11, "contribut": 12, "control": [2, 8, 14], "convert": 5, "coordin": 13, "copi": 8, "cores_per_nod": 1, "correspond": 0, "could": [6, 8, 9], "coupl": [5, 13], "cover": [2, 8, 11], "coverag": 10, "cpu": [1, 8, 9, 12, 13], "creat": [1, 6, 8, 13], "critic": 12, "cultur": [7, 12], "current": [1, 5], "curti": 13, "custom": 13, "cutadapt": 4, "cycl": 12, "data": [1, 3, 4, 5, 8, 10, 11, 13, 14], "databas": [2, 5, 8, 9, 11], "dataset": [0, 2, 6, 8, 14], "db": [5, 8, 10, 11, 13], "de": 8, "default": 1, "defin": [1, 5, 8], "demonstr": [13, 14], "demultiplex": [2, 4], "demux": 4, "depend": [3, 6, 9], "derep": [5, 8], "derepl": [7, 8, 10, 13, 14], "derrickwood": [7, 9], "describ": 7, "detail": 5, "determin": [9, 13], "develop": 8, "diamond": 12, "diamond_db": 13, "dib": 7, "differ": [2, 11, 13, 14], "directli": [7, 9, 12], "directori": 1, "disabl": 8, "diseas": 12, "dissimilar": 13, "distanc": [6, 13], "distribut": [1, 13], "dive": [1, 14], "diverg": 9, "divers": [2, 7], "divid": [8, 14], "dna": [3, 7, 8, 12], "do": [1, 5], "doc": 0, "document": [1, 4, 7, 9, 12], "domain": 0, "done": [2, 3, 8], "dot": 13, "download": [0, 8, 11, 13], "downstream": [3, 5, 8, 9], "draft": 7, "dure": 8, "e": [0, 9, 13], "each": [4, 5, 7, 11, 13, 14], "earli": 12, "ecolog": [7, 12], "ecosystem": 12, "effici": [5, 6, 8], "eggnog": 12, "eggnog_annot": 13, "eggnog_db": 13, "eggnog_ft": 13, "eggnog_hit": 13, "eggnogdb": 12, "either": 11, "element": 13, "email": 0, "emperor": 13, "enabl": 14, "end": [5, 8, 11], "enough": 2, "ensur": [0, 6, 8, 9, 12], "entir": [8, 10], "environ": [1, 7, 14], "enzym": 12, "estim": [11, 13, 14], "et": 9, "eukaryot": [8, 11], "evalu": [6, 7, 13], "even": 12, "exact": 9, "examin": 1, "exampl": [1, 4, 8, 12], "exclud": [8, 11], "exclus": 1, "execut": 1, "executor": 1, "expand": 3, "experi": [2, 3], "explan": 7, "explicitli": 1, "explor": 7, "extract": [10, 12], "ezlab": 7, "factor": 9, "fail": 0, "failed_run": 0, "fals": [1, 8, 10, 11], "fast": 9, "fasta": [2, 13], "featur": [5, 6, 8, 10, 13], "featuredata": 2, "fetch": [2, 8, 11, 13, 14], "few": [2, 12], "file": [0, 1, 2, 5, 6, 8, 11, 13], "filter": [2, 3, 6, 11, 14], "final": [2, 11, 14], "find": [6, 13], "first": [2, 5, 8, 11, 13], "fix": 9, "flexibl": 14, "fm": 9, "focu": [8, 11, 12, 13], "focus": [3, 14], "follow": [1, 14], "fondu": 0, "format": 13, "forum": 1, "fraction": 11, "fragment": 9, "framework": 14, "frequenc": 13, "from": [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13], "fulli": [12, 14], "function": [3, 7, 14], "fungi": 11, "further": [7, 8], "g": [9, 13], "gene": [8, 12, 13], "gener": [1, 2, 3, 4, 5, 6, 8, 11, 13], "genera": 11, "genet": [2, 7, 8], "genom": [2, 6, 8, 10, 11, 12, 14], "get": [0, 4], "githubusercont": 0, "given": [8, 9], "go": [4, 8], "goal": 9, "gradient": 13, "graph": 8, "grch38": 2, "group": [5, 8, 9], "guid": 14, "ha": [8, 9, 12], "hash": 6, "have": [1, 2, 14], "heavili": 9, "help": [5, 8], "here": [1, 4, 5, 6, 8, 11, 14], "high": 8, "higher": 8, "highli": [6, 8, 9, 12], "highthroughputexecutor": 1, "hit": [5, 10, 11, 13], "host": 3, "how": [1, 2, 12, 13], "http": [0, 7], "human": 11, "human_reference_index": 2, "i": [0, 1, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14], "id": [0, 8], "identif": 12, "identifi": [6, 8, 9, 13], "import": [0, 2, 12], "includ": [3, 6, 7, 8, 9, 11], "index": [2, 9], "indic": 5, "influenc": 9, "info": 11, "inform": [7, 8, 9, 12, 13], "input": [0, 2, 5, 8, 13], "insight": [7, 12, 13], "instal": 1, "instruct": [1, 13], "integr": 14, "intens": [8, 9, 12], "interest": 5, "involv": [7, 8, 9, 12], "issu": 0, "its": 13, "itself": 8, "job": 0, "k": 9, "kaiju_barplot": 11, "kaiju_ft": 11, "kaiju_ft_filt": 11, "kaiju_nr_euk": 11, "kaiju_taxonomi": 11, "keep": [5, 8], "kegg": 13, "kei": [0, 2, 9], "kept": 8, "kilobas": 5, "known": 9, "kraken": [5, 10], "kraken2": [5, 7, 9, 10, 11], "kraken2_db": [5, 10, 11], "kraken_hits_derep_50": 10, "kraken_hits_mags_derep": 5, "kraken_hits_read": 11, "kraken_reports_mags_derep": 5, "kraken_reports_mags_derep_50": 10, "kraken_reports_read": 11, "ksize": 6, "l50": 8, "lab": [0, 7], "label": [1, 9], "laboratori": 7, "larg": 6, "later": 8, "learn": [1, 2, 4], "len": [8, 11], "length": [4, 8, 9], "let": [1, 14], "like": [8, 12], "lineag": 8, "list": 0, "local": 8, "longer": 8, "longest": 6, "look": [8, 11], "low": [3, 4], "m": [5, 8, 11, 13], "mag": [7, 9, 12, 13, 14], "mags_derep": [5, 13], "mags_derep_50": [6, 10], "mags_derep_ft": [5, 13], "mags_derep_index": 5, "mags_derep_length": 5, "mags_derep_taxonomi": 5, "mags_derep_taxonomy_50": 10, "mags_dist_matrix_50": 6, "mags_filtered_50": [6, 8], "mags_ft_50": 6, "mags_minhash_50": 6, "mai": [3, 5, 6, 9], "mail": 0, "main": 0, "major": 9, "make": 1, "makeup": 7, "mani": [1, 8], "map": [2, 10, 11], "mapper": 12, "mapq": 5, "match": [5, 9], "matrix": [6, 13], "max": 13, "max_block": 1, "max_work": 1, "mean": 9, "measur": 13, "megahit": [1, 7], "mem": 1, "memori": [8, 9, 10, 11, 12, 13], "mention": 1, "menzel": 9, "mer": 9, "merg": 6, "meta": 8, "metabat": 7, "metadata": [0, 5, 8, 11, 13], "metagenom": [1, 3, 5, 8, 10, 11, 12, 14], "method": [6, 9, 13, 14], "metric": [5, 8, 13], "microb": 12, "microbi": [7, 9, 12], "microbiom": 14, "microorgan": 7, "might": 9, "million": 5, "min": [5, 6, 8], "minim": [5, 10, 11], "minimum": [4, 5, 8], "mixtur": 7, "mode": 8, "modular": 14, "more": [1, 2, 3, 4, 5, 7, 9, 11, 12], "moreov": 3, "moshpit": [0, 2, 3, 5, 6, 8, 10, 11, 13], "moshpit_doc": 0, "most": [6, 8, 14], "move": 14, "multi": 14, "n": 0, "n50": 8, "name": 12, "ncbi": 0, "ncbiaccessionid": 0, "necessari": [1, 5, 6, 14], "need": [0, 1, 2, 7, 11, 12, 13], "new": 2, "next": [2, 3, 5, 8, 13], "ng": 3, "nodes_per_block": 1, "non": 7, "now": [5, 8, 10, 11, 13], "nr_euk": 11, "nucleotid": 9, "num": [8, 13], "number": 8, "nutrient": 12, "o": [0, 2, 4, 5, 6, 8, 10, 11, 13], "observ": 13, "obtain": [11, 13], "offici": [1, 7, 9, 12], "omic": 14, "onc": [5, 8, 13, 14], "one": [2, 4, 5, 8, 11, 13], "onli": [0, 5, 6, 8, 12], "optim": 8, "option": [2, 5, 7], "order": [4, 11, 13], "org": 7, "organ": [7, 9, 11, 12], "origin": [5, 8, 11], "ortholog": 8, "other": [2, 3, 6, 8, 9, 12, 13], "our": [6, 8, 12, 14], "out": [2, 3, 8], "outcom": 9, "outlin": 12, "output": 6, "over": 13, "overview": 3, "p": [0, 4, 5, 6, 8, 10, 11, 13], "pair": [0, 4, 5, 8, 9, 11], "pangenom": 2, "paramet": [7, 8], "parsl": 1, "part": [8, 14], "particular": 8, "partit": 1, "path": [0, 2], "pathwai": 13, "pcoa": 13, "per": [1, 5, 8], "perfect": 5, "perform": [2, 11, 12, 13, 14], "phred": 5, "pipelin": 14, "place": 1, "plai": 13, "plasmid": 11, "platform": 14, "pleas": 1, "plot": [5, 11, 13], "plugin": [0, 2, 3, 4, 8, 11, 14], "pluspf": [5, 11], "popular": 8, "posit": 4, "post": 1, "potenti": [8, 9, 12], "precompil": 8, "prepar": 3, "presenc": 8, "present": [9, 13], "preset": 8, "press": 13, "previou": [8, 11], "previous": 12, "princip": 13, "procedur": 3, "process": [7, 8, 12, 14], "produc": 8, "product": 13, "programmat": 0, "progress": 13, "prok": 8, "prokaryot": [8, 11], "protein": 12, "protozoa": 11, "proven": 14, "provid": [0, 1, 2, 3, 5, 7, 8, 9, 12, 13], "publish": 14, "purpos": 8, "put": 8, "q2": [0, 1, 8, 11], "qiim": [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14], "qiime2": [7, 12], "qualiti": [2, 5, 7, 8, 9, 14], "quast": 7, "queri": [9, 11], "qzv": [4, 5, 8, 11, 13], "raw": [0, 14], "read": [0, 3, 7, 12, 14], "readi": [5, 13], "reads_filt": [2, 5, 8, 11], "reads_pair": [0, 11], "reads_singl": 0, "reads_to_contig": 8, "reads_to_derep_mag": 5, "reads_trim": [2, 4], "recom": 8, "recommend": 2, "reconstruct": [7, 12], "recov": [5, 7, 8, 12, 14], "recoveri": 12, "reduc": 6, "redund": [6, 7], "refer": [2, 5, 7, 8, 9, 11, 12, 13], "reference_index": 2, "reference_seeq": 2, "reference_seq": 2, "refseq": 11, "rel": 11, "relat": 11, "remov": [3, 4, 6, 11], "report": [5, 10, 11], "repres": [2, 6, 8], "represent": 6, "reproduc": 14, "requir": [0, 5, 8, 11], "research": [7, 9], "resourc": [1, 8, 9, 12], "rest": 0, "result": [5, 8, 9, 11, 13], "retain": [5, 6], "retri": 0, "retriev": [11, 14], "return": 2, "right": 13, "role": [7, 12], "rpkm": 5, "run": [0, 1, 8, 9, 11, 12], "same": 10, "sampl": [3, 5, 8, 9, 13], "sampledata": 10, "sbatch": 1, "scaffold": 8, "scale": 6, "scatter": 13, "scheduler_opt": 1, "scienc": 14, "scope": 9, "score": [4, 5], "section": [3, 5, 11, 12], "see": [4, 5, 12, 13, 14], "seed": [5, 8, 13], "select": [9, 13], "sensit": 8, "seq": [5, 8, 10, 11], "sequenc": [0, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13], "set": [7, 8, 10, 14], "setup": 14, "sever": [8, 14], "short": [8, 9], "shorter": 4, "shotgun": [11, 14], "should": [1, 3, 5, 8, 11, 13], "shown": 2, "signific": 9, "similar": [5, 6, 8, 9, 11, 13], "similarli": 11, "simpli": 13, "simplifi": 8, "sinc": 2, "singl": [0, 1, 2, 8, 12], "size": [8, 9, 11], "slurmprovid": 1, "small": 14, "smaller": [1, 8], "so": 2, "some": 9, "sourc": 1, "sourmash": 7, "spade": [7, 8], "speci": 11, "special": 12, "specif": [2, 6, 8, 9, 13], "specifi": [8, 13], "sra": 0, "standard": 8, "start": [2, 13, 14], "statist": 8, "step": [3, 5, 6, 7, 8, 11, 12, 13], "still": 8, "store": 1, "structur": 8, "studi": 12, "subset": [1, 10], "suffici": [8, 9, 12], "suit": [3, 14], "summar": 4, "support": 5, "sure": 1, "surviv": 12, "system": [8, 9, 12], "tab": 13, "tabl": [5, 6, 8, 11], "table1": 13, "table2": 13, "tailor": 8, "take": [0, 8], "taxa": [5, 11], "taxon": 13, "taxonom": [5, 14], "taxonomi": [5, 10, 11], "techniqu": 9, "than": 4, "thei": 0, "them": 2, "themselv": 14, "thi": [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], "thorugh": 8, "those": 9, "thread": [5, 8, 10, 11], "threshold": [6, 10, 11], "through": [0, 1, 8, 14], "time": 13, "timepoint": 13, "too": 9, "tool": [0, 1, 2, 6, 7, 8, 9, 10, 11, 12], "top": 13, "total": [8, 13], "tpm": 5, "track": 14, "trajectori": 13, "transcript": 5, "transform": 9, "translat": 9, "transport": 12, "trim": 3, "true": 8, "try": [8, 11], "tsv": [0, 5, 11, 13], "tutori": [0, 1, 2, 8, 10, 12, 13], "two": [8, 11], "type": [0, 2, 3, 9, 11, 13], "typic": 9, "u": 13, "unbin": 8, "unbinned_contig": 8, "unclassifi": 11, "uncultur": 7, "under": 8, "understand": 12, "uniqu": 6, "univec_cor": 11, "up": 14, "us": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], "usag": 8, "valuabl": 8, "vari": 9, "variou": [7, 8, 12], "verbos": [0, 5, 6, 8, 10, 11, 13], "view": 1, "viral": 11, "virus": 8, "visual": [1, 4, 5, 8, 13], "voutcn": 7, "wa": [1, 11], "wai": [0, 5], "walltim": 1, "want": 8, "we": [0, 1, 2, 4, 5, 6, 8, 10, 11, 12, 13, 14], "well": 8, "wget": 0, "wheeler": 9, "when": [0, 9], "where": 8, "which": [1, 2, 3, 5, 8, 9, 11], "while": [1, 9], "whole": 14, "wish": 8, "within": [9, 12], "without": 7, "wood": 9, "work": 1, "worker_init": 1, "workflow": [6, 7, 8, 9, 12, 14], "would": 8, "ye": 9, "you": [0, 1, 2, 4, 8, 11, 13, 14], "your": [0, 1, 5, 8, 9, 11, 12, 13], "z": 11}, "titles": ["Data retrieval", "Setup", "Host read removal", "Quality control", "Quality filtering", "MAG abundance estimation", "MAG set dereplication", "Recovery of Metagenome-assembled Genomes", "Recovery of MAGs", "Taxonomic classification", "Taxonomic classification of MAGs", "Taxonomic classification of reads", "Functional annotation", "Functional annotation", "MOSHPIT tutorial"], "titleterms": {"": [5, 13], "1": 11, "2": [9, 11], "abund": 5, "against": 13, "align": 13, "annot": [12, 13], "approach": 11, "assembl": [7, 8], "base": 9, "bin": 8, "busco": 8, "cazym": 13, "classif": [9, 10, 11], "compar": 6, "comput": 6, "contamin": 2, "contig": 8, "control": 3, "data": 0, "databas": 13, "derepl": [5, 6], "diamond": 13, "divers": 13, "dna": 9, "eggnog": 13, "estim": 5, "evalu": 8, "extract": 13, "filter": [4, 8], "function": [12, 13], "genom": 7, "get": 5, "have": [5, 13], "host": 2, "human": 2, "index": [5, 8], "kaiju": [9, 11], "kraken": [9, 11], "length": 5, "let": [5, 13], "look": [5, 13], "mag": [5, 6, 8, 10], "map": [5, 8], "megahit": 8, "metabat": 8, "metagenom": 7, "minhash": 6, "moshpit": 14, "multipli": 13, "note": 1, "ortholog": 13, "our": [5, 13], "overview": [4, 9], "parallel": 1, "protein": 9, "qc": 8, "qualiti": [3, 4], "quast": 8, "read": [2, 4, 5, 8, 9, 11], "recoveri": [7, 8], "remov": 2, "requir": 13, "retriev": 0, "search": 13, "set": 6, "setup": 1, "signatur": 6, "sourmash": 6, "tabl": 13, "taxonom": [9, 10, 11], "trim": 4, "tutori": 14, "us": 13, "visual": 11}})