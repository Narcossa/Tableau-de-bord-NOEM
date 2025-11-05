
import { supabase } from './supabase.js';

async function goHomeIfLogged() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) window.location.href = 'index.html';
}

if (location.pathname.endsWith('/login.html')) {
  goHomeIfLogged();
  document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) return alert('Email et mot de passe requis');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    location.href = 'index.html';
  };
}

if (location.pathname.endsWith('/register.html')) {
  document.getElementById('regBtn').onclick = async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    if (!email || !password) return alert('Email et mot de passe requis');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    await supabase.from('users').upsert({ email, name, role }).select();
    alert('Compte créé. Vérifie tes emails si nécessaire puis connecte-toi.');
    location.href = 'login.html';
  };
}
