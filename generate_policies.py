import os
import re

policies = {
    "aviso-de-privacidad": {
        "title": "Aviso de Privacidad",
        "url": "https://alfaperformance.mx/content/2-aviso-de-privacidad"
    },
    "terminos-y-condiciones": {
        "title": "Términos y Condiciones de uso",
        "url": "https://alfaperformance.mx/content/3-terminos-condiciones"
    },
    "politica-pago": {
        "title": "Política de pago",
        "url": "https://alfaperformance.mx/content/5-politica-pago"
    },
    "politica-devoluciones": {
        "title": "Política de devoluciones",
        "url": "https://alfaperformance.mx/content/7-politica-devoluciones"
    },
    "politica-garantias": {
        "title": "Política de garantías",
        "url": "https://alfaperformance.mx/content/8-politica-garantias"
    },
    "envios-y-devoluciones": {
        "title": "Envíos y devoluciones",
        "url": "https://alfaperformance.mx/content/1-envios-devoluciones"
    }
}

template = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="description" content="{title} de ALFA Car Audio">
    <title>{title} - ALFA Car Audio</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;800&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=9">
    <meta name="theme-color" content="#000000">
    <style>
        .policy-container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 4rem 2rem;
            background-color: var(--bg-dark);
            color: var(--text-light);
        }}
        .policy-content {{
            background-color: var(--card-bg);
            padding: 3rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }}
        .policy-content h1 {{
            color: var(--primary-color);
            margin-bottom: 2rem;
            font-family: 'Oswald', sans-serif;
            text-transform: uppercase;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 1rem;
        }}
        .policy-content h2, .policy-content h3 {{
            color: var(--text-light);
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-family: 'Montserrat', sans-serif;
        }}
        .policy-content p, .policy-content li {{
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
            margin-bottom: 1rem;
            font-family: 'Montserrat', sans-serif;
        }}
        .policy-content ul {{
            margin-left: 2rem;
            margin-bottom: 1rem;
        }}
    </style>
    <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
    <!-- HEADER WILL BE INJECTED LOGICALLY -->
    <header class="navbar" id="navbar">
        <div class="container nav-content">
            <div class="nav-left">
                <div class="header-search">
                    <i class="fa-solid fa-search search-icon"></i>
                    <input type="text" id="header-search-input" class="search-input" placeholder="Buscar por código, nombre...">
                    <div id="search-suggestions" class="search-suggestions"></div>
                </div>
            </div>
            <div class="nav-center">
                <a href="index.html" class="logo">
                     <img src="PHOTO-2026-02-20-13-37-44.jpg" alt="ALFA Audio Logo" class="logo-img">
                </a>
                <ul class="nav-links categories-center">
                    <li class="nav-item"><a href="iluminacion-led-autos-guadalajara.html" class="nav-link" data-cat="iluminacion">ILUMINACIÓN <i class="fa-solid fa-chevron-down nav-chevron"></i></a></li>
                    <li class="nav-item"><a href="sistemas-audio-premium.html" class="nav-link" data-cat="audio">AUDIO <i class="fa-solid fa-chevron-down nav-chevron"></i></a></li>
                    <li class="nav-item"><a href="seguridad-vehicular.html" class="nav-link" data-cat="seguridad">SEGURIDAD <i class="fa-solid fa-chevron-down nav-chevron"></i></a></li>
                    <li class="nav-item"><a href="sobre-nosotros.html" class="nav-link">NOSOTROS</a></li>
                    <li class="nav-item"><a href="blog.html" class="nav-link">BLOG</a></li>
                </ul>
            </div>
            <div class="nav-right">
                <ul class="nav-links meta-right">
                    <li class="nav-item"><a href="sobre-nosotros.html" class="nav-link">NOSOTROS</a></li>
                    <li class="nav-item"><a href="blog.html" class="nav-link">BLOG</a></li>
                </ul>
                <a href="login.html" class="btn-secret-lock" title="Panel Admin" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-lock"></i>
                </a>
                <div class="mobile-menu-btn" id="mobile-menu-btn" style="z-index: 9999; pointer-events: auto; position: relative;">
                    <i class="fa-solid fa-bars"></i>
                </div>
            </div>
        </div>
    </header>

    <main class="main-content">
        <div class="policy-container">
            <div class="policy-content" id="policy-body">
                <!-- CONTENT GENERATED BY JAVASCRIPT (FETCH FROM ORIGINAL IFRAME BUT AS HTML) -->
                <h1>{title}</h1>
                <p>Cargando contenido desde {url}...</p>
                <script>
                    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('{url}'))
                    .then(response => {{
                        if (response.ok) return response.json();
                        throw new Error('Network response was not ok.');
                    }})
                    .then(data => {{
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(data.contents, 'text/html');
                        const contentElement = doc.querySelector('#content.page-cms');
                        if (contentElement) {{
                            // Eliminar el primer h1 o h2 si ya lo tenemos arriba
                            const titleElement = contentElement.querySelector('h1, h2');
                            if(titleElement) titleElement.remove();
                            // Clean up the content specifically for alfa styles
                            document.getElementById('policy-body').innerHTML = '<h1>{title}</h1>' + contentElement.innerHTML;
                        }} else {{
                            document.getElementById('policy-body').innerHTML = '<h1>{title}</h1><p>No se pudo cargar el contenido. Por favor, visita: <a href="{url}" target="_blank" style="color:var(--primary-color)">{url}</a></p>';
                        }}
                    }})
                    .catch(error => {{
                        console.error('Error fetching policy:', error);
                        document.getElementById('policy-body').innerHTML = '<h1>{title}</h1><p>Error al cargar el contenido. Por favor, visita: <a href="{url}" target="_blank" style="color:var(--primary-color)">{url}</a></p>';
                    }});
                </script>
            </div>
        </div>
    </main>

    <footer class="footer" id="contact">
        <div class="container footer-content">
            <div class="footer-grid">
                 <div class="footer-brand">
                    <img src="PHOTO-2026-02-20-13-37-44.jpg" alt="ALFA" class="logo-img" style="margin-bottom: 20px; max-height: 40px; mix-blend-mode: screen;">
                    <p>Domina la ruta con ALFA.</p>
                    <div class="footer-social" style="margin-top: 20px;">
                        <a href="https://wa.me/523315686159" class="social-link" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="https://www.instagram.com/alfacaraudiomx?utm_source=qr" class="social-link" target="_blank"><i class="fa-brands fa-instagram"></i></a>
                        <a href="https://www.facebook.com/AlfaCarAudiomx" class="social-link" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
                    </div>
                </div>
                <div class="footer-info">
                    <h4>CONTACTO</h4>
                    <p><i class="fa-solid fa-phone"></i> +52 33 1568 6159</p>
                    <p><i class="fa-solid fa-location-dot"></i> Calz. del Ejército 619, Del Periodista, 44430 Guadalajara, Jal.</p>
                </div>
                <div class="footer-hours">
                    <h4>HORARIOS</h4>
                    <p>Lunes - Viernes: 9:30 - 18:30</p>
                    <p>Sábado: 9:30 - 14:30</p>
                    <p>Domingo: Cerrado</p>
                </div>
                <!-- POLICIES SECTION -->
                <div class="footer-policies">
                    <h4>POLÍTICAS</h4>
                    <ul>
                        <li><a href="aviso-de-privacidad.html">Aviso de Privacidad</a></li>
                        <li><a href="terminos-y-condiciones.html">Términos y Condiciones</a></li>
                        <li><a href="politica-pago.html">Política de Pago</a></li>
                        <li><a href="politica-devoluciones.html">Política de Devoluciones</a></li>
                        <li><a href="politica-garantias.html">Política de Garantías</a></li>
                        <li><a href="envios-y-devoluciones.html">Envíos y Devoluciones</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 ALFA Car Audio. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="catalog.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="script.js?v=11"></script>
</body>
</html>
"""

for filename, data in policies.items():
    content = template.format(title=data["title"], url=data["url"])
    with open(f"{filename}.html", "w") as f:
        f.write(content)
    print(f"Generated {filename}.html")

