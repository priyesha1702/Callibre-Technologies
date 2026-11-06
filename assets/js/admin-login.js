import { getSupabaseClient, isSupabaseConfigured } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('admin-login-form');
    const message = document.getElementById('login-message');

    function showError(text) {
        message.textContent = text;
        message.className = 'admin-message error';
    }

    if (!isSupabaseConfigured()) {
        showError('Admin login is not configured yet. Follow the Supabase setup steps in README.md.');
        form.querySelector('[type="submit"]').disabled = true;
        return;
    }

    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        showError(`Unable to check your sign-in: ${sessionError.message}`);
        return;
    }
    if (sessionData.session?.user.app_metadata?.role === 'admin') {
        location.replace('admin.html');
        return;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('[type="submit"]');
        button.disabled = true;
        message.textContent = 'Signing in...';
        message.className = 'admin-message';

        let result;
        try {
            result = await supabase.auth.signInWithPassword({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            });
        } catch (error) {
            showError(`Sign-in failed: ${error.message}`);
            button.disabled = false;
            return;
        }

        if (result.error) {
            showError(`Sign-in failed: ${result.error.message}`);
            button.disabled = false;
            return;
        }

        if (result.data.user.app_metadata?.role !== 'admin') {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                showError(`This account is not an admin, and sign-out failed: ${signOutError.message}`);
            } else {
                showError('This account does not have admin access.');
            }
            button.disabled = false;
            return;
        }

        location.replace('admin.html');
    });
});
