const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

async function startChat() {
    const input = document.getElementById('username');
    const loginBox = document.getElementById('login-container');
    const chatBox = document.getElementById('chat-container');

    // Se o campo estiver vazio, avisa e para
    if (!input.value.trim()) {
        alert("Digite um codinome!");
        return;
    }

    currentUser = input.value;

    // FORÇA A TROCA DE TELA ANTES DE QUALQUER COISA
    if (loginBox && chatBox) {
        loginBox.style.display = 'none'; 
        chatBox.classList.remove('hidden');
        document.getElementById('user-display').innerText = `ID: ${currentUser}`;
    }

    // AGORA TENTA CONECTAR AO BANCO
    try {
        await carregarHistorico();
        conectarRealtime();
    } catch (e) {
        console.log("Erro de conexão, mas chat aberto.");
    }
}

async function carregarHistorico() {
    try {
        const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
        if (data) {
            const box = document.getElementById('messages');
            box.innerHTML = ''; // Limpa o "carregando"
            data.forEach(m => exibirMensagem(m));
        }
    } catch (err) {
        console.error(err);
    }
}

function conectarRealtime() {
    supabase.channel('sala_geral')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, p => {
            exibirMensagem(p.new);
        }).subscribe();
}

function exibirMensagem(m) {
    const box = document.getElementById('messages');
    if (!box) return;
    
    const div = document.createElement('div');
    div.className = 'msg-line';
    div.innerHTML = `<span style="color:#00ff41; font-weight:bold;">[${m.usuario}]</span> <span style="color:white">${m.conteudo}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function enviar() {
    const input = document.getElementById('message-input');
    const texto = input.value;
    if (!texto.trim()) return;

    input.value = ""; // Limpa na hora
    
    const { error } = await supabase.from('mensagens').insert([
        { usuario: currentUser, conteudo: texto }
    ]);
    
    if (error) console.log("Erro ao enviar:", error.message);
}

// MATRIX BACKGROUND
const canvas = document.getElementById('matrix');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff41";
        ctx.font = "15px monospace";
        drops.forEach((y, i) => {
            const text = Math.floor(Math.random() * 2);
            ctx.fillText(text, i * 20, y * 20);
            if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }
    setInterval(draw, 33);
}
