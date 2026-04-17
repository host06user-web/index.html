const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';

// Inicializa a conexão
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = "";

async function startChat() {
    const userVal = document.getElementById('username').value;
    if(userVal.trim() !== "") {
        currentUser = userVal;
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
        
        // Carrega o que já foi escrito e liga o tempo real
        carregarHistorico();
        conectarAgora();
    }
}

async function carregarHistorico() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) {
        document.getElementById('messages').innerHTML = '';
        data.forEach(m => mostrarNaTela(m));
    }
}

function conectarAgora() {
    supabase.channel('sala_publica')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, payload => {
        mostrarNaTela(payload.new);
    }).subscribe();
}

function mostrarNaTela(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.style.padding = "5px";
    
    // Tenta encontrar o texto em qualquer uma das colunas que você criou
    const nick = m.usuario || m["texto do usuário"] || "Anon";
    const msg = m.texto || m["texto contido"] || m.conteudo || "";
    
    div.innerHTML = `<b style="color:white">${nick}:</b> <span style="color:#00ff41">${msg}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function enviar() {
    const input = document.getElementById('message-input');
    if(input.value) {
        // Envia para as duas colunas possíveis para não ter erro
        await supabase.from('mensagens').insert([{ 
            usuario: currentUser, 
            texto: input.value,
            "texto do usuário": currentUser,
            "texto contido": input.value
        }]);
        input.value = '';
    }
}

document.getElementById('send-btn').onclick = enviar;
