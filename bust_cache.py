import glob

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply ?v=8 to script.js
    if 'script.js"' in content:
        content = content.replace('script.js"', 'script.js?v=8"')
    if 'script.js?v=7"' in content:
        content = content.replace('script.js?v=7"', 'script.js?v=8"')

    # Apply ?v=8 to style.css
    if 'style.css"' in content:
        content = content.replace('style.css"', 'style.css?v=8"')
    if 'style.css?v=7"' in content:
        content = content.replace('style.css?v=7"', 'style.css?v=8"')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated cache-buster in {file}")
