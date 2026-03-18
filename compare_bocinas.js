const fs = require('fs');
const path = require('path');

function compare() {
    const scraped = JSON.parse(fs.readFileSync('scraped_metadata.json', 'utf8'));
    const catalogContent = fs.readFileSync('catalog.js', 'utf8');

    // Better regex for catalog items
    const products = [];
    const entries = catalogContent.split('},');
    for (let entry of entries) {
        const nombreMatch = entry.match(/nombre: "(.*?)"/);
        const skuMatch = entry.match(/sku: "(.*?)"/);
        const priceMatch = entry.match(/precio: (.*?),/);
        const descMatch = entry.match(/descripcion: "(.*?)"/);
        const imgPathMatch = entry.match(/imagePath: "(.*?)"/);

        if (nombreMatch && skuMatch) {
            products.push({
                nombre: nombreMatch[1],
                sku: skuMatch[1].replace('#', ''),
                precio: priceMatch ? priceMatch[1] : '',
                descripcion: descMatch ? descMatch[1] : '',
                imagePath: imgPathMatch ? imgPathMatch[1] : ''
            });
        }
    }

    const report = {
        matches: [],
        not_in_catalog: []
    };

    for (const item of scraped) {
        const exactMatch = products.find(p => p.sku === item.sku);
        if (exactMatch) {
            report.matches.push({
                oldSite: item,
                local: exactMatch
            });
        } else {
            report.not_in_catalog.push(item);
        }
    }

    fs.writeFileSync('comparison_report.json', JSON.stringify(report, null, 2));
    console.log(`Report saved. Matches: ${report.matches.length}, Not in catalog: ${report.not_in_catalog.length}`);
}

compare();
