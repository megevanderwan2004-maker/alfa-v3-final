document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    try {
        const { data, error } = await _supabase
            .from('blog_articles')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">Pronto publicaremos nuevos artículos. ¡Mantente atento!</div>';
            return;
        }

        grid.innerHTML = '';
        data.forEach((article, index) => {
            const dateStr = new Date(article.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
            
            const thumbUrl = article.preview_image || article.featured_image;
            const imageHtml = thumbUrl ? `<img src="${thumbUrl}" alt="${article.title}" style="width: 100%; height: 200px; object-fit: cover; border-bottom: 1px solid var(--glass-border);">` : '<div style="width:100%; height:200px; background:linear-gradient(45deg, #111, #222); border-bottom:1px solid var(--glass-border);"></div>';

            const card = document.createElement('div');
            card.className = 'blog-card';
            card.style.cssText = `
                background: rgba(10, 10, 10, 0.8);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: transform 0.3s ease, border-color 0.3s ease;
                cursor: pointer;
            `;
            // Add hover effect via JS listener or inline style replacement (we'll do JS redirect instead)
            card.onclick = () => {
                window.location.href = `article.html?slug=${article.slug}`;
            };
            
            card.onmouseenter = () => {
                card.style.transform = 'translateY(-5px)';
                card.style.borderColor = 'var(--gold-primary)';
            };
            card.onmouseleave = () => {
                card.style.transform = 'translateY(0)';
                card.style.borderColor = 'var(--glass-border)';
            };

            const excerpt = article.excerpt || article.content.substring(0, 100) + '...';

            card.innerHTML = `
                ${imageHtml}
                <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
                    <span style="color: var(--gold-primary); font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; display: block;">${article.category}</span>
                    <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 10px; line-height: 1.4;">${article.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; flex: 1;">${excerpt}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; font-size: 0.85rem; color: #888;">
                        <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                        <span><i class="fa-regular fa-clock"></i> ${article.reading_time || 5} min</span>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn-red" style="padding: 10px 20px; font-size: 0.9rem; width: 100%;">LEER MÁS</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching blog articles:', err);
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--red-sport);">Error al cargar los artículos. Por favor, intenta de nuevo.</div>';
    }
});
