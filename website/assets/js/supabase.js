import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-config.js';

let client;

export function isSupabaseConfigured() {
    return SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co'
        && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

export function getSupabaseClient() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Add your project URL and anon key in assets/js/supabase-config.js.');
    }

    if (!client) {
        client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    return client;
}

export async function getCommunityProjects() {
    const { data, error } = await getSupabaseClient()
        .from('project_submissions')
        .select('id, title, description, modules, roles, project_type, status')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(project => ({
        id: project.id,
        title: project.title,
        desc: project.description,
        modules: project.modules,
        roles: project.roles,
        type: project.project_type,
        status: project.status.replaceAll('_', ' ')
    }));
}
