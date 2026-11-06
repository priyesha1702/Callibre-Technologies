import { getCommunityProjects } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(location.search).get('id');
    const root = document.getElementById('detail-content');
    const favoriteKey = 'projecthub_favorites_v1';
    let project = ProjectHub.all().find(item => item.id === id);

    if (!project) {
        try {
            project = (await getCommunityProjects()).find(item => item.id === id);
        } catch (error) {
            root.innerHTML = `<a class="back-link" href="projects.html">← Back to all projects</a><div class="empty-state"><h2>Project details unavailable</h2><p>${ProjectHub.escape(error.message)}</p><a class="btn primary" href="projects.html">Browse projects</a></div>`;
            return;
        }
    }

    if (!project) {
        root.innerHTML = '<a class="back-link" href="projects.html">← Back to all projects</a><div class="empty-state"><h2>Project not found</h2><a class="btn primary" href="projects.html">Browse projects</a></div>';
        return;
    }

    document.title = `${project.title} | ProjectHub`;
    let saved = [];
    try {
        saved = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
    } catch {}

    root.innerHTML = `<a class="back-link" href="projects.html">← Back to all projects</a><section class="detail-hero"><span class="eyebrow">${ProjectHub.escape(project.type || 'COMMUNITY PROJECT')} · ${ProjectHub.escape(project.status.toUpperCase())}</span><h1>${ProjectHub.escape(project.title)}</h1><p>${ProjectHub.escape(project.desc)}</p><div class="detail-hero-actions"><button class="btn light" id="save-detail">${saved.includes(project.id) ? '♥ Saved' : '♡ Save project'}</button><button class="btn outline-light" id="share-detail">Share project ↗</button></div></section><div class="detail-columns"><section class="detail-panel"><h2>Project modules</h2><div class="detail-list">${project.modules.map(item => `<span class="detail-tag">${ProjectHub.escape(item)}</span>`).join('')}</div></section><section class="detail-panel"><h2>Who uses it?</h2><div class="detail-list">${project.roles.map(item => `<span class="detail-tag">${ProjectHub.escape(item)}</span>`).join('')}</div><div class="detail-meta" style="margin-top:25px"><div><small>Project status</small><b>${ProjectHub.escape(project.status)}</b></div><div><small>Number of modules</small><b>${project.modules.length}</b></div><div><small>User roles</small><b>${project.roles.length}</b></div></div></section></div><section class="detail-panel related-panel"><h2>Ready to create something?</h2><p>Use this as inspiration for your own project submission.</p><a class="btn primary" href="enroll.html">Submit your own idea ↗</a></section>`;

    document.getElementById('save-detail').addEventListener('click', event => {
        let favorites = [];
        try {
            favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
        } catch {}
        favorites = favorites.includes(project.id)
            ? favorites.filter(item => item !== project.id)
            : [...favorites, project.id];
        localStorage.setItem(favoriteKey, JSON.stringify(favorites));
        event.currentTarget.textContent = favorites.includes(project.id) ? '♥ Saved' : '♡ Save project';
    });

    document.getElementById('share-detail').addEventListener('click', async event => {
        try {
            if (navigator.share) {
                await navigator.share({ title: project.title, text: project.desc, url: location.href });
            } else {
                await navigator.clipboard.writeText(location.href);
                event.currentTarget.textContent = 'Link copied ✓';
            }
        } catch {}
    });
});
