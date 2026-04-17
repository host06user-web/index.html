const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';

let supabase;
let currentUser = "";

// Matrix Effect
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

// Inicia ao carregar
window.onload = () => {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initMatrix();
    
    // Configura o botão de login
    document.getElementById('btn-login').onclick = () => {
        const userVal = document.getElementById('username').value;
        if(userVal.trim() !== "") {
            currentUser = userVal;
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('chat-container').classList.remove('hidden');
            document.getElementById('user-display').innerText = `ID: ${currentUser}`;
            carregarMensagens();
            ligarRealtime();
        }
    };

    // Configura o botão de enviar
    document.getElementById('btn-send').onclick = enviar;
};

async function carregarMensagens() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) {
        document.getElementById('messages').innerHTML = '';
        data.forEach(m => exibirNaTela(m));
    }
}

function ligarRealtime() {
    supabase.channel('sala_chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, p => {
        exibirNaTela(p.new);
    }).subscribe();
}

function exibirNaTela(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg-line';
    const nick = m.usuario || "Anon";
    const texto = m.conteudo || "";
    div.innerHTML = `<span style="color:#00ff41; font-weight:bold;">[${nick}]</span> <span style="color:white">${texto}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function enviar() {
    const input = document.getElementById('message-input');
    if(input.value.trim() !== "") {
        await supabase.from('mensagens').insert([{ usuario: currentUser, conteudo: input.value }]);
        input.value = '';
    }
}
