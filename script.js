const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

// EFEITO MATRIX DE FUNDO
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const letters = "010101"; const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);
function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41"; ctx.font = fontSize + "px monospace";
    drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(draw, 33);

// SISTEMA DE CHAT
function startChat() {
    const user = document.getElementById('username').value;
    if(user.trim() !== "") {
        currentUser = user;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('user-display').innerText = `ID: ${user}`;
        carregarMensagens();
        ligarRealtime();
    }
}

async function carregarMensagens() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) {
        document.getElementById('messages').innerHTML = '';
        data.forEach(m => exibirNaTela(m));
    }
}

function ligarRealtime() {
    supabase.channel('geral').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, payload => {
        exibirNaTela(payload.new);
    }).subscribe();
}

function exibirNaTela(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg-line';
    div.innerHTML = `<b style="color:white">${m.usuario}:</b> ${m.conteudo}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function enviar() {
    const input = document.getElementById('message-input');
    if(input.value.trim() !== "") {
        await supabase.from('mensagens').insert([{ 
            usuario: currentUser, 
            conteudo: input.value 
        }]);
        input.value = '';
    }
}
