import { getCommunityProjects } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const message = document.getElementById('stats-message');
    const statsGrid = document.querySelector('.stats-grid');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let statsVisible = false;
    let statsReady = false;
    let finalStats;

    const revealEverything = () => {
        document.querySelectorAll('.section-heading, .stat-card, .cta-panel').forEach(element => {
            element.classList.add('is-revealed');
        });
        statsGrid?.classList.add('is-revealed');
        statsVisible = true;
    };

    const countUp = (element, value) => {
        if (reducedMotion) {
            element.textContent = value;
            return;
        }

        const start = performance.now();
        const duration = 1200;
        const update = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            element.textContent = Math.round(value * eased);
            if (progress < 1) requestAnimationFrame(update);
            else element.textContent = value;
        };
        requestAnimationFrame(update);
    };

    const showStats = () => {
        if (!statsReady || !statsVisible) return;
        countUp(document.getElementById('stat-projects'), finalStats.projects);
        countUp(document.getElementById('stat-enrolled'), finalStats.enrolled);
        countUp(document.getElementById('stat-modules'), finalStats.modules);
    };

    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealEverything();
    } else {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                if (entry.target === statsGrid) {
                    statsGrid.querySelectorAll('.stat-card').forEach(card => card.classList.add('is-revealed'));
                    statsVisible = true;
                    showStats();
                }
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.section-heading, .stats-grid, .cta-panel').forEach(element => {
            revealObserver.observe(element);
        });
    }

    let communityProjects = [];

    try {
        communityProjects = await getCommunityProjects();
    } catch (error) {
        message.textContent = `Community stats could not be loaded: ${error.message}`;
    }

    const localProjects = ProjectHub.all();
    const projects = localProjects.concat(communityProjects);
    finalStats = {
        projects: projects.length,
        enrolled: localProjects.filter(project => project.status !== 'Built').length + communityProjects.length,
        modules: projects.reduce((total, project) => total + (project.modules || []).length, 0)
    };
    statsReady = true;
    showStats();
});
