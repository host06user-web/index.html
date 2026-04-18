const SUPABASE_URL = 'https://cupuhzytmxkduiizbdqb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

async function startChat() {
    const input = document.getElementById('username');
    if(input.value.trim() !== "") {
        currentUser = input.value;
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
        document.getElementById('user-display').innerText = `USUÁRIO: ${currentUser}`;
        
        carregarHistorico();
        conectarRealtime();
    }
}

async function carregarHistorico() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) {
        document.getElementById('messages').innerHTML = '';
        data.forEach(m => exibirMensagem(m));
    }
}

function conectarRealtime() {
    supabase.channel('room1').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, p => {
        exibirMensagem(p.new);
    }).subscribe();
}

function exibirMensagem(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg-line';
    div.innerHTML = `<span style="color:var(--neon)">[${m.usuario}]</span> <span style="color:white">${m.conteudo}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function enviar() {
    const input = document.getElementById('message-input');
    if(input.value.trim() !== "") {
        const texto = input.value;
        input.value = "";
        await supabase.from('mensagens').insert([{ usuario: currentUser, conteudo: texto }]);
    }
}

// ANIMAÇÃO DE FUNDO MATRIX
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const letters = Array(256).join("10").split("");
const fontSize = 10;
const columns = canvas.width / fontSize;
const drops = Array.from({length: columns}).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font = fontSize + "px monospace";
    drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(drawMatrix, 33);
