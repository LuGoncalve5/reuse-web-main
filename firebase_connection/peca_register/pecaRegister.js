// pecaRegister.js 
import { database } from '../firebaseConfig.js';
import { ref, set, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// elementos DOM
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const uploadBox = document.querySelector(".upload-box");
const dropdown = document.getElementById("gavetaDropdown");
const gavetaSelecionadaSpan = document.getElementById("gavetaSelecionada");
const gavetaSelect = document.getElementById("gavetaSelect");

// usuário logado
const uid = localStorage.getItem('currentUserUID');
let gavetaId = null;
let imagemBase64 = null;

// ============================================================
// PREVIEW DA IMAGEM
// ============================================================
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const base64Completo = reader.result;
        imagemBase64 = base64Completo.split(",")[1]; // remove prefixo
        
        // preview precisa do prefixo
        previewImg.src = base64Completo;
        previewImg.style.display = "block";
        uploadBox.querySelector("i").style.display = "none";
        uploadBox.querySelector("p").style.display = "none";
    };
    reader.readAsDataURL(file);
});

// ============================================================
// BOTÕES DE SELEÇÃO
// ============================================================
function setupOptions(selector) {
    const group = document.querySelectorAll(selector + " .option-btn");
    
    group.forEach(btn =>
        btn.addEventListener('click', async () => {
            group.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            if (selector === '.finalidade') {
                const finalidadeEscolhida = btn.textContent.trim();
                const precoInput = document.getElementById('preco');
                const precoBox = document.getElementById('preco-box');

                precoBox.style.display = finalidadeEscolhida === 'Vender' ? 'block' : 'none';
                precoInput.required = finalidadeEscolhida === 'Vender';
                if (finalidadeEscolhida !== 'Vender') precoInput.value = "";

                // Atualiza gaveta automaticamente conforme a finalidade
                await aplicarRegraFinalidadeGaveta(finalidadeEscolhida);
            }
        })
    );
}

// ============================================================
// BLOQUEIO/DESBLOQUEIO DO DROPDOWN
// ============================================================
function bloquearDropdown(bloquear) {
    if (bloquear) {
        gavetaSelect.style.opacity = "0.5";
        gavetaSelect.style.pointerEvents = "none";
        dropdown.style.display = "none";
    } else {
        gavetaSelect.style.opacity = "1";
        gavetaSelect.style.pointerEvents = "auto";
    }
}

function renderizarGavetaSelecionada() {
    document.querySelectorAll(".gaveta-item").forEach(i => {
        i.classList.remove("selected-gaveta");
        if (i.textContent === gavetaSelecionadaSpan.textContent) {
            i.classList.add("selected-gaveta");
        }
    });
}

// ============================================================
// CARREGAR GAVETAS DO USUÁRIO
// ============================================================
async function carregarGavetas() {
    dropdown.innerHTML = "<p>Carregando...</p>";

    try {
        const q = query(ref(database, "gavetas"), orderByChild("ownerUid"), equalTo(uid));
        const snap = await get(q);

        if (!snap.exists()) {
            dropdown.innerHTML = "<p>Você não possui gavetas.</p>";
            return;
        }

        dropdown.innerHTML = "";
        let adicionadas = 0;

        snap.forEach(s => {
            const gaveta = s.val();
            const nomeLower = (gaveta.nome || "").toLowerCase();

            // Ignora as gavetas padrão "vendas" e "doação"/"doacao"
            if (nomeLower === "vendas" || nomeLower === "doação" || nomeLower === "doacao") {
                return;
            }

            const item = document.createElement("div");
            item.classList.add("gaveta-item");
            item.textContent = gaveta.nome;

            item.addEventListener("click", () => {
                gavetaId = s.key;
                gavetaSelecionadaSpan.textContent = gaveta.nome;
                dropdown.style.display = "none";
                renderizarGavetaSelecionada();
            });

            dropdown.appendChild(item);
            adicionadas++;
        });

        if (adicionadas === 0) {
            dropdown.innerHTML = "<p>Não há gavetas disponíveis para organizar.</p>";
        }
    } catch (err) {
        console.error("Erro ao buscar gavetas:", err);
        dropdown.innerHTML = "<p>Erro ao carregar.</p>";
    }
}

carregarGavetas();

// toggle dropdown
gavetaSelect.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
});

// ============================================================
// CORES MÚLTIPLAS (até 3)
// ============================================================
const colorButtons = [...document.querySelectorAll(".colors .color")];
let selectedColors = [];
const maxCores = 3;

