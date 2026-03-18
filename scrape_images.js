const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const START_URL = process.argv[2] || 'https://alfaperformance.mx/13-productos';
const OUTPUT_DIR = path.join(__dirname, 'images_secours');

// Selectors
const SELECTORS = {
    PRODUCT_LINK: 'a.thumbnail.product-thumbnail, .tvproduct-name a',
    LOAD_MORE: 'button#tv-button-load-products, .tv-button-load-products',
    PRODUCT_TITLE: 'h1.h1, h1[itemprop="name"]',
    PRODUCT_SKU: '.product-reference span, [itemprop="sku"]',
    PRODUCT_IMAGE: 'img.js-qv-product-cover, .product-cover img, [itemprop="image"]',
    PRODUCT_PRICE: '.current-price span, [itemprop="price"]',
    PRODUCT_DESC: '.product-description, #description, [itemprop="description"]'
};

function normalizeName(name) {
    return name.trim()
        .replace(/^#/, '')
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toUpperCase();
}

async function downloadImage(url, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);
    if (await fs.pathExists(filePath)) {
        return;
    }

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`  Error downloading image ${url}:`, error.message);
    }
}

async function main() {
    await fs.ensureDir(OUTPUT_DIR);
    console.log(`Images will be saved in: ${OUTPUT_DIR}`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1200 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    console.log(`Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'networkidle2' });

    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));
    }

    let loadMoreAttempts = 0;
    while (loadMoreAttempts < 10) {
        const result = await page.evaluate((sel1, sel2) => {
            const btn = document.querySelector(sel1) || document.querySelector(sel2);
            if (btn && btn.offsetParent !== null && !btn.innerText.includes('No more results')) {
                btn.scrollIntoView();
                return { found: true, text: btn.innerText };
            }
            return { found: false };
        }, 'button#tv-button-load-products', '.tv-button-load-products');

        if (result.found) {
            console.log(`  Clicking Load More: "${result.text.trim()}"`);
            await page.click('button#tv-button-load-products').catch(() => page.click('.tv-button-load-products')).catch(() => null);
            await new Promise(r => setTimeout(r, 5000));
            loadMoreAttempts++;
        } else {
            break;
        }
    }

    const productLinks = await page.$$eval(SELECTORS.PRODUCT_LINK, links => links.map(a => a.href));
    const uniqueLinks = [...new Set(productLinks)];
    console.log(`Found ${uniqueLinks.length} total product links.`);

    const scrapedData = [];

    for (const link of uniqueLinks) {
        try {
            console.log(`Processing: ${link}`);
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

            const data = await page.evaluate((sel) => {
                const title = document.querySelector(sel.PRODUCT_TITLE)?.innerText || '';
                const sku = document.querySelector(sel.PRODUCT_SKU)?.innerText || '';
                const price = document.querySelector(sel.PRODUCT_PRICE)?.innerText || '';
                const desc = document.querySelector(sel.PRODUCT_DESC)?.innerText || '';

                let imgUrl = '';
                const imgSelectors = ['img.js-qv-product-cover', '.product-cover img', '[itemprop="image"]', '.images-container img'];
                for (const s of imgSelectors) {
                    const img = document.querySelector(s);
                    if (img) {
                        imgUrl = img.src || img.getAttribute('data-src') || img.getAttribute('data-zoom-image');
                        if (imgUrl) break;
                    }
                }

                return { title, sku, imgUrl, price, desc };
            }, SELECTORS);

            if (data.imgUrl && data.imgUrl.startsWith('http')) {
                const baseName = data.sku ? normalizeName(data.sku) : normalizeName(data.title);
                const urlObj = new URL(data.imgUrl);
                const ext = path.extname(urlObj.pathname) || '.jpg';
                const filename = `${baseName}${ext}`;

                await downloadImage(data.imgUrl, filename);
                data.localFilename = filename;
                console.log(`  Saved: ${filename}`);
            }

            scrapedData.push(data);
            await new Promise(r => setTimeout(r, 500));
        } catch (err) {
            console.error(`  Error processing ${link}: ${err.message}`);
        }
    }

    // Save metadata for comparison
    await fs.writeJson('scraped_metadata.json', scrapedData, { spaces: 2 });
    console.log('Metadata saved to scraped_metadata.json');

    await browser.close();
    console.log('--- MISSION ACCOMPLISHED ---');
}

main();
