const fs = require('fs');

function verifyPaths() {
    const report = JSON.parse(fs.readFileSync('comparison_report.json', 'utf8'));
    const matches = report.matches;
    const mismatches = [];

    for (const m of matches) {
        const expected = `./images/${m.oldSite.sku}.jpg`;
        if (m.local.imagePath !== expected) {
            mismatches.push({
                sku: m.oldSite.sku,
                current: m.local.imagePath,
                expected: expected
            });
        }
    }

    console.log('Mismatches found:', JSON.stringify(mismatches, null, 2));
}

verifyPaths();