function renderizarCoresSelecionadas() {
    colorButtons.forEach(btn => {
        btn.classList.toggle("selected", selectedColors.includes(btn.dataset.cor));
    });
}

colorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const cor = btn.dataset.cor;

        if (selectedColors.includes(cor)) {
            // Remove se já estiver selecionada
            selectedColors = selectedColors.filter(c => c !== cor);
        } else {
            if (selectedColors.length >= maxCores) {
                // Remove a primeira selecionada se já tiver 3
                selectedColors.shift();
            }
            selectedColors.push(cor);
        }

        renderizarCoresSelecionadas();
    });
});

// ============================================================
// ASSOCIAR FINALIDADE À GAVETA
// ============================================================
async function aplicarRegraFinalidadeGaveta(finalidade) {
    const q = query(ref(database, "gavetas"), orderByChild("ownerUid"), equalTo(uid));
    const snap = await get(q);
    if (!snap.exists()) return;

    let idVendas = null;
    let idDoacao = null;
    const gavetasNormais = []; // só gavetas que podem aparecer no dropdown

    snap.forEach(s => {
        const g = s.val();
        const nome = g.nome.toLowerCase();

        if (nome === "vendas") idVendas = s.key;
        else if (nome === "doação" || nome === "doacao") idDoacao = s.key;
        else gavetasNormais.push({ id: s.key, nome: g.nome });
    });

    // Limpa dropdown
    dropdown.innerHTML = "";

    if (finalidade === "Vender" && idVendas) {
        gavetaId = idVendas;
        gavetaSelecionadaSpan.textContent = "Vendas";
        bloquearDropdown(true);
    } else if (finalidade === "Doar" && idDoacao) {
        gavetaId = idDoacao;
        gavetaSelecionadaSpan.textContent = "Doação";
        bloquearDropdown(true);
    } else if (finalidade === "Organizar") {
        gavetaId = null;
        gavetaSelecionadaSpan.textContent = "Selecione uma gaveta.";
        bloquearDropdown(false);

        // Adiciona apenas as gavetas normais no dropdown
        gavetasNormais.forEach(g => {
            const item = document.createElement("div");
            item.classList.add("gaveta-item");
            item.textContent = g.nome;

            item.addEventListener("click", () => {
                gavetaId = g.id;
                gavetaSelecionadaSpan.textContent = g.nome;
                dropdown.style.display = "none";
                renderizarGavetaSelecionada();
            });

            dropdown.appendChild(item);
        });

        // Caso não haja gavetas normais
        if (gavetasNormais.length === 0) {
            dropdown.innerHTML = "<p>Não há gavetas disponíveis para organizar.</p>";
        }
    }

    renderizarGavetaSelecionada();
}

// ============================================================
// MOEDA
// ============================================================
function formatarMoeda(input) {
    let preco = input.value.replace(/\D/g, '');
    if (preco.length === 0) return input.value = "";
    preco = (parseFloat(preco) / 100).toFixed(2) + '';
    preco = preco.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = preco;
}

document.getElementById("preco").addEventListener("input", e => formatarMoeda(e.target));

// ============================================================
// SETUP DOS BOTÕES
// ============================================================
setupOptions('.categoria');
setupOptions('.tamanho');
setupOptions('.finalidade');

// ============================================================
// SUBMIT DA PEÇA
// ============================================================
document.getElementById('formPeca').addEventListener('submit', async (e) => {
    e.preventDefault();

    const finalidade = document.querySelector('.finalidade .selected').textContent;

    // Checagem específica para Organizar
    if (finalidade === "Organizar" && !gavetaId) {
        return alert("Você precisa selecionar uma gaveta para organizar!");
    }

    if (!gavetaId) return alert("Selecione uma gaveta!");

    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const categoria = document.querySelector('.categoria .selected').textContent;
    const tamanho = document.querySelector('.tamanho .selected').textContent;
    const preco = document.getElementById('preco').value;

    const cores = Array.from(document.querySelectorAll('.colors .selected'))
        .map(el => el.dataset.cor)
        .join(", ");

    if (!titulo || !descricao) return alert("Preencha todos os campos.");
    if (finalidade === "Vender" && preco.trim() === "") return alert("Digite um preço.");

    const idPeca = `${uid}_${Date.now()}`;

    await set(ref(database, `pecas/${idPeca}`), {
        ownerUid: uid,
        gavetaUid: gavetaId,
        titulo,
        descricao,
        categoria,
        tamanho,
        finalidade,
        cores,
        preco,
        fotoBase64: imagemBase64 || null,
        dataCadastro: Date.now()
    });

    window.location.href = `../../closet/peca/peca.html?idPeca=${idPeca}`;
});

