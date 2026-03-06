// Supabase Konfiguration
const SUPABASE_URL = 'DEINE_SUPABASE_URL';
const SUPABASE_KEY = 'DEIN_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Prüfe Authentifizierung
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userInfo').textContent = `Hallo, ${user.email}`;
    checkExistingBet(user);
}

// Prüfe ob bereits getippt wurde
async function checkExistingBet(user) {
    const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!data) {
        document.getElementById('betForm').style.display = 'block';
        initBetForm();
    } else {
        document.getElementById('betForm').style.display = 'none';
    }
}

// Initialisiere Wett-Formular
function initBetForm() {
    const teams = [
        'Deutschland', 'Spanien', 'Frankreich', 'Italien',
        'England', 'Portugal', 'Niederlande', 'Belgien',
        'Kroatien', 'Schweiz', 'Polen', 'Österreich',
        'Dänemark', 'Schweden', 'Tschechien', 'Türkei'
    ];

    // Achtelfinale
    let html = '';
    for (let i = 0; i < 8; i++) {
        html += `
            <div class="match">
                <select name="r16_match${i}" required>
                    <option value="">Team wählen</option>
                    ${teams.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
        `;
    }
    document.getElementById('round16').innerHTML = html;
}

// Formular absenden
document.getElementById('tournamentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    const formData = new FormData(e.target);
    
    const betData = {
        user_id: user.id,
        user_email: user.email,
        user_name: user.email.split('@')[0],
        round_of_16: {}, // Hier würdest du die Formular-Daten sammeln
        points: 0
    };

    const { error } = await supabase
        .from('bets')
        .insert([betData]);

    if (!error) {
        alert('Tipps erfolgreich gespeichert!');
        document.getElementById('betForm').style.display = 'none';
        loadLeaderboard();
    }
});

// Lade Rangliste
async function loadLeaderboard() {
    const { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('points', { ascending: false });

    if (data) {
        const tbody = document.querySelector('#rankingTable tbody');
        tbody.innerHTML = data.map((bet, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${bet.user_name}</td>
                <td>${bet.points}</td>
            </tr>
        `).join('');
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// Initialisierung
checkAuth();
loadLeaderboard();

// Aktualisiere Rangliste alle 30 Sekunden
setInterval(loadLeaderboard, 30000);
