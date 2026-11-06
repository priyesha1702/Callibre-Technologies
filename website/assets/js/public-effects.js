(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isEmbeddedPreview = window.self !== window.top;
    const header = document.querySelector('.site-header');
    const progress = document.createElement('div');
    progress.className = 'page-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<i></i>';
    document.body.prepend(progress);

    const loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = '<div class="loader-logo"><span>✳</span> ProjectHub</div>';
    document.body.append(loader);
    const removeLoader = () => window.setTimeout(() => loader.classList.add('is-done'), 220);
    if (document.readyState === 'complete') removeLoader();
    else window.addEventListener('load', removeLoader, { once: true });

    const transition = document.createElement('div');
    transition.className = 'page-transition';
    transition.setAttribute('aria-hidden', 'true');
    document.body.append(transition);
    const toastRegion = document.createElement('div');
    toastRegion.className = 'toast-region';
    toastRegion.setAttribute('aria-live', 'polite');
    toastRegion.setAttribute('aria-atomic', 'false');
    document.body.append(toastRegion);
    window.ProjectHub = window.ProjectHub || {};
    window.ProjectHub.toast = message => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastRegion.append(toast);
        window.setTimeout(() => toast.remove(), 3800);
    };

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-layer';
    canvas.setAttribute('aria-hidden', 'true');
    if (!isEmbeddedPreview) document.body.prepend(canvas);
    const context = isEmbeddedPreview ? null : canvas.getContext('2d');
    if (context && !reducedMotion) {
        let particles = [];
        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * ratio;
            canvas.height = window.innerHeight * ratio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            particles = Array.from({ length: Math.min(64, Math.floor(window.innerWidth / 22)) }, () => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 1.6 + .4,
                speed: Math.random() * .24 + .08,
                phase: Math.random() * Math.PI * 2
            }));
        };
        const draw = time => {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (const particle of particles) {
                particle.y -= particle.speed;
                if (particle.y < -3) particle.y = window.innerHeight + 3;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(166,141,119,${.12 + (Math.sin(time / 900 + particle.phase) + 1) * .14})`;
                context.fill();
            }
            requestAnimationFrame(draw);
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });
        requestAnimationFrame(draw);
    }

    const hero = document.querySelector('.home-hero');
    const codeCard = document.querySelector('.code-window');
    const floatCard = document.querySelector('.float-card');
    const updateScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.firstElementChild.style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
        header?.classList.toggle('is-scrolled', window.scrollY > 24);
        if (!reducedMotion && hero) {
            const offset = Math.min(window.scrollY, hero.offsetHeight);
            if (codeCard) codeCard.style.transform = `rotate(-3deg) translateY(${offset * .08}px)`;
            if (floatCard) floatCard.style.transform = `translateY(${offset * -.12}px)`;
        }
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    const sections = document.querySelectorAll('main section, main .page-intro, main .person-card, main .detail-hero, main .detail-panel');
    if (!reducedMotion && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .12 });
        sections.forEach(section => {
            section.classList.add('reveal');
            observer.observe(section);
        });
        document.querySelectorAll('.stats-grid,.values-grid,.team-grid,.project-grid').forEach(group => {
            group.classList.add('reveal-stagger');
            [...group.children].forEach((child, index) => {
                child.style.setProperty('--reveal-index', index);
                child.classList.add('reveal');
                observer.observe(child);
            });
        });
    }

    if (!reducedMotion && !isEmbeddedPreview && window.matchMedia('(pointer:fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        document.body.append(cursor);
        const trail = Array.from({ length: 5 }, (_, index) => {
            const dot = document.createElement('i');
            dot.className = 'cursor-trail';
            dot.style.setProperty('--trail-index', index);
            dot.setAttribute('aria-hidden', 'true');
            document.body.append(dot);
            return dot;
        });
        const positions = trail.map(() => ({ x: 0, y: 0 }));
        let target = { x: 0, y: 0 };
        const animateTrail = () => {
            positions.forEach((position, index) => {
                const next = index === 0 ? target : positions[index - 1];
                const easing = .36 - index * .045;
                position.x += (next.x - position.x) * easing;
                position.y += (next.y - position.y) * easing;
                trail[index].style.left = `${position.x}px`;
                trail[index].style.top = `${position.y}px`;
            });
            requestAnimationFrame(animateTrail);
        };
        requestAnimationFrame(animateTrail);
        window.addEventListener('pointermove', event => {
            target = { x: event.clientX, y: event.clientY };
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
        }, { passive: true });
        document.addEventListener('pointerover', event => {
            cursor.classList.toggle('is-hover', Boolean(event.target.closest('a,button,input,textarea,select')));
        });
    }

    if (!reducedMotion) {
        document.querySelectorAll('.project-card,.stat-card,.person-card,.price-card').forEach(card => {
            card.addEventListener('pointermove', event => {
                if (event.pointerType !== 'mouse') return;
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - .5;
                const y = (event.clientY - bounds.top) / bounds.height - .5;
                card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('pointermove', event => {
                if (event.pointerType !== 'mouse') return;
                const rect = button.getBoundingClientRect();
                button.style.translate = `${(event.clientX - rect.left - rect.width / 2) * .06}px ${(event.clientY - rect.top - rect.height / 2) * .08}px`;
            });
            button.addEventListener('pointerleave', () => { button.style.translate = ''; });
        });
        document.addEventListener('click', event => {
            const button = event.target.closest('.btn');
            if (!button) return;
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('i');
            ripple.className = 'button-ripple';
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;
            button.append(ripple);
            window.setTimeout(() => ripple.remove(), 650);
        });
    }

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (!link || reducedMotion || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
        const target = new URL(link.href, location.href);
        if (target.origin !== location.origin || target.pathname === location.pathname || target.pathname === '/admin' || target.hash) return;
        event.preventDefault();
        document.body.classList.add('is-leaving');
        window.setTimeout(() => { location.href = target.href; }, 180);
    });

    document.querySelectorAll('.hero-copy>p').forEach(paragraph => {
        const fullText = paragraph.textContent.trim();
        if (!fullText || reducedMotion) return;
        const marker = document.createElement('span');
        marker.className = 'typewriter-text';
        paragraph.textContent = '';
        paragraph.append(marker);
        let index = 0;
        const type = () => {
            marker.textContent = fullText.slice(0, index++);
            if (index <= fullText.length) window.setTimeout(type, index < 12 ? 34 : 19);
        };
        window.setTimeout(type, 520);
    });

    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const open = item.classList.toggle('is-open');
            question.setAttribute('aria-expanded', String(open));
        });
    });

    const slides = [...document.querySelectorAll('.testimonial-slide')];
    if (slides.length) {
        let active = 0;
        const showSlide = next => {
            slides[active].classList.remove('is-active');
            active = (next + slides.length) % slides.length;
            slides[active].classList.add('is-active');
        };
        document.querySelector('[data-slide="next"]')?.addEventListener('click', () => showSlide(active + 1));
        document.querySelector('[data-slide="previous"]')?.addEventListener('click', () => showSlide(active - 1));
        if (!reducedMotion) window.setInterval(() => showSlide(active + 1), 6500);
    }

    document.querySelector('.newsletter-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const email = event.currentTarget.querySelector('input[type="email"]');
        if (!email.checkValidity()) {
            email.reportValidity();
            email.closest('form').classList.add('is-invalid');
            window.setTimeout(() => email.closest('form').classList.remove('is-invalid'), 400);
            return;
        }
        try {
            const subscriptions = JSON.parse(localStorage.getItem('projecthub_newsletter_v1') || '[]');
            if (!Array.isArray(subscriptions)) throw new Error('Stored newsletter data is invalid.');
            if (!subscriptions.includes(email.value.trim().toLowerCase())) {
                subscriptions.push(email.value.trim().toLowerCase());
                localStorage.setItem('projecthub_newsletter_v1', JSON.stringify(subscriptions));
            }
        } catch (error) {
            window.ProjectHub.toast(`Unable to save this email on your device: ${error.message}`);
            return;
        }
        window.ProjectHub.toast('Email saved on this device. Newsletter delivery is not configured yet.');
        event.currentTarget.reset();
    });
})();
