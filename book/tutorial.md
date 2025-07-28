(tutorial)=
# Tutorial

[//]: # (:::{note})

[//]: # (This document was built with its own conda environment.)

[//]: # (You can download the environment file that was used from the download link on the top-right of this article.)

[//]: # (:::)

[//]: # ()
[//]: # (:::{describe-usage})

[//]: # (:scope: moshpit-docs)

[//]: # (def factory&#40;&#41;:)

[//]: # (    import qiime2)

[//]: # (    return qiime2.Artifact.load&#40;'/Users/mziemski/Repos/docs_tutorial/demux.qza'&#41;)

[//]: # (some_data = use.init_artifact&#40;'my_artifact', factory&#41;)

[//]: # (:::)

[//]: # ()
[//]: # (:::{describe-usage})

[//]: # (use.action&#40;)

[//]: # (  use.UsageAction&#40;plugin_id='demux',)

[//]: # (                  action_id='summarize'&#41;,)

[//]: # (  use.UsageInputs&#40;data=some_data&#41;,)

[//]: # (  use.UsageOutputNames&#40;visualization='demux_summary'&#41;)

[//]: # (&#41;)

[//]: # (:::)

