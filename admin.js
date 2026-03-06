// =========================================
// ALFA CAR AUDIO - ADMIN LOGIC
// =========================================

let products = [];

document.addEventListener('DOMContentLoaded', () => {
    // Inject the actual catalog data from catalog.js if available
    if (typeof catalog !== 'undefined') {
        products = [...catalog];
    }
    renderTable();
});

const tableBody = document.getElementById('table-body');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');
const btnAdd = document.getElementById('btn-add-product');
const btnExport = document.getElementById('btn-export-catalog');
const btnLogout = document.getElementById('btn-logout');

const fImg = document.getElementById('prod-image');
const preview = document.getElementById('img-preview');

// Logout feature
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('alfa_admin_auth');
        window.location.href = 'index.html';
    });
}

// Open Add Modal
if (btnAdd) {
    btnAdd.addEventListener('click', () => {
        form.reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('modal-title').textContent = 'Agregar Producto';
        preview.innerHTML = '';
        modal.classList.add('active');

        // Default category suggestion if empty
        document.getElementById('prod-category').value = "Nuevos Productos";
    });
}

// Close Modal
const closeModalBtn = document.querySelector('.close-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Close clicking outside the overlay
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Input change preview for image based on text
if (fImg) {
    fImg.addEventListener('input', () => {
        const val = fImg.value.trim();
        if (val) {
            preview.innerHTML = `<img src="./images/${val}" onerror="this.style.display='none'">`;
        } else {
            preview.innerHTML = '';
        }
    });
}

// Form Submit: Add or Edit
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const idVal = document.getElementById('prod-id').value;
        const imgName = fImg.value.trim();

        // Format image path correctly
        const imgPath = imgName ? (imgName.startsWith('./images/') ? imgName : `./images/${imgName}`) : "";

        // Extracting data exactly under the expected format (nombre, sku, precio, categoria, description, imagePath)
        const newProd = {
            nombre: document.getElementById('prod-name').value.trim(),
            sku: document.getElementById('prod-sku').value.trim(),
            precio: parseFloat(document.getElementById('prod-price').value),
            categoria: document.getElementById('prod-category').value.trim(),
            description: document.getElementById('prod-desc').value.trim() || undefined,
            imagePath: imgPath
        };

        // Remove undefined descriptions for clean JSON 
        if (!newProd.description) delete newProd.description;

        // Since we don't have unique IDs inside the products array anymore, 
        // we use the array index stored inside "prod-id" hidden field.
        if (idVal !== '') {
            const idx = parseInt(idVal, 10);
            if (idx >= 0 && idx < products.length) {
                products[idx] = newProd;
            }
        } else {
            products.push(newProd);
        }

        renderTable();
        modal.classList.remove('active');
        alert('Cambios guardados en memoria.\\n¡IMPORTANTE: Haz clic en "SAUVEGARDER LES MODIFICATIONS" para grabar permanentemente!');
    });
}

// Build list for the UI
function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay productos.</td></tr>';
        return;
    }

    products.forEach((p, index) => {
        const tr = document.createElement('tr');
        const imgThumb = p.imagePath ? `<img src="${p.imagePath}" class="thumb" onerror="this.style.display='none'">` : '<div class="no-thumb">Sin Img</div>';

        tr.innerHTML = `
            <td>${imgThumb}</td>
            <td>${p.sku || '-'}</td>
            <td><strong>${p.nombre || '-'}</strong></td>
            <td><span class="badge">${p.categoria || '-'}</span></td>
            <td>$${p.precio || '0'}</td>
            <td>
                <button class="btn-action edit" onclick="editProduct(${index})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action delete" onclick="deleteProduct(${index})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Global functions for inline onclick handlers inside table
window.editProduct = (index) => {
    const p = products[index];
    if (!p) return;

    document.getElementById('modal-title').textContent = 'Editar Producto';
    document.getElementById('prod-id').value = index;
    document.getElementById('prod-name').value = p.nombre || '';
    document.getElementById('prod-sku').value = p.sku || '';
    document.getElementById('prod-price').value = p.precio || '0';
    document.getElementById('prod-category').value = p.categoria || '';
    document.getElementById('prod-desc').value = p.description || '';

    // Extract purely filename, assuming format starts with './images/'
    let fileName = '';
    if (p.imagePath) {
        fileName = p.imagePath.replace('./images/', '');
    }
    fImg.value = fileName;

    if (fileName) {
        preview.innerHTML = `<img src="./images/${fileName}" onerror="this.style.display='none'">`;
    } else {
        preview.innerHTML = '';
    }

    modal.classList.add('active');
};

window.deleteProduct = (index) => {
    // Basic array removal via splice
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        products.splice(index, 1);
        renderTable();
    }
};

// Export functionality to re-generate the entire catalog.js file
if (btnExport) {
    btnExport.addEventListener('click', () => {
        // Construct the formatted string.
        let jsContent = "const catalog = [\n";

        products.forEach((p, index) => {
            const isLast = index === products.length - 1;
            jsContent += `  ${JSON.stringify(p)}`;
            jsContent += isLast ? "\n" : ",\n";
        });

        jsContent += "];\n";

        const blob = new Blob([jsContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Forces browser to download the custom generated blob
        a.download = 'catalog.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}
