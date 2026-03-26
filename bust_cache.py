import glob

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply ?v=5 to script.js
    if 'script.js"' in content:
        content = content.replace('script.js"', 'script.js?v=5"')
    if 'script.js?v=4"' in content:
        content = content.replace('script.js?v=4"', 'script.js?v=5"')

    # Apply ?v=5 to style.css
    if 'style.css"' in content:
        content = content.replace('style.css"', 'style.css?v=5"')
    if 'style.css?v=4"' in content:
        content = content.replace('style.css?v=4"', 'style.css?v=5"')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated cache-buster in {file}")
