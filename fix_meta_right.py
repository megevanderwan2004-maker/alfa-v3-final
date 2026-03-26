import glob
import re

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to find <div class="nav-right"> followed by <ul class="nav-links">
    # And replace with <ul class="nav-links meta-right"> if not already present
    pattern = r'(<div class="nav-right">[^<]*)\s*<ul class="nav-links">'
    replacement = r'\1\n                    <ul class="nav-links meta-right">'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added meta-right class to {file}")
    else:
        print(f"No changes needed for {file}")
