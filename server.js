const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({ origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'null'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

app.post('/save-catalog', (req, res) => {
  try {
    let { catalog } = req.body;
    if (!catalog || !Array.isArray(catalog)) return res.status(400).json({ success: false });

    // Step 5: Standardize imagePath before writing
    catalog = catalog.map(p => {
        const skuClean = String(p.sku).replace('#', '').trim();
        return {
            ...p,
            imagePath: `./images/${skuClean}.jpg`
        };
    });

    const content = `const catalog = ${JSON.stringify(catalog, null, 2)};\n\nexport default catalog;`;
    fs.writeFileSync(path.join(__dirname, 'catalog.js'), content, 'utf8');
    
    console.log(`✅ catalog.js updated — ${catalog.length} products saved`);
    res.json({ success: true, count: catalog.length });
  } catch (e) {
    console.error('❌ Save error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`✅ Serveur sur http://localhost:${PORT}`));
