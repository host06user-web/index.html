const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

function startChat() {
    const userVal = document.getElementById('username').value;
    if(userVal.trim() !== "") {
        currentUser = userVal;
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
    supabase.channel('sala_principal')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, payload => {
        exibirNaTela(payload.new);
    }).subscribe();
}

function exibirNaTela(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.style.marginBottom = "8px";
    
    const nick = m.usuario || "Anon";
    const texto = m.conteudo || "";
    
    // Formato que você pediu: [Nick] mensagem
    div.innerHTML = `<span style="color:#00ff41; font-weight:bold;">[${nick}]</span> <span style="color:white">${texto}</span>`;
    
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

document.getElementById('btn-login').addEventListener('click', startChat);
document.getElementById('btn-send').addEventListener('click', enviar);
