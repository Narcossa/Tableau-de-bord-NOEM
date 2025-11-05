
import { supabase } from './supabase.js';

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) window.location.href = 'login.html';
  return session;
}

export async function currentUserRow() {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) return null;
  const email = session.user.email;
  const { data } = await supabase.from('users').select('*').eq('email', email).single();
  return data || null;
}

export function setBadge(text) {
  const el = document.getElementById('userBadge');
  if (el) el.textContent = text || '—';
}

export const SHEET_URL = "https://docs.google.com/spreadsheets/d/1uf2uOV_kNjq9k2FaWfyTvBPRy6FbieXuOiWLREbS140/edit?usp=sharing";

if (location.pathname.endsWith('/settings.html')) {
  (async () => {
    const session = await requireAuth();
    const user = await currentUserRow();
    setBadge(user ? `${user.name} (${session.data.session.user.email})` : session.data.session.user.email);
    const prof = document.getElementById('profile');
    if (prof) prof.innerHTML = user ? `<div class='small'>Nom: <b>${user.name}</b> • Rôle: <b>${user.role}</b></div>` : '<div class="small">Profil non trouvé (table users)</div>';
    const out = document.getElementById('logout');
    if (out) out.onclick = async () => { await supabase.auth.signOut(); location.href = 'login.html'; };
    const os = document.getElementById('openSheet');
    if (os) os.onclick = () => window.open(SHEET_URL, '_blank');
  })();
}

if (location.pathname.endsWith('/index.html') || location.pathname.endsWith('/')) {
  (async () => {
    const session = await requireAuth();
    const user = await currentUserRow();
    setBadge(user ? `${user.name}` : session.data.session.user.email);
    const btn = document.getElementById('openSheet');
    if (btn) btn.onclick = () => window.open(SHEET_URL, '_blank');
  })();
}
