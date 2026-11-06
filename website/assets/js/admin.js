import { getSupabaseClient, isSupabaseConfigured } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
    const message = document.getElementById('dashboard-message');
    const list = document.getElementById('submission-list');
    const count = document.getElementById('submission-count');

    if (!supabase) {
        message.textContent = 'Admin dashboard is not configured. Follow the Supabase setup steps in README.md.';
        message.className = 'admin-message error';
        document.getElementById('admin-signout').disabled = true;
        return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        message.textContent = `Unable to verify your sign-in: ${sessionError.message}`;
        message.className = 'admin-message error';
        return;
    }

    const user = sessionData.session?.user;
    if (!user || user.app_metadata?.role !== 'admin') {
        location.replace('admin-login.html');
        return;
    }

    function render(submissions) {
        count.textContent = String(submissions.length);
        if (!submissions.length) {
            list.innerHTML = '<div class="empty-state"><h2>No submissions yet</h2><p>New client submissions will appear here.</p></div>';
            return;
        }

        list.innerHTML = submissions.map(submission => {
            const contact = submission.contact;
            const phoneHref = contact.client_phone.replace(/[^\d+]/g, '');
            const submittedAt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(submission.created_at));
            const options = ['new', 'contacted', 'in_progress', 'closed'];

            return `<article class="submission-card">
                <div class="submission-card-heading">
                    <div><span class="eyebrow">${ProjectHub.escape(submission.project_type)} · ${ProjectHub.escape(submittedAt)}</span><h2>${ProjectHub.escape(submission.title)}</h2></div>
                    <label class="status-control"><span>Status</span><select data-status-id="${ProjectHub.escape(submission.id)}" data-previous-status="${ProjectHub.escape(submission.status)}">${options.map(status => `<option value="${status}" ${submission.status === status ? 'selected' : ''}>${ProjectHub.escape(status.replaceAll('_', ' '))}</option>`).join('')}</select></label>
                </div>
                <p class="submission-description">${ProjectHub.escape(submission.description)}</p>
                <div class="submission-tags">${submission.modules.map(item => `<span>${ProjectHub.escape(item)}</span>`).join('')}</div>
                <div class="client-contact">
                    <div><span>CLIENT</span><b>${ProjectHub.escape(contact.client_name)}</b></div>
                    <a href="mailto:${encodeURIComponent(contact.client_email)}">${ProjectHub.escape(contact.client_email)}</a>
                    <a href="tel:${ProjectHub.escape(phoneHref)}">${ProjectHub.escape(contact.client_phone)}</a>
                </div>
            </article>`;
        }).join('');
    }

    async function loadSubmissions() {
        message.textContent = 'Loading submissions...';
        message.className = 'admin-message';
        const { data: submissions, error: submissionError } = await supabase
            .from('project_submissions')
            .select('id, title, description, modules, roles, project_type, status, created_at')
            .order('created_at', { ascending: false });

        if (submissionError) {
            message.textContent = `Unable to load submissions: ${submissionError.message}`;
            message.className = 'admin-message error';
            return;
        }

        if (!submissions.length) {
            render([]);
            message.textContent = '';
            message.className = 'admin-message';
            return;
        }

        const { data: contacts, error: contactError } = await supabase
            .from('submission_contacts')
            .select('submission_id, client_name, client_email, client_phone')
            .in('submission_id', submissions.map(submission => submission.id));

        if (contactError) {
            message.textContent = `Unable to load client contacts: ${contactError.message}`;
            message.className = 'admin-message error';
            return;
        }

        const contactsById = new Map(contacts.map(contact => [contact.submission_id, contact]));
        const completeSubmissions = submissions
            .filter(submission => contactsById.has(submission.id))
            .map(submission => ({ ...submission, contact: contactsById.get(submission.id) }));

        render(completeSubmissions);
        message.textContent = completeSubmissions.length === submissions.length
            ? ''
            : 'Some submissions are missing contact records. Review the Supabase data for those records.';
        message.className = completeSubmissions.length === submissions.length ? 'admin-message' : 'admin-message error';
    }

    list.addEventListener('change', async event => {
        const select = event.target.closest('[data-status-id]');
        if (!select) return;

        const previousStatus = select.dataset.previousStatus || select.value;
        select.disabled = true;
        const { error } = await supabase
            .from('project_submissions')
            .update({ status: select.value })
            .eq('id', select.dataset.statusId);

        if (error) {
            select.value = previousStatus;
            message.textContent = `Unable to update status: ${error.message}`;
            message.className = 'admin-message error';
        } else {
            select.dataset.previousStatus = select.value;
            message.textContent = 'Submission status updated.';
            message.className = 'admin-message success';
        }
        select.disabled = false;
    });

    document.getElementById('admin-signout').addEventListener('click', async event => {
        event.currentTarget.disabled = true;
        const { error } = await supabase.auth.signOut();
        if (error) {
            message.textContent = `Unable to sign out: ${error.message}`;
            message.className = 'admin-message error';
            event.currentTarget.disabled = false;
            return;
        }
        location.replace('admin-login.html');
    });

    await loadSubmissions();
});
