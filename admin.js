// Supabase Configuration
const SUPABASE_URL = 'https://egfurglzwuthkixwrvou.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZnVyZ2x6d3V0aGtpeHdydm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDY4OTEsImV4cCI6MjA4OTUyMjg5MX0.pjsQlCYIpx03CbkYcrO1I33zeyzEXCbrr8xMXEW3WPc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let products = [];
let promoSkus = ["", "", ""]; // Managed via _CONFIG_PROMOS_ row

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    await fetchCatalog();
    initTabs();
    initImageUpload();
});

async function fetchCatalog() {
    const { data, error } = await _supabase
        .from('catalog')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) {
        console.error("Error:", error);
    } else {
        // Filter out system config rows from the main product list
        products = data.filter(p => !p.sku.startsWith('_CONFIG_'));
        
        // Find Promo Config
        const config = data.find(p => p.sku === '_CONFIG_PROMOS_');
        if (config) {
            promoSkus = (config.descripcion || "").split(',').map(s => s.trim());
            // Ensure exactly 3 slots
            while(promoSkus.length < 3) promoSkus.push("");
            promoSkus = promoSkus.slice(0, 3);
        }

        renderTable();
        renderPromotions();
    }
}

const tableBody = document.getElementById('table-body');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');
const btnAdd = document.getElementById('btn-add-product');
const btnLogout = document.getElementById('btn-logout');
const fImg = document.getElementById('prod-image');
const preview = document.getElementById('img-preview');

if (btnLogout) {
    btnLogout.onclick = async () => {
        await _supabase.auth.signOut();
        window.location.href = 'login.html';
    };
}

if (btnAdd) {
    btnAdd.onclick = () => {
        form.reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('modal-title').textContent = 'Agregar Producto';
        preview.innerHTML = '';
        modal.classList.add('active');
        document.getElementById('prod-category').value = "Nuevos Productos";
    };
}

const closeModalBtn = document.querySelector('.close-modal');
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('active');

window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };

if (fImg) {
    fImg.oninput = () => {
        const val = fImg.value.trim();
        preview.innerHTML = val ? `<img src="${val}" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'">` : '';
    };
}

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        const sku = document.getElementById('prod-sku').value.trim();
        const saveBtn = form.querySelector('button[type="submit"]');
        saveBtn.disabled = true; saveBtn.textContent = 'Guardando...';

        const productData = {
            sku: sku,
            nombre: document.getElementById('prod-name').value.trim(),
            precio: parseFloat(document.getElementById('prod-price').value),
            categoria: document.getElementById('prod-category').value.trim(),
            descripcion: document.getElementById('prod-desc').value.trim() || '',
            image_url: fImg.value.trim()
        };

        const { error } = await _supabase.from('catalog').upsert(productData, { onConflict: 'sku' });
        if (error) alert('Error: ' + error.message);
        else { await fetchCatalog(); modal.classList.remove('active'); }
        saveBtn.disabled = false; saveBtn.textContent = 'GUARDAR CAMBIOS';
    };
}

// =========================================
// UNIVERSE MAPPING (Same as script.js)
// =========================================
const categoryMap = {
    iluminacion: ["LED", "ILUMINACION", "ILUMINACIÓN", "FOCO", "LUPA", "XENON", "FARO", "HALOGENO", "UNIDADES", "BARRA", "BALASTRA", "KIT"],
    seguridad: ["ALARMA", "SEGURIDAD", "SENSOR", "CAMARA", "GPS", "CERRADURA", "RADAR", "RELAY", "SWITCH"],
    audio: ["AUDIO", "AMPLIFICADOR", "SUBWOOFER", "BOCINA", "ESTEREO", "TWEETER", "PROCESADOR", "COMPLEMENTO"]
};

function normalizeText(text) {
    if (!text) return "";
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getUniverseForCategory(catName) {
    const uCat = normalizeText(catName);
    for (const [main, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(kw => uCat.includes(normalizeText(kw)))) return main;
    }
    return "otros";
}

let activeUniverse = "all";
const catalogContainer = document.getElementById('catalog-container');
const universeTabs = document.getElementById('universe-tabs');

if (universeTabs) {
    universeTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            universeTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeUniverse = btn.getAttribute('data-universe');
            renderTable(document.getElementById('admin-search')?.value.toLowerCase().trim() || "");
        };
    });
}

