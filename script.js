const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = "";

// --- INICIAR CHAT ---
function startChat() {
    const user = document.getElementById('username').value;
    if(user.trim() !== "") {
        currentUser = user;
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
        document.getElementById('user-display').innerText = `ID: ${user}`;
        carregarHistorico();
        escutarMensagens();
    }
}

// --- CARREGAR MENSAGENS ANTIGAS ---
async function carregarHistorico() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) data.forEach(msg => exibirMensagem(msg));
}

// --- ESCUTAR MENSAGENS EM TEMPO REAL ---
function escutarMensagens() {
    supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, (payload) => {
        exibirMensagem(payload.new);
    }).subscribe();
}

// --- EXIBIR MENSAGEM NA TELA ---
function exibirMensagem(msg) {
    const div = document.createElement('div');
    div.className = 'msg-bubble';
    // Aqui usamos os nomes das colunas conforme seu print do SQL Editor
    const usuario = msg["texto do usuário"] || msg.usuario;
    const texto = msg["texto contido"] || msg.conteudo;
    
    div.innerHTML = `<span class="msg-user">${usuario}:</span> ${texto}`;
    const box = document.getElementById('messages');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// --- ENVIAR MENSAGEM ---
async function enviar() {
    const input = document.getElementById('message-input');
    const texto = input.value;
    if(texto) {
        await supabase.from('mensagens').insert([{ 
            "texto do usuário": currentUser, 
            "texto contido": texto 
        }]);
        input.value = '';
    }
}

document.getElementById('send-btn').onclick = enviar;
document.getElementById('message-input').onkeypress = (e) => { if(e.key === 'Enter') enviar() };

// --- ANIMAÇÃO MATRIX ---
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const letters = "0101010101010101";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function draw() {
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
setInterval(draw, 33);
