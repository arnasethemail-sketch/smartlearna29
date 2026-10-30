---
base_model: microsoft/xtremedistil-l6-h256-uncased
language:
- en
tags:
- text-classification
- zero-shot-classification
pipeline_tag: zero-shot-classification
library_name: transformers
license: mit
---


# xtremedistil-l6-h256-zeroshot-v1.1-all-33 

This model was fine-tuned using the same pipeline as described in 
the model card for [MoritzLaurer/deberta-v3-large-zeroshot-v1.1-all-33](https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v1.1-all-33)
and in this [paper](https://arxiv.org/pdf/2312.17543.pdf).
 
The foundation model is [microsoft/xtremedistil-l6-h256-uncased](https://huggingface.co/microsoft/xtremedistil-l6-h256-uncased).
The model only has 22 million backbone parameters and 30 million vocabulary parameters. 
The backbone parameters are the main parameters active during inference, providing a significant speedup over larger models. 
The model is 25 MB small.

This model was trained to provide a very small and highly efficient zeroshot option, 
especially for edge devices or in-browser use-cases with transformers.js.

## Usage and other details
For usage instructions and other details refer to 
this model card [MoritzLaurer/deberta-v3-large-zeroshot-v1.1-all-33](https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v1.1-all-33)
and this [paper](https://arxiv.org/pdf/2312.17543.pdf).

## Metrics:

I didn't not do zeroshot evaluation for this model to save time and compute. 
The table below shows standard accuracy for all datasets the model was trained on (note that the NLI datasets are binary).

General takeaway: the model is much more efficient than its larger sisters, but it performs less well. 

|Datasets|mnli_m|mnli_mm|fevernli|anli_r1|anli_r2|anli_r3|wanli|lingnli|wellformedquery|rottentomatoes|amazonpolarity|imdb|yelpreviews|hatexplain|massive|banking77|emotiondair|emocontext|empathetic|agnews|yahootopics|biasframes_sex|biasframes_offensive|biasframes_intent|financialphrasebank|appreviews|hateoffensive|trueteacher|spam|wikitoxic_toxicaggregated|wikitoxic_obscene|wikitoxic_identityhate|wikitoxic_threat|wikitoxic_insult|manifesto|capsotu|
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|Accuracy|0.894|0.895|0.854|0.629|0.582|0.618|0.772|0.826|0.684|0.794|0.91|0.879|0.935|0.676|0.651|0.521|0.654|0.707|0.369|0.858|0.649|0.876|0.836|0.839|0.849|0.892|0.894|0.525|0.976|0.88|0.901|0.874|0.903|0.886|0.433|0.619|
|Inference text/sec (A10G GPU, batch=128)|4117.0|4093.0|1935.0|2984.0|3094.0|2683.0|5788.0|4926.0|9701.0|6359.0|1843.0|692.0|756.0|5561.0|10172.0|9070.0|7511.0|7480.0|2256.0|3942.0|1020.0|4362.0|4034.0|4185.0|5449.0|2606.0|6343.0|931.0|5550.0|864.0|839.0|837.0|832.0|857.0|4418.0|4845.0|


