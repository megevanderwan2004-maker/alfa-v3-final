import urllib.request
url = "https://alfaperformance.mx/content/2-aviso-de-privacidad"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8', errors='ignore')
    
    start_idx = html.find('<div id="content" class="page-content page-cms">')
    if start_idx == -1:
        start_idx = html.find('<section id="content"')
        if start_idx != -1:
            start_idx = html.find('>', start_idx) + 1
    else:
        start_idx = html.find('>', start_idx) + 1
        
    if start_idx != -1:
        # Find the next </section> or the end of the div
        end_idx = html.find('</section>', start_idx)
        if end_idx == -1:
            # Maybe it ends before footer
            end_idx = html.find('<footer', start_idx)
        print("Found HTML excerpt:")
        print(html[start_idx:start_idx+100])
        print("...")
        print(html[end_idx-100:end_idx])
    else:
        print("Not found")
