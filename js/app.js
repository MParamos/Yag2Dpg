/**
 * @file app.js
 * @description Main application logic for the Yagce landing page.
 * Handles news fetching, safe rendering, and dynamic language switching.
 * @author Miguel Páramos
 */

import { currentLanguage, setCurrentLanguage, getTranslation } from './i18n.js';

/**
 * @type {Array<Object>}
 * @description Global registry storing the news items fetched from the JSON payload.
 */
let newsRegistry = [];

/* ==========================================================================
   RENDERING & CONTROLLERS
   ========================================================================== */

/**
 * Renders the news items into the DOM.
 * Utilizes a secure DOM injection method (textContent) to prevent XSS vulnerabilities.
 */
function renderNews() {
    const container = document.getElementById('contenedor-novedades');
    if (!container) return;
    
    container.innerHTML = ''; 

    newsRegistry.forEach(item => {
        // Fallback to Spanish if the current language translation is unavailable
        const newsText = item.texto[currentLanguage] || item.texto['es'];

        const card = document.createElement('article');
        card.className = "bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md transition-all hover:border-slate-500";
        
        // 1. Inject static HTML structure without dynamic variables
        card.innerHTML = `
            <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-700/50">
                <div class="flex items-center gap-3">
                    <span class="news-version px-2 py-1 bg-sky-500/20 text-sky-400 text-xs font-bold rounded"></span>
                    <span class="news-author text-slate-200 text-sm font-semibold"></span>
                </div>
                <span class="news-date text-emerald-400 text-xs font-bold tracking-wide"></span>
            </div>
            <p class="news-text text-sm text-slate-300 leading-relaxed"></p>
        `;

        // 2. Assign data safely via textContent to strictly parse as plain text
        card.querySelector('.news-version').textContent = item.version;
        card.querySelector('.news-author').textContent = item.autor;
        card.querySelector('.news-date').textContent = item.fecha;
        card.querySelector('.news-text').textContent = newsText;

        container.appendChild(card);
    });
}

/**
 * Fetches news data asynchronously from the JSON file.
 * Implements strict HTTP error handling for unfulfilled requests.
 */
function fetchNewsData() {
    fetch('data/news.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            newsRegistry = data;
            renderNews();
        })
        .catch(error => {
            console.error("Error loading news JSON file:", error.message);
        });
}

/**
 * Applies the selected language to the UI, updates route parameters, and re-renders text nodes.
 * @param {string} lang - The target language code ('es', 'en', 'fr').
 */
function applyLanguage(lang) {
    setCurrentLanguage(lang);
    
    // 1. Update visual flag indicators
    document.querySelectorAll('#langSelector .flag-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Update the landing URL history state silently
    window.history.replaceState(null, '', `?lang=${lang}`);

    // 3. Update bug report mailto link
    const mailLink = document.getElementById('enlace-bug');
    if (mailLink) {
        mailLink.href = `mailto:hola@mparamos.com?subject=${encodeURIComponent(getTranslation('bug_subject'))}`;
    }

    // 4. Append language parameter to the level editor and game-tester links
    const btnEditor = document.getElementById('btn-enlace-editor');
    if (btnEditor) {
        btnEditor.href = `level-editor/index.html?lang=${lang}`;
    }
    const btnJuego = document.getElementById('btn-enlace-juego');
    if (btnJuego) {
        btnJuego.href = `game-tester/index.html?lang=${lang}`;
    }

    // 5. Translate static DOM elements dynamically
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translatedText = getTranslation(key);
        
        if (translatedText.includes('<')) {
            el.innerHTML = translatedText;
        } else {
            el.textContent = translatedText;
        }
    });

    // 6. Re-render news if payload is already loaded
    if (newsRegistry.length > 0) {
        renderNews();
    }
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

window.addEventListener('DOMContentLoaded', () => {
    // Dynamically set current copyright year
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // Initialize language selector event listeners
    document.querySelectorAll('#langSelector .flag-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
    });

    // Determine target language from URL parameters or fallback to default ('es')
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    const validLanguages = ['es', 'en', 'fr'];
    
    applyLanguage(validLanguages.includes(langParam) ? langParam : 'es');

    // Trigger asynchronous data fetch
    fetchNewsData();
});