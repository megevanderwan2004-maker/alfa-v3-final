import glob
import re

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove inline padding-top from main-content
    # Matches: <main class="main-content" style="padding-top: 120px;">
    # Or: <main class="main-content" style="padding-top: 15vh;">
    new_content = re.sub(r'(<main[^>]*class="[^"]*main-content[^"]*"[^>]*)\s+style="padding-top:\s*[^;"]+;?"', r'\1', content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned up inline styles in {file}")
    else:
        print(f"No inline styles found in {file}")
