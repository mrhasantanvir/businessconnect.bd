import os
import re

path = r'e:\all project\businessconnect.bd\src\app\merchant'

def clean_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove all dark: classes
    content = re.sub(r'dark:[^ "\']+', '', content)
    
    # 2. Replace hardcoded dark background
    content = content.replace('bg-[#0F172A]', 'bg-white border border-slate-100')
    content = content.replace('bg-[#121212]', 'bg-white')
    content = content.replace('bg-[#1A1A1A]', 'bg-slate-50')
    content = content.replace('bg-[#0A0A0A]', 'bg-white')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith('.tsx'):
            clean_file(os.path.join(root, file))
