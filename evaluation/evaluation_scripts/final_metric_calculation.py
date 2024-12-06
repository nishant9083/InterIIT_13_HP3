import json
from metric import compute_rouge_n, compute_rouge_n_embed
import nltk

nltk.download("punkt")

def read_file(file_path):
    with open(file_path) as f:
        data = json.load(f)
    return data

def evaluate_rouge_norm(data, a1_name= "true", a2_name= "answer"):
    ln= len(data); 
    metric= {
        "precision": [],
        "recall": [],
        "f1_score": []
    }
    for i, d in enumerate(data):
        result= compute_rouge_n( d[a1_name], d[a2_name] )
        for name in metric.keys():
            metric[name].append(result[name])
    
    answer= {}
    for key in metric.keys():
        answer[key]= sum(metric[key])/ln
    
    return answer

def evaluate_rouge_embed(data, a1_name="true", a2_name= "answer"):
    ln= len(data); 
    metric= {
        "precision": [],
        "recall": [],
        "f1_score": []
    }
    for i, d in enumerate(data):
        result= compute_rouge_n_embed( d[a1_name], d[a2_name] )
        for name in metric.keys():
            metric[name].append(result[name])
    
    answer= {}
    for key in metric.keys():
        answer[key]= sum(metric[key])/ln
    
    return answer
