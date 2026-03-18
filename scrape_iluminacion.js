const { execSync } = require('child_process');
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    let catalog;
    eval(fs.readFileSync("catalog.js","utf8").replace("const catalog =", "catalog="));
    const ilumWords = ["ilumina", "faro", "led", "xenon", "halógeno", "halogeno", "luz", "balastra"]; 
    const missing = catalog.filter(p => !fs.existsSync(p.imagePath.replace(/^.\/images\//, "./images/")) && !fs.existsSync("./images_alfaperf/" + p.sku + ".jpg") && !fs.existsSync(p.imagePath.replace(/^.\/images\//, "./images/").replace(".jpg", ".png"))).filter(p => (p.categoria && ilumWords.some(w => p.categoria.toLowerCase().includes(w))) || (p.nombre && ilumWords.some(w => p.nombre.toLowerCase().includes(w))));

    console.log(`Found ${missing.length} missing images for Iluminacion.`);
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    for (let item of missing) {
        console.log(`\nProcessing: ${item.nombre} (${item.sku})`);
        let skuQuery = item.sku.replace('#', '');
        let nameQuery = encodeURIComponent(item.nombre.split(' ').slice(0,4).join(' '));
        
        let foundUrl = null;
        
        // 1. Try old site via curl
        let urlsToTry = [
            `https://alfaperformance.mx/busqueda?controller=search&s=${encodeURIComponent(skuQuery)}`,
            `https://alfaperformance.mx/busqueda?controller=search&s=${nameQuery}`
        ];
        
        for (let url of urlsToTry) {
            try {
                let html = execSync(`curl -sA "Mozilla/5.0" "${url}"`).toString();
                let $ = cheerio.load(html);
                let link = $('.thumbnail.product-thumbnail').first().attr('href');
                if (link) {
                    let pHtml = execSync(`curl -sA "Mozilla/5.0" "${link}"`).toString();
                    let p$ = cheerio.load(pHtml);
                    let imgUrl = p$('.js-qv-product-cover').attr('src');
                    if (imgUrl) {
                        foundUrl = imgUrl.replace(/-[a-z0-9_]+\.jpg/, '-large_default.jpg');
                        break;
                    }
                }
            } catch(e) {}
        }
        
        if (foundUrl) {
            console.log(`Found on Alfa: ${foundUrl}`);
            try {
                execSync(`curl -sA "Mozilla/5.0" -o "./images/${skuQuery}.jpg" "${foundUrl}"`);
                console.log(`Saved ./images/${skuQuery}.jpg`);
                continue;
            } catch(e) { console.log('Download failed.'); }
        }
        
        // 2. Try Amazon via Puppeteer
        console.log(`Not found on ALFA. Trying Amazon MX...`);
        try {
            let amzQuery = encodeURIComponent(item.nombre);
            await page.goto(`https://www.amazon.com.mx/s?k=${amzQuery}`, {waitUntil: 'networkidle2'});
            const imgUrl = await page.evaluate(() => {
                const img = document.querySelector('img.s-image[data-image-index="1"]') || document.querySelector('img.s-image');
                return img ? img.src : null;
            });
            if (imgUrl) {
                let highResUrl = imgUrl.replace(/\._AC_[^.]+\./, '.');
                console.log(`Found on Amazon: ${highResUrl}`);
                execSync(`curl -sLA "Mozilla/5.0" -o "./images/${skuQuery}.jpg" "${highResUrl}"`);
                console.log(`Saved ./images/${skuQuery}.jpg`);
            } else {
                console.log(`FAILED to find image on Amazon.`);
            }
        } catch(e) {
            console.log(`Amazon search error: ${e.message}`);
        }
    }
    
    await browser.close();
})();
