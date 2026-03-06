const SUPABASE_URL = 'DEINE_SUPABASE_URL';
const SUPABASE_KEY = 'DEIN_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Tab-Wechsel
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        if (tab === 'login') {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
        } else {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
        }
    });
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        document.getElementById('errorMessage').textContent = error.message;
    } else {
        window.location.href = 'index.html';
    }
});

// Registrierung
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        document.getElementById('errorMessage').textContent = error.message;
    } else {
        alert('Registrierung erfolgreich! Bitte melde dich an.');
        window.location.href = 'login.html';
    }
});
