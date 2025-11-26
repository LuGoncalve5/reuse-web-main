// pesquisa.js
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

import { criarCardUsuario } from './cards/cardUsuario.js';
import { criarCardPecaVenda } from './cards/cardPecaVenda.js';

// containers
const containerUsuarios = document.querySelector("#page-usuarios .user-list");
const containerBrechos  = document.querySelector("#page-brechos .user-list");
const containerVendas   = document.querySelector("#page-vendas .product-grid");

// ============================
// BUSCA USUÁRIOS PF
// ============================
async function carregarUsuarios() {
    containerUsuarios.innerHTML = "";

    const snapshot = await get(ref(database, "usuarios/pessoaFisica"));

    if (!snapshot.exists()) return;

    Object.entries(snapshot.val()).forEach(([id, dados]) => {
        const card = criarCardUsuario({
            id,
            nomeDeUsuario: dados.nomeDeUsuario,
            arroba: dados.arroba,
            fotoDePerfil: dados.fotoDePerfil
        });

        containerUsuarios.appendChild(card);
    });
}

// ============================
// BUSCA BRECHÓS
// ============================
async function carregarBrechos() {
    containerBrechos.innerHTML = "";

    const snapshot = await get(ref(database, "usuarios/pessoaJuridica/brechos"));

    if (!snapshot.exists()) return;

    Object.entries(snapshot.val()).forEach(([id, dados]) => {
        const card = criarCardUsuario({
            id,
            nomeDeUsuario: dados.nomeDeUsuario,
            arroba: dados.arroba,
            fotoDePerfil: dados.fotoDePerfil
        });

        containerBrechos.appendChild(card);
    });
}

// ============================
// BUSCA VENDAS
// ============================
async function carregarVendas() {
    containerVendas.innerHTML = "";

    const snapshot = await get(ref(database, "pecas"));

    if (!snapshot.exists()) return;

    Object.entries(snapshot.val()).forEach(([id, dados]) => {
        const card = criarCardPecaVenda({
            id,
            imagem: dados.imagem,
            valor: dados.valor,
            titulo: dados.titulo,
            descricao: dados.descricao
        });

        containerVendas.appendChild(card);
    });
}

// ============================
// CONTROLE DE ABAS
// ============================
function abrirAba(tab) {
    document.querySelectorAll(".spa-page").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

    document.getElementById(`page-${tab}`).classList.add("active");
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add("active");

    if (tab === "usuarios") carregarUsuarios();
    if (tab === "brechos")  carregarBrechos();
    if (tab === "vendas")   carregarVendas();

    location.hash = tab;
}

// ============================
// INIT
// ============================
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => abrirAba(btn.dataset.tab));
});

window.addEventListener("load", () => {
    const tab = location.hash.replace("#", "") || "usuarios";
    abrirAba(tab);
});
