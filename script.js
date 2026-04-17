const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';

let supabase;
let currentUser = "";

// Inicia ao carregar a página
window.onload = () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initMatrix();
};

function startChat() {
    const userVal = document.getElementById('username').value;
    if(userVal.trim() !== "") {
        currentUser = userVal;
        // Troca as telas usando a classe .hidden do CSS
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
        document.getElementById('user-display').innerText = `ID: ${currentUser}`;
        
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
    supabase.channel('sala_principal').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, payload => {
        exibirNaTela(payload.new);
    }).subscribe();
}

function exibirNaTela(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg-line';
    
    // Pega o nick e o texto das colunas do seu banco
    const nick = m.usuario || "Anon";
    const texto = m.conteudo || "";
    
    // Formata como você pediu: [Nick] mensagem
    div.innerHTML = `<span style="color:#00ff41">[${nick}]</span> <span style="color:white">${texto}</span>`;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight; // Rola para baixo automaticamente
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

// Escutadores de eventos (Melhor para tablets)
document.getElementById('btn-login').addEventListener('click', startChat);
document.getElementById('btn-send').addEventListener('click', enviar);

// Animação Matrix
function initMatrix() {
    const c = document.getElementById('matrix');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const drops = Array(Math.floor(c.width/16)).fill(1);
    setInterval(() => {
        ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,c.width,c.height);
        ctx.fillStyle = "#00ff41"; ctx.font = "16px monospace";
        drops.forEach((y,i) => {
            ctx.fillText(Math.floor(Math.random()*2), i*16, y*16);
            if(y*16 > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 33);
}
