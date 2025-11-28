//editaPeca.js
import { database } from "../../../firebase_connection/firebaseConfig.js";
import { ref, get, set, update, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

/* ============================================================
    VARIÁVEIS
============================================================ */
const uid = localStorage.getItem("currentUserUID");
const params = new URLSearchParams(window.location.search);
const pecaId = params.get("idPeca");

let dadosOriginais = null;
let novaImagemBase64 = null;
let gavetaAtual = null;
let novaGavetaId = null;

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
    BOTÕES DE OPÇÃO (categoria, tamanho, finalidade)
============================================================ */
function ativarGrupo(selector) {
    const botoes = document.querySelectorAll(selector + " .option-btn");

    botoes.forEach(btn => {
        btn.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            if (selector === ".finalidade") {
                const box = document.getElementById("preco-box");
                box.style.display = btn.textContent.trim() === "Vender" ? "block" : "none";

                // Aplica regra da gaveta
                aplicarRegraFinalidadeGaveta(btn.textContent.trim());
            }
        });
    });
}

ativarGrupo(".categoria");
ativarGrupo(".tamanho");
ativarGrupo(".finalidade");

/* ============================================================
    CORES MÚLTIPLAS (até 3)
============================================================ */
const colorButtons = [...document.querySelectorAll(".color")];
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
            selectedColors = selectedColors.filter(c => c !== cor);
        } else {
            if (selectedColors.length >= maxCores) {
                selectedColors.shift(); // remove a primeira
            }
            selectedColors.push(cor);
        }

        renderizarCoresSelecionadas();
    });
});

/* ============================================================
    CARREGAR A PEÇA
============================================================ */
async function carregarPeca() {
    const snap = await get(ref(database, `pecas/${pecaId}`));

    if (!snap.exists()) {
        alert("Peça não encontrada.");
        return;
    }

    dadosOriginais = snap.val();

    document.getElementById("titulo").value = dadosOriginais.titulo || "";
    document.getElementById("descricao").value = dadosOriginais.descricao || "";
    document.getElementById("preco").value = dadosOriginais.preco || "";

    if (dadosOriginais.fotoBase64) {
        previewImg.src = dadosOriginais.fotoBase64;
        previewImg.style.display = "block";
    }

    // selecionar categoria, tamanho, finalidade
    document.querySelectorAll(".categoria .option-btn")
        .forEach(b => b.textContent.trim() === dadosOriginais.categoria && b.classList.add("selected"));

    document.querySelectorAll(".tamanho .option-btn")
        .forEach(b => b.textContent.trim() === dadosOriginais.tamanho && b.classList.add("selected"));

    document.querySelectorAll(".finalidade .option-btn")
        .forEach(b => b.textContent.trim() === dadosOriginais.finalidade && b.classList.add("selected"));

    if (dadosOriginais.finalidade === "Vender") {
        document.getElementById("preco-box").style.display = "block";
    }

    // cores
    selectedColors = (dadosOriginais.cores || "")
        .split(",")
        .map(c => c.trim())
        .filter(c => c !== "");
    renderizarCoresSelecionadas();

    // gavetas
    gavetaAtual = dadosOriginais.gavetaUid;
    novaGavetaId = dadosOriginais.gavetaUid;

    await carregarGavetas();

    // Aplica regra da finalidade ao carregar
    aplicarRegraFinalidadeGaveta(dadosOriginais.finalidade);
}

carregarPeca();

/* ============================================================
    CARREGAR GAVETAS DO USUÁRIO (usando ownerUid)
============================================================ */
const gavetaDropdown = document.getElementById("gavetaDropdown");
const gavetaSelecionadaSpan = document.getElementById("gavetaSelecionada");
const gavetaSelect = document.getElementById("gavetaSelect");

async function carregarGavetas() {
    gavetaDropdown.innerHTML = "<p>Carregando...</p>";

    const q = query(
        ref(database, "gavetas"),
        orderByChild("ownerUid"),
        equalTo(uid)
    );

    const snap = await get(q);

    if (!snap.exists()) {
        gavetaDropdown.innerHTML = "<p>Você não possui gavetas.</p>";
        return;
    }

    gavetaDropdown.innerHTML = "";

    snap.forEach(s => {
        const id = s.key;
        const gaveta = s.val();

        // Ignora as gavetas "Doação" e "Vendas"
        if (gaveta.nome === "Doação" || gaveta.nome === "Vendas") return;

        const item = document.createElement("div");
        item.classList.add("gaveta-item");
        item.textContent = gaveta.nome;

        if (id === gavetaAtual) {
            item.classList.add("selected-gaveta");
            gavetaSelecionadaSpan.textContent = gaveta.nome;
        }

        item.addEventListener("click", () => {
            novaGavetaId = id;
            gavetaSelecionadaSpan.textContent = gaveta.nome;

            document.querySelectorAll(".gaveta-item")
                .forEach(i => i.classList.remove("selected-gaveta"));

            item.classList.add("selected-gaveta");
            gavetaDropdown.style.display = "none";
        });

        gavetaDropdown.appendChild(item);
    });
}

