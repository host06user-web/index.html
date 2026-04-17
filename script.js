const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';

let supabase;
let currentUser = "";

// Inicialização segura
window.addEventListener('load', () => {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        initMatrix();
    }
});

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

async function carregarHistorico() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) data.forEach(msg => exibirMensagem(msg));
}

function escutarMensagens() {
    supabase.channel('mensagens-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, (payload) => {
        exibirMensagem(payload.new);
    }).subscribe();
}

function exibirMensagem(msg) {
    const div = document.createElement('div');
    div.className = 'msg-bubble';
    
    // Pegando os nomes com espaços conforme seu SQL
    const usuario = msg["texto do usuário"] || "Anon";
    const texto = msg["texto contido"] || "";
    
    div.innerHTML = `<span class="msg-user">${usuario}:</span> ${texto}`;
    const box = document.getElementById('messages');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function enviar() {
    const input = document.getElementById('message-input');
    const texto = input.value;
    if(texto && supabase) {
        await supabase.from('mensagens').insert([{ 
            "texto do usuário": currentUser, 
            "texto contido": texto 
        }]);
        input.value = '';
    }
}

// Vinculando eventos
document.getElementById('send-btn').onclick = enviar;
document.getElementById('message-input').onkeypress = (e) => { if(e.key === 'Enter') enviar() };

// Efeito Matrix
function initMatrix() {
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = "01";
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
}
