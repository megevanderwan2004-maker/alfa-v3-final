import urllib.request
import json
import os

urls = {
    "aviso-de-privacidad": "https://alfaperformance.mx/content/2-aviso-de-privacidad",
    "terminos-y-condiciones": "https://alfaperformance.mx/content/3-terminos-condiciones",
    "politica-pago": "https://alfaperformance.mx/content/5-politica-pago",
    "politica-devoluciones": "https://alfaperformance.mx/content/7-politica-devoluciones",
    "politica-garantias": "https://alfaperformance.mx/content/8-politica-garantias",
    "envios-y-devoluciones": "https://alfaperformance.mx/content/1-envios-devoluciones"
}

for name, url in urls.items():
    print(f"Fetching {name}")
    api_url = "https://api.allorigins.win/get?url=" + urllib.parse.quote(url)
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            html = data['contents']
            # Find the #content.page-cms div
            import re
            match = re.search(r'<div id="content" class="page-content page-cms">(.*?)</div>\s*</section>', html, re.DOTALL)
            if match:
                content = match.group(1).strip()
            else:
                match = re.search(r'<section id="content"[^>]*>(.*?)</section>', html, re.DOTALL)
                if match:
                    content = match.group(0).strip()
                else: 
                     content = "Content not found"
            
            with open(f"{name}_content.html", "w") as f:
                f.write(content)
    except Exception as e:
        print(f"Error {name}: {e}")

