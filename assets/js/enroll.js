import { getSupabaseClient } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('project-form');
    const modules = [];
    const roles = [];
    const $ = id => document.getElementById(id);

    function chips(id, items) {
        $(id).innerHTML = items.map((value, index) =>
            `<button type="button" class="chip" data-index="${index}">${ProjectHub.escape(value)} <span>×</span></button>`
        ).join('');
    }

    function progress() {
        let count = 0;
        if ($('title').value.trim()) count++;
        if ($('requirements').value.trim()) count++;
        if (modules.length) count++;
        if (roles.length) count++;
        $('progress-fill').style.width = `${25 * count}%`;
        $('progress-label').textContent = count < 2 ? 'Step 1 of 3' : count < 4 ? 'Step 2 of 3' : 'Ready to submit';
    }

    function add(inputId, items, containerId) {
        const value = $(inputId).value.trim();
        if (!value) return;
        if (items.some(item => item.toLowerCase() === value.toLowerCase())) {
            $(inputId).value = '';
            return;
        }
        items.push(value);
        $(inputId).value = '';
        chips(containerId, items);
        progress();
    }

    $('add-module').addEventListener('click', () => add('module-input', modules, 'module-chips'));
    $('add-role').addEventListener('click', () => add('role-input', roles, 'role-chips'));

    [['module-input', modules, 'module-chips'], ['role-input', roles, 'role-chips']].forEach(([inputId, items, containerId]) => {
        $(inputId).addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                add(inputId, items, containerId);
            }
        });
    });

    [['module-chips', modules], ['role-chips', roles]].forEach(([containerId, items]) => {
        $(containerId).addEventListener('click', event => {
            const button = event.target.closest('[data-index]');
            if (button) {
                items.splice(Number(button.dataset.index), 1);
                chips(containerId, items);
                progress();
            }
        });
    });

    ['title', 'requirements'].forEach(id => $(id).addEventListener('input', progress));

    form.addEventListener('submit', async event => {
        event.preventDefault();
        add('module-input', modules, 'module-chips');
        add('role-input', roles, 'role-chips');

        const message = $('form-message');
        if (!modules.length || !roles.length) {
            message.textContent = 'Add at least one module and one user role.';
            message.className = '';
            return;
        }

        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        message.textContent = 'Submitting your project...';
        message.className = '';

        try {
            const { data: projectId, error } = await getSupabaseClient().rpc('submit_project', {
                p_title: $('title').value.trim(),
                p_description: $('requirements').value.trim(),
                p_modules: [...modules],
                p_roles: [...roles],
                p_client_name: $('client-name').value.trim(),
                p_client_email: $('client-email').value.trim(),
                p_client_phone: $('client-phone').value.trim()
            });

            if (error) throw error;
            message.textContent = 'Your project has been submitted.';
            message.className = 'success';
            setTimeout(() => {
                location.href = `project.html?id=${encodeURIComponent(projectId)}`;
            }, 700);
        } catch (error) {
            message.textContent = `Unable to submit your project: ${error.message}`;
            message.className = '';
            submitButton.disabled = false;
        }
    });
});
