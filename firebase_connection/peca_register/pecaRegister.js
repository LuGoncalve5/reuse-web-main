// cadastroPeca.js
import { database } from '../firebaseConfig.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Pegando infos do usuário que tá logado (que foram salvas no localStorage)
const uid = localStorage.getItem('currentUserUID');
const tipoUsuario = localStorage.getItem('currentUserTipo'); 
let gavetaId = null;
let imagemBase64 = null;

// Função pra montar o caminho correto das gavetas dependendo do tipo de usuário
function getCaminhoGavetasUsuario() {

    // Se for pessoa física, caminho é esse
    if (tipoUsuario === "pessoaFisica") {
        return `usuarios/pessoaFisica/${uid}/gavetas`;
    }

    // Se for instituição
    if (tipoUsuario === "instituicao") {
        return `usuarios/pessoaJuridica/instituicoes/${uid}/gavetas`;
    }

    // Se for brechó
    if (tipoUsuario === "brecho") {
        return `usuarios/pessoaJuridica/brechos/${uid}/gavetas`;
    }

    // Se cair aqui, deu ruim
    console.error("Tipo de usuário inválido:", tipoUsuario);
    return null;
}

/* ============================================================
   PREVIEW DA IMAGEM
   (mostra a imagem que o usuário selecionou)
============================================================ */
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        imagemBase64 = reader.result; // <-- AQUI SALVAMOS O BASE64
        previewImg.src = imagemBase64;
        previewImg.style.display = "block";
        uploadBox.querySelector("i").style.display = "none";
        uploadBox.querySelector("p").style.display = "none";
    };

    reader.readAsDataURL(file);
});

/* ============================================================
   SELEÇÃO (categoria, tamanho, finalidade)
============================================================ */

// Função pra deixar os botões de seleção funcionando corretamente
function setupOptions(selector) {
    const group = document.querySelectorAll(selector + " .option-btn");
    
    group.forEach(btn => btn.addEventListener('click', () => {
        // remove selecionado dos outros
        group.forEach(b => b.classList.remove('selected'));
        // adiciona no clicado
        btn.classList.add('selected');

        // se for seleção da finalidade (doar/vender), mostra/esconde o valor
        if(selector === '.finalidade') {
            const finalidadeEscolhida = btn.textContent.trim(); 
            const valorInput = document.getElementById('valor');
            const valorBox = document.getElementById('valor-box');

            if (finalidadeEscolhida === 'Vender') {
                valorBox.style.display = 'block'; // mostra campo de preço
                valorInput.required = true;
            } else {
                valorBox.style.display = 'none'; // esconde preço
                valorInput.required = false;
                valorInput.value = ''; // limpa valor
            }
        }
    }));
}

// Função pra formatar o valor em formato de moeda (xx,xx)
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, ''); // tira tudo que não for número

    if (valor.length === 0) {
        input.value = "";
        return;
    }

    // transforma último dígito em centavos
    valor = (parseFloat(valor) / 100).toFixed(2) + '';
    valor = valor.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = valor;
}

const valorInput = document.getElementById("valor");
valorInput.addEventListener("input", () => {
    formatarMoeda(valorInput);
});

// Ativa os grupos de seleção
setupOptions('.categoria');
setupOptions('.tamanho');
setupOptions('.finalidade');

// Seleção das cores (só deixa 1 selecionada)
document.querySelectorAll('.color').forEach(c => {
    c.addEventListener('click', () => {
        document.querySelectorAll('.color').forEach(col => col.classList.remove('selected'));
        c.classList.add('selected');
    });
});

/* ============================================================
   CARREGAR GAVETAS
   (lista todas as gavetas do usuário)
============================================================ */
const dropdown = document.getElementById("gavetaDropdown");
const gavetaSelect = document.getElementById("gavetaSelect");
const gavetaSelecionadaSpan = document.getElementById("gavetaSelecionada");

async function carregarGavetas() {

    dropdown.innerHTML = "<p>Carregando...</p>";

    const caminho = getCaminhoGavetasUsuario();
    if (!caminho) return; // se não tiver caminho, já era

    try {
        // pega as gavetas do usuário
        const snapGavetasUsuario = await get(ref(database, caminho));

        if (!snapGavetasUsuario.exists()) {
            dropdown.innerHTML = "<p>Você não possui gavetas.</p>";
            return;
        }

        dropdown.innerHTML = "";
        const idsGavetas = Object.keys(snapGavetasUsuario.val());

        for (const id of idsGavetas) {

            // busca os dados da gaveta pelo ID
            const gavetaSnap = await get(ref(database, `gavetas/${id}`));

            if (gavetaSnap.exists()) {

                const dado = gavetaSnap.val();

                const item = document.createElement("div");
                item.classList.add("gaveta-item");
                item.textContent = dado.nome;

                // quando o usuário clicar na gaveta
                item.addEventListener("click", () => {
                    gavetaId = id; // salva ID
                    gavetaSelecionadaSpan.textContent = dado.nome; // mostra o nome no campo
                    dropdown.style.display = "none"; // fecha lista
                });

                dropdown.appendChild(item);
            }
        }

    } catch (err) {
        console.error("Erro ao buscar gavetas:", err);
        dropdown.innerHTML = "<p>Erro ao carregar.</p>";
    }
}

carregarGavetas();

// abre/fecha o dropdown de gavetas
gavetaSelect.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
});

/* ============================================================
   SUBMIT DA PEÇA
   (envia os dados pro Firebase)
============================================================ */
const form = document.getElementById('formPeca');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // cancela envio padrão

    if (!gavetaId) {
        alert("Selecione uma gaveta!");
        return;
    }

    // pega todos os dados que o usuário colocou
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const categoria = document.querySelector('.categoria .selected').textContent;
    const tamanho = document.querySelector('.tamanho .selected').textContent;
    const finalidade = document.querySelector('.finalidade .selected').textContent;
    const cor = document.querySelector('.colors .selected').dataset.cor;
    const valor = document.getElementById('valor').value;

    // validações simples
    if(!titulo) { alert('Digite um título'); return; }
    if(!descricao) { alert('Digite uma descrição'); return; }
    if(!categoria) { alert('Selecione uma categoria'); return; }
    if(!tamanho) { alert('Selecione um tamanho'); return; }
    if(!finalidade) { alert('Selecione uma finalidade'); return; }
    if(finalidade === 'Vender' && (!valor || valor.trim() === "")) { alert('Digite um valor'); return; }

    // cria ID único pra peça
    const newPecaId = `${uid}_${Date.now()}`;

    // salva a peça no banco
    await set(ref(database, `pecas/${newPecaId}`), {
        id: newPecaId,
        idUsuario: uid,
        idGaveta: gavetaId,
        titulo,
        descricao,
        categoria,
        tamanho,
        finalidade,
        cor,
        valor,
        imagem: imagemBase64 || null,
        dataCadastro: Date.now()
    });

    // adiciona peça dentro da gaveta
    await set(ref(database, `gavetas/${gavetaId}/pecas/${newPecaId}`), true);

    // manda pro perfil da peça
    window.location.href = `../../closet/peca/peca.html?id=${newPecaId}`;
});
