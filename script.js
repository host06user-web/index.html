// 1. CONFIGURAÇÕES OFICIAIS DO SEU PROJETO
const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cHVoenl0bXhrZHVpaXpiZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzg0ODcsImV4cCI6MjA5MjAxNDQ4N30.WXPnxV32hNuYk1GCT0itGWCO26OUGZBd_UDHiub-sl0';

// Inicializa o cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

// 2. FUNÇÃO PARA ENTRAR NO CHAT
async function startChat() {
    const userInput = document.getElementById('username');
    const loginContainer = document.getElementById('login-container');
    const chatContainer = document.getElementById('chat-container');

    if (userInput.value.trim() !== "") {
        currentUser = userInput.value;

        // FORÇA A TROCA DE TELA NA HORA
        if (loginContainer && chatContainer) {
            loginContainer.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            document.getElementById('user-display').innerText = `ID: ${currentUser}`;
        }

        // TENTA CARREGAR DADOS DO BANCO
        try {
            await carregarHistorico();
            conectarRealtime();
        } catch (err) {
            console.log("Erro de conexão inicial, mas o chat está aberto.");
        }
    } else {
        alert("SISTEMA: Digite um Codename para infiltrar!");
    }
}

// 3. CARREGAR MENSAGENS ANTIGAS
async function carregarHistorico() {
    const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: true });

    if (data) {
        const box = document.getElementById('messages');
        box.innerHTML = ''; // Limpa mensagens de teste
        data.forEach(m => exibirMensagem(m));
    }
}

// 4. ESCUTAR NOVAS MENSAGENS EM TEMPO REAL
function conectarRealtime() {
    supabase.channel('sala_publica')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, payload => {
            exibirMensagem(payload.new);
        })
        .subscribe();
}

// 5. EXIBIR MENSAGEM NA TELA
function exibirMensagem(m) {
    const box = document.getElementById('messages');
    if (!box) return;

    const div = document.createElement('div');
    div.className = 'msg-line';
    
    // Estilo: [Nome] Mensagem
    div.innerHTML = `<span style="color:#00ff41; font-weight:bold;">[${m.usuario}]</span> <span style="color:white">${m.conteudo}</span>`;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight; // Faz o scroll descer sozinho
}

// 6. ENVIAR NOVA MENSAGEM
async function enviar() {
    const input = document.getElementById('message-input');
    const texto = input.value;

    if (texto.trim() !== "") {
        input.value = ""; // Limpa o campo na hora
        
        const { error } = await supabase
            .from('mensagens')
            .insert([{ usuario: currentUser, conteudo: texto }]);

        if (error) {
            console.error("Erro ao enviar:", error.message);
        }
    }
}

// 7. EFEITO MATRIX DE FUNDO
function initMatrix() {
    const c = document.getElementById('matrix');
    if (!c) return;
    const ctx = c.getContext('2d');
    
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    
    const fontSize = 16;
    const columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#00ff41";
        ctx.font = fontSize + "px monospace";

        drops.forEach((y, i) => {
            const text = Math.floor(Math.random() * 2); // Apenas 0 e 1
            ctx.fillText(text, i * fontSize, y * fontSize);
            if (y * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }
    setInterval(draw, 33);
}

// Inicia o efeito Matrix assim que carregar a página
window.onload = initMatrix;