function renderTable(searchTerm = "") {
    if (!catalogContainer) return;
    catalogContainer.innerHTML = '';

    // 1. Filter products
    let filtered = products.map((p, index) => ({ p, index }));
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.p.nombre.toLowerCase().includes(searchTerm) || 
            item.p.sku.toLowerCase().includes(searchTerm) || 
            item.p.categoria.toLowerCase().includes(searchTerm)
        );
    }

    // 2. Group by Universe
    const groups = { iluminacion: {}, audio: {}, seguridad: {}, otros: {} };
    filtered.forEach(item => {
        const universe = getUniverseForCategory(item.p.categoria);
        const cat = item.p.categoria || "Sin Categoría";
        if (!groups[universe][cat]) groups[universe][cat] = [];
        groups[universe][cat].push(item);
    });

    // 3. Render
    const universesToRender = activeUniverse === "all" 
        ? ["iluminacion", "audio", "seguridad", "otros"] 
        : [activeUniverse];

    let totalRendered = 0;

    universesToRender.forEach(univKey => {
        const cats = groups[univKey];
        const catKeys = Object.keys(cats).sort();
        if (catKeys.length === 0) return;

        const univSection = document.createElement('div');
        univSection.className = 'universe-section';
        
        const univTitle = univKey.charAt(0).toUpperCase() + univKey.slice(1);
        const count = Object.values(cats).reduce((acc, curr) => acc + curr.length, 0);
        totalRendered += count;

        univSection.innerHTML = `
            <div class="universe-header" onclick="toggleSection('${univKey}')">
                <h2><i class="fa-solid fa-${getIconForUniv(univKey)}"></i> ${univTitle}</h2>
                <span class="count">${count} productos</span>
            </div>
            <div id="content-${univKey}" class="universe-content">
                <!-- Sub-categories go here -->
            </div>
        `;

        const contentDiv = univSection.querySelector('.universe-content');

        catKeys.forEach(catName => {
            const catGroup = document.createElement('div');
            catGroup.className = 'category-group';
            catGroup.innerHTML = `<h3 class="category-title"><i class="fa-solid fa-folder-open"></i> ${catName.toUpperCase()}</h3>`;
            
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';
            
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>SKU</th>
                        <th>Nombre</th>
                        <th>Precio ($)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tbody-${univKey}-${normalizeText(catName)}"></tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            cats[catName].forEach(item => {
                const p = item.p;
                const imgThumb = p.image_url ? `<img src="${p.image_url}" class="thumb" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'">` : '<div class="no-thumb">Sin Img</div>';
                const isFeatured = promoSkus.includes(p.sku);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${imgThumb}</td>
                    <td>${p.sku || '-'}</td>
                    <td><strong>${p.nombre || '-'}</strong> ${isFeatured ? '⭐' : ''}</td>
                    <td>$${p.precio || '0'}</td>
                    <td>
                        <button class="btn-action edit" onclick="editProduct(${item.index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action delete" onclick="deleteProduct(${item.index})"><i class="fa-solid fa-trash"></i></button>
                    </td>`;
                tbody.appendChild(tr);
            });
            
            tableContainer.appendChild(table);
            catGroup.appendChild(tableContainer);
            contentDiv.appendChild(catGroup);
        });

        catalogContainer.appendChild(univSection);
    });

    if (totalRendered === 0) {
        catalogContainer.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--text-secondary);">No se encontraron productos en esta sección.</div>';
    }
}

function getIconForUniv(univ) {
    if (univ === 'iluminacion') return 'lightbulb';
    if (univ === 'audio') return 'volume-high';
    if (univ === 'seguridad') return 'shield-halved';
    return 'layer-group';
}

window.toggleSection = (id) => {
    const el = document.getElementById(`content-${id}`);
    if (el) el.classList.toggle('hidden');
};

const adminSearch = document.getElementById('admin-search');
if (adminSearch) adminSearch.oninput = (e) => renderTable(e.target.value.toLowerCase().trim());

window.editProduct = (index) => {
    const p = products[index];
    document.getElementById('modal-title').textContent = 'Editar Producto';
    document.getElementById('prod-id').value = index;
    document.getElementById('prod-name').value = p.nombre || '';
    document.getElementById('prod-sku').value = p.sku || '';
    document.getElementById('prod-price').value = p.precio || '0';
    document.getElementById('prod-category').value = p.categoria || '';
    document.getElementById('prod-desc').value = p.descripcion || '';
    fImg.value = p.image_url || '';
    preview.innerHTML = p.image_url ? `<img src="${p.image_url}" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'">` : '';
    modal.classList.add('active');
};

window.deleteProduct = async (index) => {
    const p = products[index];
    if (!confirm(`¿Eliminar ${p.sku}?`)) return;
    const { error } = await _supabase.from('catalog').delete().eq('sku', p.sku);
    if (error) alert('Error: ' + error.message);
    else await fetchCatalog();
};

function initTabs() {
    const tabs = document.querySelectorAll('.nav-link-tab');
    const contents = document.querySelectorAll('.tab-content');
    const adminTitle = document.getElementById('admin-title');
    tabs.forEach(tab => {
        tab.onclick = (e) => {
            e.preventDefault();
            const target = tab.getAttribute('data-target');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.style.display = 'none');
            document.getElementById(target).style.display = 'block';
            if (adminTitle) adminTitle.textContent = target === 'products-panel' ? 'Gestión de Catálogo' : 'Promoción del Mes';
            if (btnAdd) btnAdd.style.display = target === 'products-panel' ? 'inline-flex' : 'none';
        }
    });
}

function renderPromotions() {
    const container = document.getElementById('promotions-slots');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const sku = promoSkus[i];
        const p = products.find(prod => prod.sku === sku);
        const slot = document.createElement('div');
        slot.className = 'promo-slot';
        if (p) {
            slot.innerHTML = `
                <h4>Slot ${i + 1}</h4>
                <div class="promo-preview"><img src="${p.image_url}" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'"></div>
                <div class="promo-info"><span class="promo-name">${p.nombre}</span><span class="promo-sku">SKU: ${p.sku}</span></div>
                <div class="promo-actions">
                    <button class="btn-promo-action btn-promo-assign" onclick="openSelectModal(${i})">Cambiar</button>
                    <button class="btn-promo-action btn-promo-clear" onclick="clearSlotPromocion(${i})">Quitar</button>
                </div>`;
        } else {
            slot.innerHTML = `
                <h4>Slot ${i + 1}</h4>
                <div class="promo-preview"><span class="empty-slot-msg">Sin asignar</span></div>
                <div class="promo-info"><span class="promo-name">- Vacío -</span></div>
                <div class="promo-actions"><button class="btn-promo-action btn-promo-assign" onclick="openSelectModal(${i})">Asignar Producto</button></div>`;
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
    selectModal.classList.add('active');
    renderSelectTable();
};

window.clearSlotPromocion = async (index) => {
    promoSkus[index] = "";
    await savePromoConfig();
};

window.assignProductToSlot = async (sku) => {
    if (activeSlotIndex !== null) {
        promoSkus[activeSlotIndex] = sku;
        await savePromoConfig();
        selectModal.classList.remove('active');
    }
};

async function savePromoConfig() {
    const csv = promoSkus.join(',');
    const { error } = await _supabase
        .from('catalog')
        .update({ descripcion: csv })
        .eq('sku', '_CONFIG_PROMOS_');
    
    if (error) alert("Error actualizando promociones: " + error.message);
    else await fetchCatalog();
}

function renderSelectTable(term = "") {
    if (!selectTableBody) return;
    selectTableBody.innerHTML = '';
    const filtered = products.filter(p => (p.nombre && p.nombre.toLowerCase().includes(term)) || (p.sku && p.sku.toLowerCase().includes(term))).slice(0, 50);
    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image_url}" class="thumb" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'"></td>
            <td>${p.sku}</td>
            <td>${p.nombre}</td>
            <td><button class="btn-gold" style="padding: 5px 10px; font-size: 0.8rem;" onclick="assignProductToSlot('${p.sku}')">Seleccionar</button></td>`;
        selectTableBody.appendChild(tr);
    });
}

if (closeSelectModal) closeSelectModal.onclick = () => selectModal.classList.remove('active');
if (selectSearch) selectSearch.oninput = (e) => renderSelectTable(e.target.value.toLowerCase().trim());

function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const btnImport = document.getElementById('btn-import-drive');
    if (!uploadArea || !fileInput) return;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => { if (e.target.files.length > 0) handleFileUpload(e.target.files[0]); };
    if (btnImport) {
        btnImport.onclick = async () => {
            const url = document.getElementById('drive-link').value.trim();
            if (!url) return;
            btnImport.disabled = true; btnImport.textContent = "...";
            try {
                let directUrl = url;
                if (url.includes('drive.google.com')) {
                    const id = url.match(/\/d\/(.+?)\//);
                    if (id) directUrl = `https://lh3.googleusercontent.com/d/${id[1]}`;
                }
                const response = await fetch(directUrl);
                const blob = await response.blob();
                const file = new File([blob], `drive-${Date.now()}.jpg`, { type: blob.type });
                await handleFileUpload(file);
                document.getElementById('drive-link').value = "";
            } catch (err) { alert("Error importando imagen."); }
            btnImport.disabled = false; btnImport.textContent = "IMPORTAR";
        };
    }
}

async function handleFileUpload(file) {
    const sku = document.getElementById('prod-sku').value.trim();
    if (!sku) { alert("Ingresa el SKU primero."); return; }
    const fileName = `${sku.replace('#', '')}-${Date.now()}.jpg`;
    const { data, error } = await _supabase.storage.from('product-images').upload(fileName, file);
    if (error) alert("Error subiendo imagen: " + error.message);
    else {
        const { data: { publicUrl } } = _supabase.storage.from('product-images').getPublicUrl(fileName);
        fImg.value = publicUrl;
        preview.innerHTML = `<img src="${publicUrl}">`;
    }
}
