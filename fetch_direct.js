const https = require('https');
const fs = require('fs');

const policies = {
    "aviso-de-privacidad": "https://alfaperformance.mx/content/2-aviso-de-privacidad",
    "terminos-y-condiciones": "https://alfaperformance.mx/content/3-terminos-condiciones",
    "politica-pago": "https://alfaperformance.mx/content/5-politica-pago",
    "politica-devoluciones": "https://alfaperformance.mx/content/7-politica-devoluciones",
    "politica-garantias": "https://alfaperformance.mx/content/8-politica-garantias",
    "envios-y-devoluciones": "https://alfaperformance.mx/content/1-envios-devoluciones"
};

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
};

(async () => {
    for (const [name, url] of Object.entries(policies)) {
        await new Promise((resolve) => {
            https.get(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const match = data.match(/<div id="content" class="page-content page-cms">([\s\S]*?)<\/div>\s*<\/section>/) || 
                                  data.match(/<section id="content"[^>]*>([\s\S]*?)<\/section>/);
                    if (match) {
                        fs.writeFileSync(name + "_content.html", match[1].trim());
                        console.log("Saved", name);
                    } else {
                        console.log("Not found in", name);
                    }
                    resolve();
                });
            }).on('error', (e) => {
                console.error(e);
                resolve();
            });
        });
    }
})();
