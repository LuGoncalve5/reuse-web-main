// editaPeca.js
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

/* ============================================================
    PEGAR ID DA PEÇA DA URL
============================================================ */
const uid = localStorage.getItem('currentUserUID');
const tipoUsuario = localStorage.getItem('currentUserTipo');

const params = new URLSearchParams(window.location.search);
const pecaId = params.get("idPeca");

let dadosOriginais = null;
let novaImagemBase64 = null;

/* ============================================================
    PREVIEW DA IMAGEM
============================================================ */
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        novaImagemBase64 = reader.result;
        previewImg.src = novaImagemBase64;
        previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
});

/* ============================================================
    SELEÇÃO DE OPÇÕES (categoria, tamanho, finalidade)
============================================================ */
function setupOptions(selector) {
    const group = document.querySelectorAll(selector + " .option-btn");

    group.forEach(btn => {
        btn.addEventListener('click', () => {
            group.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            if (selector === ".finalidade") {
                const boxValor = document.getElementById("valor-box");
                const valorInput = document.getElementById("valor");

                if (btn.textContent.trim() === "Vender") {
                    boxValor.style.display = "block";
                } else {
                    boxValor.style.display = "none";
                    valorInput.value = "";
                }
            }
        });
    });
}

setupOptions(".categoria");
setupOptions(".tamanho");
setupOptions(".finalidade");

/* ============================================================
    SELEÇÃO DE COR
============================================================ */
document.querySelectorAll(".color").forEach(c => {
    c.addEventListener("click", () => {
        document.querySelectorAll(".color").forEach(col => col.classList.remove("selected"));
        c.classList.add("selected");
    });
});

/* ============================================================
    CARREGAR DADOS DA PEÇA
============================================================ */
async function carregarPeca() {
    const snap = await get(ref(database, `pecas/${pecaId}`));

    if (!snap.exists()) {
        alert("Peça não encontrada!");
        return;
    }

    dadosOriginais = snap.val();

    // Preencher campos
    document.getElementById("titulo").value = dadosOriginais.titulo || "";
    document.getElementById("descricao").value = dadosOriginais.descricao || "";

    // Categoria
    document.querySelectorAll(".categoria .option-btn").forEach(btn => {
        if (btn.textContent.trim() === dadosOriginais.categoria) {
            btn.classList.add("selected");
        }
    });

    // Tamanho
    document.querySelectorAll(".tamanho .option-btn").forEach(btn => {
        if (btn.textContent.trim() === dadosOriginais.tamanho) {
            btn.classList.add("selected");
        }
    });

    // Finalidade
    document.querySelectorAll(".finalidade .option-btn").forEach(btn => {
        if (btn.textContent.trim() === dadosOriginais.finalidade) {
            btn.classList.add("selected");
        }
    });

    if (dadosOriginais.finalidade === "Vender") {
        document.getElementById("valor-box").style.display = "block";
        document.getElementById("valor").value = dadosOriginais.valor || "";
    }

    // Cor
    document.querySelectorAll(".color").forEach(c => {
        if (c.dataset.cor === dadosOriginais.cor) {
            c.classList.add("selected");
        }
    });

    carregarGavetasEditar(dadosOriginais);
}

carregarPeca();

/* ============================================================
    GAVETAS – CARREGAR E MUDAR
============================================================ */
const gavetaDropdown = document.getElementById("gavetaDropdown");
const gavetaSelect = document.getElementById("gavetaSelect");
const gavetaSelecionadaSpan = document.getElementById("gavetaSelecionada");

let gavetaAtual = null;
let novaGavetaId = null;

function getCaminhoGavetasUsuario() {
    if (tipoUsuario === "pessoaFisica")
        return `usuarios/pessoaFisica/${uid}/gavetas`;

    if (tipoUsuario === "instituicao")
        return `usuarios/pessoaJuridica/instituicoes/${uid}/gavetas`;

    if (tipoUsuario === "brecho")
        return `usuarios/pessoaJuridica/brechos/${uid}/gavetas`;

    return null;
}

