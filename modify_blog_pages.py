import re

def process_file(filename, title, new_main_content):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update Title
    content = re.sub(r'<title>.*?</title>', f'<title>{title} | ALFA</title>', content)

    # Remove splash screen
    content = re.sub(r'<!-- Cinematic Splash Screen -->.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    
    # Remove shooting stars
    content = re.sub(r'<!-- Shooting Stars Background.*?</div>\s*</div>', '', content, flags=re.DOTALL)

    # Replace everything between </header> and <footer class="footer"> with new main content
    content = re.sub(r'</header>.*?<footer class="footer">', f'</header>\n{new_main_content}\n<footer class="footer">', content, flags=re.DOTALL)

    # Add marked.js to article.html
    if filename == 'article.html':
        content = content.replace('</body>', '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>\n<script src="article.js"></script>\n</body>')
    elif filename == 'blog.html':
        content = content.replace('</body>', '<script src="blog.js"></script>\n</body>')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

blog_main = """
        <main class="page-content" style="padding-top: 120px; min-height: 70vh;">
            <div class="container">
                <div class="section-header" data-aos="fade-up">
                    <h2>Blog & <span class="gold-text">Noticias</span></h2>
                    <p>Las últimas novedades, guías y consejos sobre Car Audio en Guadalajara</p>
                </div>
                
                <div id="blog-grid" class="blog-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; margin-top: 40px;">
                    <div style="text-align: center; grid-column: 1 / -1; color: var(--text-secondary);">Cargando artículos...</div>
                </div>
            </div>
        </main>
"""

article_main = """
        <main class="page-content" style="padding-top: 120px; min-height: 70vh;">
            <div class="container" style="max-width: 800px; margin: 0 auto;">
                <div id="article-loading" style="text-align: center; color: var(--text-secondary); padding: 50px 0;">Cargando artículo...</div>
                
                <article id="article-content" style="display: none; background: rgba(10, 10, 10, 0.8); border: 1px solid var(--glass-border); border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <a href="blog.html" class="btn-gold" style="display: inline-block; margin-bottom: 20px; font-size: 0.9rem;"><i class="fa-solid fa-arrow-left"></i> Volver al Blog</a>
                    
                    <div id="article-meta" style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.9rem; color: var(--gold-primary); font-weight: bold;">
                        <span id="article-category"></span> • <span id="article-date"></span> • <i class="fa-solid fa-clock"></i> <span id="article-readtime"></span> min
                    </div>
                    
                    <h1 id="article-title" style="font-size: 2.5rem; margin-bottom: 20px; line-height: 1.2;"></h1>
                    
                    <img id="article-image" src="" alt="Featured" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 30px; display: none;">
                    
                    <div id="article-body" class="markdown-body" style="line-height: 1.8; font-size: 1.1rem; color: var(--text-secondary);">
                    </div>
                </article>
            </div>
        </main>
"""

process_file('blog.html', 'Blog & Noticias', blog_main)
process_file('article.html', 'Artículo', article_main)

