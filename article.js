document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const from = urlParams.get('from');

    // Handle back button target
    const backBtn = document.querySelector('.btn-gold[href="blog.html"]');
    if (backBtn && from === 'home') {
        backBtn.href = 'index.html';
        backBtn.innerHTML = '<i class="fa-solid fa-house"></i> Volver al Inicio';
        backBtn.style.color = '#fff';
        backBtn.style.borderColor = 'rgba(255,255,255,0.3)';
    }
    
    if (!slug) {
        document.getElementById('article-loading').textContent = 'Artículo no encontrado.';
        return;
    }

    try {
        // Fetch article by slug
        const { data, error } = await _supabase
            .from('blog_articles')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            throw error || new Error('No data');
        }

        // Check if published
        if (!data.published) {
            document.getElementById('article-loading').innerHTML = 'Este artículo no está disponible actualmente. <br><br> <a href="blog.html" class="btn-gold" style="display:inline-block;">Volver al Blog</a>';
            return;
        }

        // Update view count (fire and forget)
        _supabase.rpc('increment_page_view', { page_slug: slug, row_id: data.id }).then(() => {
           // If we don't have rpc, we can try direct update (might need RLS changes in real world)
           _supabase.from('blog_articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then(()=>{});
        });

        // Set Meta tags and title
        document.title = `${data.title} | ALFA Car Audio`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && data.meta_description) {
            metaDesc.setAttribute('content', data.meta_description);
        }

        // Populate Article UI
        document.getElementById('article-loading').style.display = 'none';
        const contentContainer = document.getElementById('article-content');
        contentContainer.style.display = 'block';

        document.getElementById('article-category').textContent = data.category;
        document.getElementById('article-date').textContent = new Date(data.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('article-readtime').textContent = data.reading_time || 5;
        document.getElementById('article-title').textContent = data.title;
        
        const featuredImg = document.getElementById('article-image');
        if (data.featured_image) {
            featuredImg.src = data.featured_image;
            featuredImg.style.display = 'block';
            featuredImg.alt = data.title;
        }

        // Render Markdown content
        const bodyContent = document.getElementById('article-body');
        if (typeof marked !== 'undefined') {
            bodyContent.innerHTML = marked.parse(data.content || '');
        } else {
            bodyContent.innerHTML = '<p style="color:red;">Error: the markdown parser was not loaded.</p>';
        }

    } catch (err) {
        console.error('Error fetching article:', err);
        document.getElementById('article-loading').innerHTML = 'El artículo que buscas no existe o ha sido movido. <br><br> <a href="blog.html" class="btn-gold" style="display:inline-block;">Volver al Blog</a>';
    }
});
