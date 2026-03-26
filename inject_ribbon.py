import glob
import os

html_snippet = """        <!-- Mobile Secondary Categories Bar -->
        <div class="mobile-category-ribbon" id="mobile-category-ribbon">
            <div class="ribbon-item">
                <span onclick="toggleRibbon(this, 'iluminacion')">ILUMINACIÓN <i class="fa-solid fa-chevron-down"></i></span>
                <div class="ribbon-dropdown" id="ribbon-drop-iluminacion"></div>
            </div>
            <div class="ribbon-item">
                <span onclick="toggleRibbon(this, 'audio')">AUDIO <i class="fa-solid fa-chevron-down"></i></span>
                <div class="ribbon-dropdown" id="ribbon-drop-audio"></div>
            </div>
            <div class="ribbon-item">
                <span onclick="toggleRibbon(this, 'seguridad')">SEGURIDAD <i class="fa-solid fa-chevron-down"></i></span>
                <div class="ribbon-dropdown" id="ribbon-drop-seguridad"></div>
            </div>
        </div>
"""

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already injected to avoid duplicates
    if 'id="mobile-category-ribbon"' not in content:
        content = content.replace('</header>', html_snippet + '        </header>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {file}")
