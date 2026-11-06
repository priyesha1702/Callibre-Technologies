import { getSupabaseClient } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('project-form');
    const modules = [];
    const roles = [];
    const $ = id => document.getElementById(id);
    const fields = [...form.querySelectorAll(':scope > .field')];
    const stepGroups = [fields.slice(0, 2), fields.slice(2, 4), fields.slice(4)];
    const steps = document.createElement('div');
    steps.className = 'submission-steps';
    const footer = form.querySelector('.form-bottom');
    if (!footer) throw new Error('The project submission form is missing its action footer.');
    form.insertBefore(steps, footer);
    const panels = stepGroups.map((group, index) => {
        const panel = document.createElement('section');
        panel.className = 'step-panel';
        panel.dataset.step = String(index);
        panel.setAttribute('aria-label', `Submission step ${index + 1}`);
        group.forEach(field => panel.append(field));
        steps.append(panel);
        return panel;
    });
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'btn ghost';
    backButton.textContent = 'Back';
    backButton.hidden = true;
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'btn primary form-next';
    nextButton.textContent = 'Continue →';
    const submitButton = footer.querySelector('[type="submit"]');
    submitButton.hidden = true;
    footer.insertBefore(backButton, submitButton);
    footer.insertBefore(nextButton, submitButton);
    let activeStep = 0;

    function showStep(index) {
        activeStep = index;
        panels.forEach((panel, panelIndex) => {
            panel.hidden = panelIndex !== index;
        });
        $('progress-fill').style.width = `${((index + 1) / panels.length) * 100}%`;
        $('progress-label').textContent = `Step ${index + 1} of ${panels.length}`;
        backButton.hidden = index === 0;
        nextButton.hidden = index === panels.length - 1;
        submitButton.hidden = index !== panels.length - 1;
        footer.classList.toggle('is-final-step', index === panels.length - 1);
    }

    function validateStep(index) {
        let valid = true;
        const panel = panels[index];
        panel.querySelectorAll('.field').forEach(field => {
            const input = field.querySelector('input:not([type="button"]),textarea');
            const inputValid = input ? input.checkValidity() : true;
            const chipsValid = !field.querySelector('#module-input') || modules.length > 0;
            const rolesValid = !field.querySelector('#role-input') || roles.length > 0;
            const fieldValid = inputValid && chipsValid && rolesValid;
            field.classList.toggle('is-invalid', !fieldValid);
            field.classList.toggle('is-valid', fieldValid && (input?.value.trim() || chipsValid && rolesValid));
            if (!fieldValid) {
                valid = false;
                input?.reportValidity();
                if (!inputValid && input) input.focus();
            }
        });
        if (!valid) window.ProjectHub?.toast('Check the highlighted fields before continuing.');
        return valid;
    }

    nextButton.addEventListener('click', () => {
        add('module-input', modules, 'module-chips');
        add('role-input', roles, 'role-chips');
        if (validateStep(activeStep)) showStep(activeStep + 1);
    });
    backButton.addEventListener('click', () => showStep(activeStep - 1));
    showStep(0);

    function chips(id, items) {
        $(id).innerHTML = items.map((value, index) =>
            `<button type="button" class="chip" data-index="${index}">${ProjectHub.escape(value)} <span>×</span></button>`
        ).join('');
    }

    function progress() {
        $('progress-fill').style.width = `${((activeStep + 1) / panels.length) * 100}%`;
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

    ['title', 'requirements', 'client-name', 'client-email', 'client-phone'].forEach(id => $(id).addEventListener('input', event => {
        progress();
        event.currentTarget.closest('.field')?.classList.remove('is-invalid');
    }));

    form.addEventListener('submit', async event => {
        event.preventDefault();
        add('module-input', modules, 'module-chips');
        add('role-input', roles, 'role-chips');

        const message = $('form-message');
        if (!modules.length || !roles.length) {
            message.textContent = 'Add at least one module and one user role.';
            message.className = '';
            window.ProjectHub?.toast('Add at least one module and one user role.');
            return;
        }

        if (!validateStep(2)) return;
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
            message.innerHTML = 'Your project has been submitted. <span class="form-check" aria-hidden="true">✓</span>';
            window.ProjectHub?.toast('Project submitted successfully.');
            setTimeout(() => {
                location.href = `project.html?id=${encodeURIComponent(projectId)}`;
            }, 700);
        } catch (error) {
            message.textContent = `Unable to submit your project: ${error.message}`;
            message.className = '';
            window.ProjectHub?.toast('Project submission failed. Please review the message and try again.');
            submitButton.disabled = false;
        }
    });
});
