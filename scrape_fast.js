const axiosOrig = require('axios');
const axios = axiosOrig.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const cheerio = require('cheerio');

const TARGETS_FILE = 'scrape_targets.json';
const STATE_FILE = 'scrape_state.json';
const OUTPUT_DIR = './images_alfaperf';
const REPORT_FILE = 'rapport_scraping.txt';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let targets = JSON.parse(fs.readFileSync(TARGETS_FILE, 'utf8'));
let state = {
    downloaded: 0,
    replaced: [],
    notFound: [],
    processedSKUs: [],
    totalSizesKB: 0
};

if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

async function downloadImage(url, destPath) {
    try {
        const response = await axios({ url, responseType: 'arraybuffer', timeout: 10000 });
        const buffer = Buffer.from(response.data, 'binary');
        const newSizeKB = buffer.byteLength / 1024;

        if (fs.existsSync(destPath)) {
            const stats = fs.statSync(destPath);
            const oldSizeKB = stats.size / 1024;
            if (newSizeKB > oldSizeKB + 5) { // Replace if new is significantly larger (5KB+)
                fs.writeFileSync(destPath, buffer);
                return { action: 'replaced', sizeKB: newSizeKB };
            } else {
                return { action: 'skipped', sizeKB: oldSizeKB };
            }
        } else {
            fs.writeFileSync(destPath, buffer);
            return { action: 'downloaded', sizeKB: newSizeKB };
        }
    } catch (e) {
        return { action: 'failed', error: e.message };
    }
}

async function scrape() {
    let currentRunDownloads = 0;
    const MAX_DOWNLOADS_PER_RUN = 50;
    const allExpectedSKUs = new Set();
    const categories = Object.keys(targets);
    
    for (const catUrl of categories) {
        targets[catUrl].forEach(sku => allExpectedSKUs.add(sku));
    }

    for (const categoryUrl of categories) {
        const skus = targets[categoryUrl];
        const unprocessed = skus.filter(s => !state.processedSKUs.includes(s));
        if (unprocessed.length === 0) { continue; }

        console.log(`\n=> Processing Category: ${categoryUrl} (${unprocessed.length} pending SKUs)`);
        
        let pageNum = 1;
        let hasProducts = true;
        let previousProducts = [];

        while (hasProducts) {
            const url = `${categoryUrl}?p=${pageNum}`;
            console.log(` Visiting page: ${url}`);
            
            let html;
            try {
                const res = await axios.get(url, { timeout: 10000 });
                if (typeof res.data === 'object' && res.data.rendered_products) {
                    html = res.data.rendered_products;
                } else {
                    html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
                }
            } catch (e) {
                console.log(` Error loading category page: ${e.message}`);
                break;
            }

            const $ = cheerio.load(html);
            let productLinks = [];
            let allHrefs = [];
            $('a').each((i, el) => {
                let href = $(el).attr('href');
                if (href) allHrefs.push(href);
                if (href && href.endsWith('.html') && !href.includes('?')) {
                    if (!href.startsWith('http')) {
                        href = new URL(href, 'https://alfaperformance.mx').href;
                    }
                    productLinks.push(href);
                }
            });
            if (pageNum === 1) console.log("Sample hrefs found:", allHrefs.slice(0, 5));
            productLinks = [...new Set(productLinks)];

            if (productLinks.length === 0 || JSON.stringify(productLinks) === JSON.stringify(previousProducts)) {
                console.log(` No more unique products found on page ${pageNum}. Proceeding to next category.`);
                hasProducts = false;
                break;
            }
            previousProducts = productLinks;

            for (const link of productLinks) {
                if (currentRunDownloads >= MAX_DOWNLOADS_PER_RUN) {
                    console.log(`\n[PAUSE] Reached ${MAX_DOWNLOADS_PER_RUN} downloads in this run.`);
                    finalize();
                    return;
                }

                try {
                    const htmlBuffer = require('child_process').execSync(`curl -sL "${link}"`, { maxBuffer: 1024 * 1024 * 10 });
                    const phtml = htmlBuffer.toString();
                    const $p = cheerio.load(phtml);
                    
                    let sku = $p('[itemprop="sku"]').text().trim();
                    if (!sku) sku = $p('.product-reference span').text().trim();
                    if (!sku) sku = $p('meta[itemprop="sku"]').attr('content');
                    if (!sku) {
                         const skuMatch = phtml.match(/"sku"\s*:\s*"([^"]+)"/);
                         if (skuMatch) sku = skuMatch[1].trim();
                    }

                    console.log(`   Checked: ${link} | Extracted SKU: ${sku}`);

                    if (sku) {
                        if (skus.includes(sku) && !state.processedSKUs.includes(sku)) {
                            console.log(`  MATCH: ${sku}`);
                            
                            let imgUrl = $p('meta[property="og:image"]').attr('content');
                            
                            if (imgUrl) {
                                // Sometimes the large_default doesn't exist but pd4_def does. Try large first.
                                imgUrl = imgUrl.replace('-home_default', '-large_default');
                                const destPath = path.join(OUTPUT_DIR, `${sku}.jpg`);
                                let result = await downloadImage(imgUrl, destPath);
                                
                                if (result.action === 'failed' && result.error.includes('404')) {
                                    imgUrl = imgUrl.replace('-large_default', '-pd4_def');
                                    result = await downloadImage(imgUrl, destPath);
                                }
                                
                                if (result.action === 'downloaded' || result.action === 'replaced') {
                                    state.downloaded++;
                                    currentRunDownloads++;
                                    state.totalSizesKB += result.sizeKB;
                                    state.processedSKUs.push(sku);
                                    if (result.action === 'replaced') state.replaced.push(sku);
                                    console.log(`   -> Success (${result.action})`);
                                } else if (result.action === 'skipped') {
                                    state.processedSKUs.push(sku);
                                    console.log(`   -> File exists and is larger/equal. Skipped.`);
                                } else {
                                     console.log(`   -> Failed to download image: ${result.error}`);
                                }
                            } else {
                                console.log(`   Warning: No image URL found in DOM for SKU: ${sku}`);
                            }
                        }
                    }
                } catch (e) {
                    console.log(`   [Error processing link ${link}]: ${e.message}`);
                }
            } 
            
            pageNum++;
        } 
    } 

    finalize();
}

function finalize() {
    state.notFound = [];
    Object.values(targets).forEach(list => {
        list.forEach(sku => {
            if (!state.processedSKUs.includes(sku)) {
                state.notFound.push(sku);
            }
        });
    });

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

    const avgSize = state.downloaded > 0 ? (state.totalSizesKB / state.downloaded).toFixed(2) : 0;
    let report = `=== RAPPORT DE SCRAPING ===\n`;
    report += `Images téléchargées au total : ${state.downloaded}\n`;
    report += `Taille moyenne (KB) : ${avgSize}\n`;
    report += `Images remplacées par une meilleure : ${state.replaced.length}\n`;
    if (state.replaced.length > 0) {
        report += ` - ${state.replaced.join(', ')}\n`;
    }
    report += `\nSKUs non trouvés (${state.notFound.length}) :\n`;
    if (state.notFound.length > 0) {
        report += state.notFound.join('\n') + '\n';
        fs.writeFileSync('not_found.txt', state.notFound.join('\n'));
    } else {
         report += `Aucun (ou mission terminée à 100%)\n`;
    }
    fs.writeFileSync(REPORT_FILE, report);
    console.log(`\nReport written to ${REPORT_FILE}`);
}

scrape();
