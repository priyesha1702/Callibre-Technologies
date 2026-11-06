(() => {
    const hero = document.querySelector('.showroom-hero');
    const stage = document.querySelector('.showroom-stage');
    const windows = [...document.querySelectorAll('.showroom-window')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine) and (min-width: 1001px)').matches;

    if (!hero || !stage || reducedMotion || !finePointer) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
        stage.style.transform = '';
        windows.forEach(windowCard => {
            windowCard.style.removeProperty('--shift-x');
            windowCard.style.removeProperty('--shift-y');
        });
    };

    hero.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const bounds = hero.getBoundingClientRect();
        pointerX = (event.clientX - bounds.left) / bounds.width - .5;
        pointerY = (event.clientY - bounds.top) / bounds.height - .5;
        if (frame) return;

        frame = requestAnimationFrame(() => {
            stage.style.transform = `rotateX(${pointerY * -3.2}deg) rotateY(${pointerX * 4.2}deg)`;
            windows.forEach(windowCard => {
                const depth = Number(windowCard.dataset.depth || 1);
                windowCard.style.setProperty('--shift-x', `${pointerX * depth * -3}px`);
                windowCard.style.setProperty('--shift-y', `${pointerY * depth * -3}px`);
            });
            frame = 0;
        });
    }, { passive: true });

    hero.addEventListener('pointerleave', reset, { passive: true });
})();
