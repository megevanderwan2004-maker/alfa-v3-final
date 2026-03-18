const puppeteer = require('puppeteer');
const fs = require('fs');
const { execSync } = require('child_process');

async function downloadFromAmazon(query, sku) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    
    try {
        console.log(`Navigating Amazon MX for: ${query}`);
        await page.goto(`https://www.amazon.com.mx/s?k=${encodeURIComponent(query)}`);
        await page.waitForSelector('img.s-image[data-image-index="1"]', { timeout: 10000 });
        
        const imgUrl = await page.evaluate(() => {
            const img = document.querySelector('img.s-image[data-image-index="1"]');
            return img ? img.src : null;
        });
        
        if (imgUrl) {
            const highResUrl = imgUrl.replace(/\._AC_[^.]+\./, '.');
            console.log(`Found image for ${sku}: ${highResUrl}`);
            execSync(`curl -sLA "Mozilla/5.0" -o "./images/${sku}.jpg" "${highResUrl}"`);
            console.log(`Successfully saved ./images/${sku}.jpg`);
        } else {
            console.log(`No image found on Amazon for ${sku}`);
        }
    } catch(e) {
        console.error(`Error with ${sku}: ${e.message}`);
    } finally {
        await browser.close();
    }
}

(async () => {
    await downloadFromAmazon("actuador de seguros electricos 2 cables auto", "PACAL");
})();
