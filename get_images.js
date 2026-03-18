const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

async function downloadImage(query, filename) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        console.log(`Searching Google Images for: ${query}`);
        await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`);
        
        // Wait for images to load
        await page.waitForSelector('img');
        
        // Extract the first high-res image URL (often stored in data attributes or hrefs)
        // Click the first image to open the preview panel
        await page.click('#isz_lt'); // if we wanted tools
        const firstImage = await page.$('div[data-ri="0"] img') || await page.$('img.rg_i');
        if (firstImage) {
            await firstImage.click();
            await page.waitForTimeout(2000);
            
            // Look for the large image in the preview panel
            const largeImgUrl = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img.n3VNCb, img.iPVvYb'));
                for (let img of imgs) {
                    const src = img.src;
                    if (src && src.startsWith('http') && !src.includes('encrypted-tbn0')) {
                        return src;
                    }
                }
                return null;
            });

            if (largeImgUrl) {
                console.log(`Found large image: ${largeImgUrl}`);
                // Download it using curl to avoid node https issues with redirects
                const { execSync } = require('child_process');
                execSync(`curl -sLA "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -o "./images/${filename}" "${largeImgUrl}"`);
                console.log(`Saved as ./images/${filename}`);
            } else {
                console.log(`Could not extract large image URL for ${query}`);
            }
        }
    } catch(e) {
        console.error(`Error with ${query}: ${e.message}`);
    } finally {
        await browser.close();
    }
}

(async () => {
    await downloadImage("GPS Coban 403A white background isolated", "KGPCO403A.jpg");
    await downloadImage("Actuador de seguros electricos 2 cables alarma blanco isolated", "PACAL.jpg");
})();
