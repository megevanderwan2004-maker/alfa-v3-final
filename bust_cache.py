import glob

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply ?v=7 to script.js
    if 'script.js"' in content:
        content = content.replace('script.js"', 'script.js?v=7"')
    if 'script.js?v=6"' in content:
        content = content.replace('script.js?v=6"', 'script.js?v=7"')

    # Apply ?v=7 to style.css
    if 'style.css"' in content:
        content = content.replace('style.css"', 'style.css?v=7"')
    if 'style.css?v=6"' in content:
        content = content.replace('style.css?v=6"', 'style.css?v=7"')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated cache-buster in {file}")
