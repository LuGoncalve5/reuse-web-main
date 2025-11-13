import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Pega dados da URL
const urlParams = new URLSearchParams(window.location.search);
const gavetaId = urlParams.get('gaveta');
const usuarioId = urlParams.get('usuario');

// Setup seleção única
function setupOptions(selector) {
    const group = document.querySelectorAll(selector + " .option");
    group.forEach(btn => btn.addEventListener('click', () => {
        group.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if(selector === '.finalidade') {
            document.getElementById('valor-box').style.display = btn.textContent.trim() === 'Vender' ? 'block' : 'none';
        }
    }));
}
setupOptions('.categoria');
setupOptions('.tamanho');
setupOptions('.finalidade');

document.querySelectorAll('.color').forEach(c => {
    c.addEventListener('click', () => {
        document.querySelectorAll('.color').forEach(col => col.classList.remove('selected'));
        c.classList.add('selected');
    });
});

function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = (parseFloat(valor)/100).toFixed(2)+'';
    valor = valor.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = valor;
}

// Submit da peça
const form = document.getElementById('formPeca');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const categoria = document.querySelector('.categoria .selected').textContent;
    const tamanho = document.querySelector('.tamanho .selected').textContent;
    const finalidade = document.querySelector('.finalidade .selected').textContent;
    const cor = document.querySelector('.colors .selected').style.background;
    const valor = document.getElementById('valor').value;

    if(!titulo) { alert('Digite um título'); return; }

    const newPecaId = `${usuarioId}_${Date.now()}`;

    await set(ref(database, `pecas/${newPecaId}`), {
        id: newPecaId,
        idUsuario: usuarioId,
        idGaveta: gavetaId,
        titulo,
        descricao,
        categoria,
        tamanho,
        finalidade,
        cor,
        valor
    });

    await set(ref(database, `gavetas/${gavetaId}/pecas/${newPecaId}`), true);

    window.location.href = `../gaveta/gaveta.html?id=${gavetaId}`;
});
