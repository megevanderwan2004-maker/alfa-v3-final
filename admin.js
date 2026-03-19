import catalog from './catalog.js';

let products = [...catalog];
// Initialize featuredSkus from local storage or fallback if not in catalog.js
// Note: We'll stop using localStorage soon, but for now we keep it or use a default.
window.featuredSkus = ["#KALAL838512", "#KBOALCXPRO80", "#KFOLEALM1H13"];

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderTable();
    renderPromotions();
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
        alert('Cambios guardados en memoria.\n¡IMPORTANTE: Haz clic en "SAUVEGARDER LES MODIFICATIONS" para grabar permanentemente!');
    });
}

// Build list for the UI
function renderTable(searchTerm = "") {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Create an array mapping to keep original index
    let filteredItems = products.map((p, index) => ({ p, index }));

    if (searchTerm) {
        filteredItems = filteredItems.filter(item => {
            const p = item.p;
            return (p.nombre && p.nombre.toLowerCase().includes(searchTerm)) ||
                (p.sku && p.sku.toLowerCase().includes(searchTerm)) ||
                (p.categoria && p.categoria.toLowerCase().includes(searchTerm));
        });
    }

    if (filteredItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay productos.</td></tr>';
        return;
    }

    filteredItems.forEach((item) => {
        const p = item.p;
        const index = item.index;

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

// Search field initialization
const adminSearch = document.getElementById('admin-search');
if (adminSearch) {
    adminSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        renderTable(term);
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

if (btnExport) {
    btnExport.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:3001/save-catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catalog: products })
            });
            const result = await response.json();
            if (result.success) {
                alert(`✅ ${result.count} produits sauvegardés dans catalog.js`);
            } else {
                alert('❌ Erreur : ' + result.error);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('❌ Erreur de comunicación con el servidor');
        }
    });
}

/**
 * NEW: Tab Switcher Logic
 */
function initTabs() {
    const tabs = document.querySelectorAll('.nav-link-tab');
    const contents = document.querySelectorAll('.tab-content');
    const adminTitle = document.getElementById('admin-title');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.getAttribute('data-target');

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(c => c.style.display = 'none');
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.style.display = 'block';

            if (adminTitle) {
                adminTitle.textContent = target === 'products-panel' ? 'Gestión de Catálogo' : 'Promoción del Mes';
            }

            // Hide/Show "Add Product" button
            if (btnAdd) btnAdd.style.display = target === 'products-panel' ? 'inline-flex' : 'none';
        });
    });
}

/**
 * NEW: Promotions Management
 */
function renderPromotions() {
    const container = document.getElementById('promotions-slots');
    if (!container) return;

    container.innerHTML = '';
    const currentFeatured = window.featuredSkus || [];

    for (let i = 0; i < 3; i++) {
        const sku = currentFeatured[i];
        const product = products.find(p => String(p.sku).trim() === String(sku).trim());

        const slot = document.createElement('div');
        slot.className = 'promo-slot';
        
        if (product) {
            slot.innerHTML = `
                <h4>Slot ${i + 1}</h4>
                <div class="promo-preview">
                    <img src="${product.imagePath}" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'">
                </div>
                <div class="promo-info">
                    <span class="promo-name">${product.nombre}</span>
                    <span class="promo-sku">SKU: ${product.sku}</span>
                </div>
                <div class="promo-actions">
                    <button class="btn-promo-assign" onclick="openSelectModal(${i})">Cambiar</button>
                    <button class="btn-promo-clear" onclick="clearSlot(${i})">Eliminar</button>
                </div>
            `;
        } else {
            slot.innerHTML = `
                <h4>Slot ${i + 1}</h4>
                <div class="promo-preview">
                    <span class="empty-slot-msg">Vacio</span>
                </div>
                <div class="promo-info">
                    <span class="promo-name">- Ninguno -</span>
                </div>
                <div class="promo-actions">
                    <button class="btn-promo-assign" onclick="openSelectModal(${i})">Asignar Producto</button>
                </div>
            `;
        }
        container.appendChild(slot);
    }
}

let activeSlotIndex = null;
const selectModal = document.getElementById('product-select-modal');
const selectSearch = document.getElementById('select-search');
const selectTableBody = document.getElementById('select-table-body');
const closeSelectModal = document.querySelector('.close-select-modal');

window.openSelectModal = (index) => {
    activeSlotIndex = index;
    if (selectModal) selectModal.classList.add('active');
    renderSelectTable();
};

window.clearSlot = (index) => {
    if (window.featuredSkus) {
        window.featuredSkus[index] = null;
        renderPromotions();
    }
};

if (closeSelectModal) {
    closeSelectModal.onclick = () => selectModal.classList.remove('active');
}

if (selectSearch) {
    selectSearch.oninput = (e) => renderSelectTable(e.target.value.toLowerCase().trim());
}

function renderSelectTable(term = "") {
    if (!selectTableBody) return;
    selectTableBody.innerHTML = '';

    const filtered = products.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        (p.sku && p.sku.toLowerCase().includes(term))
    );

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.imagePath}" class="thumb" onerror="this.style.display='none'"></td>
            <td>${p.sku}</td>
            <td>${p.nombre}</td>
            <td><button class="btn-gold" style="padding: 5px 10px; font-size: 0.8rem;" onclick="assignProductToSlot('${p.sku}')">Seleccionar</button></td>
        `;
        selectTableBody.appendChild(tr);
    });
}

window.assignProductToSlot = (sku) => {
    if (activeSlotIndex !== null && window.featuredSkus) {
        window.featuredSkus[activeSlotIndex] = sku;
        renderPromotions();
        selectModal.classList.remove('active');
    }
};