gavetaSelect.addEventListener("click", () => {
    gavetaDropdown.style.display =
        gavetaDropdown.style.display === "block" ? "none" : "block";
});

/* ============================================================
    FINALIDADE ↔ GAVETA + BLOQUEIO
============================================================ */
async function aplicarRegraFinalidadeGaveta(finalidade) {
    const q = query(ref(database, "gavetas"), orderByChild("ownerUid"), equalTo(uid));
    const snap = await get(q);
    if (!snap.exists()) return;

    let idVendas = null;
    let idDoacao = null;

    snap.forEach(s => {
        const g = s.val();
        const nome = g.nome.toLowerCase();
        if (nome === "vendas") idVendas = s.key;
        if (nome === "doação" || nome === "doacao") idDoacao = s.key;
    });

    if (finalidade === "Vender" && idVendas) {
        novaGavetaId = idVendas;
        gavetaSelecionadaSpan.textContent = "Vendas";
        bloquearDropdown(true);
    } 
    else if (finalidade === "Doar" && idDoacao) {
        novaGavetaId = idDoacao;
        gavetaSelecionadaSpan.textContent = "Doação";
        bloquearDropdown(true);
    } 
    else if (finalidade === "Organizar") {
        novaGavetaId = null;               // limpa a gaveta selecionada
        gavetaSelecionadaSpan.textContent = "Selecione uma gaveta";
        bloquearDropdown(false);
    }

    // Atualiza seleção no dropdown visível
    document.querySelectorAll(".gaveta-item").forEach(i => {
        i.classList.remove("selected-gaveta");
        if (i.textContent === gavetaSelecionadaSpan.textContent) {
            i.classList.add("selected-gaveta");
        }
    });
}


function bloquearDropdown(bloquear) {
    if (bloquear) {
        gavetaSelect.style.opacity = "0.5";
        gavetaSelect.style.pointerEvents = "none";
        gavetaDropdown.style.display = "none";
    } else {
        gavetaSelect.style.opacity = "1";
        gavetaSelect.style.pointerEvents = "auto";
    }
}

/* ============================================================
    SALVAR ALTERAÇÕES
============================================================ */
document.getElementById("formEditarPeca").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updates = {};
    const novoTitulo = document.getElementById("titulo").value.trim();
    const novaDescricao = document.getElementById("descricao").value.trim();
    const novaCategoria = document.querySelector(".categoria .selected")?.textContent.trim();
    const novoTamanho = document.querySelector(".tamanho .selected")?.textContent.trim();
    const novaFinalidade = document.querySelector(".finalidade .selected")?.textContent.trim();
    const novopreco = document.getElementById("preco").value;

    if (novoTitulo !== dadosOriginais.titulo) updates.titulo = novoTitulo;
    if (novaDescricao !== dadosOriginais.descricao) updates.descricao = novaDescricao;
    if (novaCategoria !== dadosOriginais.categoria) updates.categoria = novaCategoria;
    if (novoTamanho !== dadosOriginais.tamanho) updates.tamanho = novoTamanho;
    if (novaFinalidade !== dadosOriginais.finalidade) updates.finalidade = novaFinalidade;

    const coresString = selectedColors.join(", ");
    if (coresString !== (dadosOriginais.cores || "")) updates.cores = coresString;

    if (novaFinalidade === "Vender" && novopreco === "") {
        return alert("Por favor, insira um preço para vender.");
    }

    if (novaFinalidade === "Organizar" && !novaGavetaId) {
        return alert("Você precisa selecionar uma gaveta para organizar!");
    }

    // Atualiza preço apenas se for vender
    if (novaFinalidade === "Vender") {
        updates.preco = novopreco;
    } else {
        updates.preco = "";
    }

    if (novaImagemBase64) updates.fotoBase64 = novaImagemBase64;

    if (novaGavetaId !== gavetaAtual) {
        await set(ref(database, `gavetas/${gavetaAtual}/pecas/${pecaId}`), null);
        await set(ref(database, `gavetas/${novaGavetaId}/pecas/${pecaId}`), true);
        updates.gavetaUid = novaGavetaId;
    }

    await update(ref(database, `pecas/${pecaId}`), updates);

    alert("Peça atualizada!");
    window.location.href = `../peca/peca.html?idPeca=${pecaId}`;
});
