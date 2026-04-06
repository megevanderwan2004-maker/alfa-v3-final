import urllib.request
import json
import re

policies = {
    "aviso-de-privacidad": "https://alfaperformance.mx/content/2-aviso-de-privacidad",
    "terminos-y-condiciones": "https://alfaperformance.mx/content/3-terminos-condiciones",
    "politica-pago": "https://alfaperformance.mx/content/5-politica-pago",
    "politica-devoluciones": "https://alfaperformance.mx/content/7-politica-devoluciones",
    "politica-garantias": "https://alfaperformance.mx/content/8-politica-garantias",
    "envios-y-devoluciones": "https://alfaperformance.mx/content/1-envios-devoluciones"
}

for slug, url in policies.items():
    print(f"Fetching {slug} via allorigins...")
    api_url = "https://api.allorigins.win/get?url=" + urllib.parse.quote(url)
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            html = data['contents']
            match = re.search(r'<div id="content" class="page-content page-cms">([\s\S]*?)</div>\s*</section>', html, re.IGNORECASE)
            if not match:
                match = re.search(r'<section id="content"[^>]*>([\s\S]*?)</section>', html, re.IGNORECASE)
            
            if match:
                content = match.group(1).strip()
                # Clean up repeated h1
                content = re.sub(r'<h1[^>]*>.*?</h1>', '', content, count=1, flags=re.IGNORECASE|re.DOTALL)
                with open(f"{slug}_raw.html", "w") as f:
                    f.write(content)
                print(f"Success {slug}")
            else:
                print(f"HTML not matched for {slug}")
    except Exception as e:
        print(f"Fail {slug}: {e}")
