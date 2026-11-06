import { getCommunityProjects } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('project-grid');
    const search = document.getElementById('search');
    const filters = document.getElementById('filters');
    const sort = document.getElementById('sort-projects');
    const savedOnly = document.getElementById('favorites-only');
    const message = document.getElementById('project-data-message');
    const favoriteKey = 'projecthub_favorites_v1';
    let active = 'All';
    let communityProjects = [];

    const favorites = () => {
        try {
            return JSON.parse(localStorage.getItem(favoriteKey) || '[]');
        } catch {
            return [];
        }
    };

    function render() {
        const all = ProjectHub.all().concat(communityProjects);
        const query = search.value.toLowerCase();
        const categories = ['All', ...new Set(all.map(project => project.type || 'Community'))];
        filters.innerHTML = categories.map(category =>
            `<button class="filter-chip ${active === category ? 'active' : ''}" data-filter="${ProjectHub.escape(category)}">${ProjectHub.escape(category)}</button>`
        ).join('');

        let visible = all.filter(project =>
            (active === 'All' || (project.type || 'Community') === active)
            && [project.title, project.desc, ...project.modules, ...project.roles].join(' ').toLowerCase().includes(query)
        );
        if (savedOnly.checked) visible = visible.filter(project => favorites().includes(project.id));
        if (sort.value === 'az') visible.sort((a, b) => a.title.localeCompare(b.title));
        if (sort.value === 'za') visible.sort((a, b) => b.title.localeCompare(a.title));
        if (sort.value === 'modules') visible.sort((a, b) => b.modules.length - a.modules.length);

        document.getElementById('result-count').textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projects'}`;
        const saved = favorites();
        grid.innerHTML = visible.length ? visible.map(project =>
            `<article class="project-card" data-id="${ProjectHub.escape(project.id)}" tabindex="0" role="link"><div class="card-top"><span class="project-symbol">⌘</span><div class="card-actions"><span class="status-badge">${ProjectHub.escape(project.status)}</span><button class="favorite-btn ${saved.includes(project.id) ? 'is-favorite' : ''}" data-favorite="${ProjectHub.escape(project.id)}" aria-label="Save project">${saved.includes(project.id) ? '♥' : '♡'}</button></div></div><h2>${ProjectHub.escape(project.title)}</h2><p>${ProjectHub.escape(project.desc)}</p><div class="card-tags">${project.modules.slice(0, 3).map(module => `<span>${ProjectHub.escape(module)}</span>`).join('')}</div><div class="card-foot"><span>${ProjectHub.escape(project.type || 'Community')}</span><span>${project.modules.length} modules ↗</span></div></article>`
        ).join('') : '<div class="empty-state"><h3>No matching projects</h3><p>Try another keyword or adjust your filters.</p></div>';
    }

    search.addEventListener('input', render);
    sort.addEventListener('change', render);
    savedOnly.addEventListener('change', render);
    filters.addEventListener('click', event => {
        if (event.target.dataset.filter) {
            active = event.target.dataset.filter;
            render();
        }
    });
    grid.addEventListener('click', event => {
        const favorite = event.target.closest('[data-favorite]');
        if (favorite) {
            event.stopPropagation();
            let saved = favorites();
            saved = saved.includes(favorite.dataset.favorite)
                ? saved.filter(id => id !== favorite.dataset.favorite)
                : [...saved, favorite.dataset.favorite];
            localStorage.setItem(favoriteKey, JSON.stringify(saved));
            render();
            return;
        }
        const card = event.target.closest('[data-id]');
        if (card) location.href = `project.html?id=${encodeURIComponent(card.dataset.id)}`;
    });
    grid.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-id]')) {
            event.preventDefault();
            location.href = `project.html?id=${encodeURIComponent(event.target.dataset.id)}`;
        }
    });

    render();
    getCommunityProjects().then(projects => {
        communityProjects = projects;
        message.textContent = '';
        render();
    }).catch(error => {
        message.textContent = `Community submissions could not be loaded: ${error.message}`;
        message.className = 'admin-message error';
    });
});
