const fs = require('fs');
const files = fs.readdirSync('./images_alfaperf').filter(f => f.endsWith('.jpg'));
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Image Preview - Alfa Performance</title>
    <style>
        body { background: #121212; color: #fff; font-family: sans-serif; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .card { background: #1e1e1e; padding: 10px; border-radius: 8px; text-align: center; }
        img { max-width: 100%; height: 200px; object-fit: contain; cursor: pointer; background: #fff; border-radius: 4px; }
        p { margin: 10px 0 0 0; font-size: 14px; word-break: break-all; }
    </style>
</head>
<body>
    <h2>Prévisualisation des images téléchargées (${files.length} images)</h2>
    <p>Cliquez sur une image pour l'ouvrir en taille réelle.</p>
    <div class="grid">
        ${files.map(f => `
            <div class="card">
                <a href="images_alfaperf/${f}" target="_blank">
                    <img src="images_alfaperf/${f}" alt="${f}" loading="lazy">
                </a>
                <p><strong>${f}</strong></p>
            </div>
        `).join('')}
    </div>
</body>
</html>
`;
fs.writeFileSync('preview.html', html);
console.log('preview.html generated successfully.');
