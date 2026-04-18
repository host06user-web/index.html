// CONFIGURAÇÕES DO SUPABASE (Verifique se os seus dados estão iguais a estes)
const SUPABASE_URL = 'https://supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

// FUNÇÃO PRINCIPAL: É AQUI QUE A MÁGICA ACONTECE
async function startChat() {
    const userDisplay = document.getElementById('username');
    const user = userDisplay.value;

    if(user.trim() !== "") {
        currentUser = user;

        // 1. MUDA A TELA NA HORA (FORÇADO)
        const loginContainer = document.getElementById('login-container');
        const chatContainer = document.getElementById('chat-container');

        if (loginContainer && chatContainer) {
            loginContainer.style.display = 'none'; // Esconde o login
            chatContainer.classList.remove('hidden'); // Mostra o chat
            document.getElementById('user-display').innerText = `ID: ${user}`;
        }

        // 2. INICIA AS FUNÇÕES DO CHAT E MATRIX
        initMatrix();
        
        try {
            await carregarHistorico();
            conectarRealtime();
        } catch (error) {
            console.error("Erro ao conectar:", error);
        }
    } else {
        alert("SISTEMA: Identificação necessária!");
    }
}

async function carregarHistorico() {
    const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (data) {
        document.getElementById('messages').innerHTML = ''; // Limpa antes de carregar
        data.forEach(m => exibirMensagem(m));
    }
}

function conectarRealtime() {
    supabase.channel('sala1')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, p => {
        exibirMensagem(p.new);
    }).subscribe();
}

function exibirMensagem(m) {
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
    const texto = input.value;

    if(texto.trim() !== "") {
        input.value = ''; // Limpa o campo na hora para parecer mais rápido
        const { error } = await supabase
            .from('mensagens')
            .insert([{ usuario: currentUser, conteudo: texto }]);
        
        if (error) alert("Erro ao enviar: " + error.message);
    }
}

// EFEITO MATRIX NO FUNDO
function initMatrix() {
    const c = document.getElementById('matrix');
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; 
    c.height = window.innerHeight;
    const drops = Array(Math.floor(c.width/16)).fill(1);

    setInterval(() => {
        ctx.fillStyle = "rgba(0,0,0,0.05)"; 
        ctx.fillRect(0,0,c.width,c.height);
        ctx.fillStyle = "#00ff41"; 
        ctx.font = "16px monospace";
        drops.forEach((y, i) => {
            ctx.fillText(Math.floor(Math.random()*2), i*16, y*16);
            if(y*16 > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 33);
}