async function carregarGavetasEditar(peca) {

    gavetaDropdown.innerHTML = "<p>Carregando...</p>";

    gavetaAtual = peca.idGaveta;
    novaGavetaId = peca.idGaveta;

    const caminho = getCaminhoGavetasUsuario();

    const snap = await get(ref(database, caminho));
    if (!snap.exists()) {
        gavetaDropdown.innerHTML = "<p>Sem gavetas.</p>";
        return;
    }

    const ids = Object.keys(snap.val());
    gavetaDropdown.innerHTML = "";

    for (const id of ids) {
        const gavetaSnap = await get(ref(database, `gavetas/${id}`));
        if (!gavetaSnap.exists()) continue;

        const dado = gavetaSnap.val();

        const item = document.createElement("div");
        item.classList.add("gaveta-item");
        item.textContent = dado.nome;

        if (id === gavetaAtual) {
            item.classList.add("selected-gaveta");
            gavetaSelecionadaSpan.textContent = dado.nome;
        }

        item.addEventListener("click", () => {
            novaGavetaId = id;
            gavetaSelecionadaSpan.textContent = dado.nome;

            document.querySelectorAll(".gaveta-item")
                .forEach(g => g.classList.remove("selected-gaveta"));

            item.classList.add("selected-gaveta");

            gavetaDropdown.style.display = "none";
        });

        gavetaDropdown.appendChild(item);
    }
}

gavetaSelect.addEventListener("click", () => {
    gavetaDropdown.style.display =
        gavetaDropdown.style.display === "block" ? "none" : "block";
});

/* ============================================================
    SALVAR ALTERAÇÕES
============================================================ */
document.getElementById("formEditarPeca").addEventListener("submit", async (e) => {
    e.preventDefault();

    const novoTitulo = document.getElementById("titulo").value.trim();
    const novaDescricao = document.getElementById("descricao").value.trim();
    const novaCategoria = document.querySelector(".categoria .selected")?.textContent.trim();
    const novoTamanho = document.querySelector(".tamanho .selected")?.textContent.trim();
    const novaFinalidade = document.querySelector(".finalidade .selected")?.textContent.trim();
    const novaCor = document.querySelector(".color.selected")?.dataset.cor;
    const novoValor = document.getElementById("valor").value;

    let updates = {};

    if (novoTitulo !== dadosOriginais.titulo) updates.titulo = novoTitulo;
    if (novaDescricao !== dadosOriginais.descricao) updates.descricao = novaDescricao;
    if (novaCategoria !== dadosOriginais.categoria) updates.categoria = novaCategoria;
    if (novoTamanho !== dadosOriginais.tamanho) updates.tamanho = novoTamanho;
    if (novaFinalidade !== dadosOriginais.finalidade) updates.finalidade = novaFinalidade;
    if (novaCor !== dadosOriginais.cor) updates.cor = novaCor;

    if (novaFinalidade === "Vender") {
        if (novoValor !== dadosOriginais.valor) updates.valor = novoValor;
    } else {
        if (dadosOriginais.valor) updates.valor = null;
    }

    if (novaImagemBase64 && novaImagemBase64 !== dadosOriginais.imagem) {
        updates.imagem = novaImagemBase64;
    }

    // Movendo gaveta
    if (novaGavetaId !== gavetaAtual) {
        await set(ref(database, `gavetas/${gavetaAtual}/pecas/${pecaId}`), null);
        await set(ref(database, `gavetas/${novaGavetaId}/pecas/${pecaId}`), true);
        updates.idGaveta = novaGavetaId;
    }

    if (Object.keys(updates).length === 0) {
        alert("Nenhuma alteração feita.");
        return;
    }

    await update(ref(database, `pecas/${pecaId}`), updates);

    alert("Peça atualizada!");
    window.location.href = `../../closet/peca/peca.html?id=${pecaId}`;
});
