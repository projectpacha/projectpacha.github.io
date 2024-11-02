const themeToggle = document.querySelector('.theme-toggle');
const menuIcon = document.querySelector('.menu-icon');
const mobileMenu = document.querySelector('.mobile-menu');
const body = document.body;
const searchInput = document.getElementById("searchInput");
const manglishToggle = document.getElementById('manglish-toggle');

async function countEntries() {
    try {
        const response = await fetch('data.xml'); 
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');
        const entries = xml.getElementsByTagName('entry');

        document.getElementById('entry-count').textContent = `നിലവിലെ വാക്കുകളുടെ എണ്ണം: ${entries.length}`;
    } catch (error) {
        console.error('Error counting entries:', error);
    }
}

document.addEventListener("DOMContentLoaded", countEntries);

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        updateThemeIcon(savedTheme);
    }
});

function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark-mode' ? 'dark_mode' : 'light_mode';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
    const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

menuIcon.addEventListener('click', () => {
    mobileMenu.classList.toggle('visible');
    body.classList.toggle('menu-open', mobileMenu.classList.contains('visible'));
});
