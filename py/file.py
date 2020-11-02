import json
content = []
with open('../js/script.js', 'r') as f:
    i = 0
    for line in f:
        if i%2==0:
            content.append(line[:len(line)-2])
        i+=1
        
with open('../json/snippets.json', 'w') as f:
    json.dump(content, f)
