const https = require('https');
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
};
https.get('https://alfaperformance.mx/content/2-aviso-de-privacidad', options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const start = data.indexOf('class="page-content page-cms"');
        const end = data.indexOf('</section>', start);
        console.log(data.substring(start, start+500));
    });
});
