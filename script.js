const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_v5CWKatJk5k_j4QNE0Kb8w_BpkXOFdA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = "";

// Matrix Effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const letters = "01"; const fontSize = 16;
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

// Forçar o botão de Infiltrar a funcionar
document.getElementById('infiltrar-btn').onclick = function() {
    const name = document.getElementById('username').value;
    if(name.trim() !== "") {
        currentUser = name;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('user-display').innerText = `ID: ${name}`;
        carregarHistorico();
        conectarRealtime();
    } else {
        alert("Digite um nome!");
    }
};

async function carregarHistorico() {
    const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: true });
    if (data) {
        document.getElementById('messages').innerHTML = '';
        data.forEach(m => exibirMensagem(m));
    }
}

function conectarRealtime() {
    supabase.channel('sala1').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, payload => {
        exibirMensagem(payload.new);
    }).subscribe();
}

function exibirMensagem(m) {
    const box = document.getElementById('messages');
    const div = document.createElement('div');
    div.style.marginBottom = "8px";
    div.innerHTML = `<b style="color:white">${m.usuario}:</b> <span style="color:#00ff41">${m.conteudo}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

document.getElementById('send-btn').onclick = async function() {
    const input = document.getElementById('message-input');
    if(input.value) {
        await supabase.from('mensagens').insert([{ usuario: currentUser, conteudo: input.value }]);
        input.value = '';
    }
};
