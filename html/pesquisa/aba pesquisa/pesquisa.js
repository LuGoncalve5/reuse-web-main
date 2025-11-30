// pesquisa.js
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

import { criarCardUsuario } from './cards/cardUsuario.js';
import { criarCardPecaVenda } from './cards/cardPecaVenda.js';

// ============================
// ELEMENTOS
// ============================
const containerUsuarios = document.querySelector("#page-usuarios .user-list");
const containerBrechos  = document.querySelector("#page-brechos .user-list");
const containerVendas   = document.querySelector("#page-vendas .product-grid");
const inputBusca        = document.querySelector("#input-busca");

// ============================
// CACHE (evita buscar no Firebase toda hora)
// ============================
let cacheUsuarios = [];
let cacheBrechos  = [];
let cacheVendas   = [];
let abaAtual      = "usuarios";

// ============================
// USUÁRIOS PF
// ============================
async function carregarUsuarios() {
    containerUsuarios.innerHTML = "";

    if (cacheUsuarios.length === 0) {
        const snapshot = await get(ref(database, "usuarios/pessoaFisica"));
        if (!snapshot.exists()) return;

        cacheUsuarios = Object.entries(snapshot.val()).map(([id, dados]) => ({
            id,
            nomeCompleto: dados.nomeCompleto,
            nomeDeUsuario: dados.nomeDeUsuario,
            fotoBase64: dados.fotoBase64
        }));
    }

    renderUsuarios(cacheUsuarios);
}

function renderUsuarios(lista) {
    containerUsuarios.innerHTML = "";

    lista.forEach(user => {
        const card = criarCardUsuario({
            id: user.id,
            nomeCompleto: user.nomeCompleto,
            nomeDeUsuario: user.nomeDeUsuario,
            fotoDePerfil: user.fotoBase64 
                ? `data:image/png;base64,${user.fotoBase64}`
                : '../../../img/perfil_default.png'
        });

        containerUsuarios.appendChild(card);
    });
}

// ============================
// BRECHÓS
// ============================
async function carregarBrechos() {
    containerBrechos.innerHTML = "";

    if (cacheBrechos.length === 0) {
        const snapshot = await get(ref(database, "usuarios/pessoaJuridica/brechos"));
        if (!snapshot.exists()) return;

        cacheBrechos = Object.entries(snapshot.val()).map(([id, dados]) => ({
            id,
            nomeCompleto: dados.nomeCompleto,
            nomeDeUsuario: dados.nomeDeUsuario,
            fotoDePerfil: dados.fotoBase64
        }));
    }

    renderBrechos(cacheBrechos);
}

function renderBrechos(lista) {
    containerBrechos.innerHTML = "";

    lista.forEach(brecho => {
        const card = criarCardUsuario({
            id: brecho.id,
            nomeCompleto: brecho.nomeCompleto,
            nomeDeUsuario: brecho.nomeDeUsuario,
            fotoDePerfil: brecho.fotoBase64 
                ? `data:image/png;base64,${brecho.fotoBase64}`
                : '../../../img/perfil_default.png'
        });

        containerBrechos.appendChild(card);
    });
}

// ============================
// VENDAS
// ============================
async function carregarVendas() {
    containerVendas.innerHTML = "";
    const uidLogado = localStorage.getItem('currentUserUID');

    if (cacheVendas.length === 0) {
        const snapshot = await get(ref(database, "pecas"));
        if (!snapshot.exists()) return;

        cacheVendas = Object.entries(snapshot.val())
            .filter(([id, dados]) => dados.finalidade === "Vender" && dados.ownerUid !== uidLogado)
            .map(([id, dados]) => ({
                id,
                titulo: dados.titulo,
                descricao: dados.descricao,
                preco: dados.preco,
                imagem: dados.fotoBase64 
                    ? `data:image/png;base64,${dados.fotoBase64}`
                    : '../../../img/perfil_default.png',
                ownerUid: dados.ownerUid
            }));
    }

    renderVendas(cacheVendas);
}

function renderVendas(lista) {
    containerVendas.innerHTML = "";

    lista.forEach(produto => {
        const card = criarCardPecaVenda(produto);
        containerVendas.appendChild(card);
    });
}

// ============================
// BUSCA DINÂMICA (DEPENDE DA ABA)
// ============================
function aplicarBusca(valor) {
    const termo = valor.toLowerCase();

    if (abaAtual === "usuarios") {
        renderUsuarios(
            cacheUsuarios.filter(u =>
                u.nomeCompleto.toLowerCase().includes(termo) ||
                u.nomeDeUsuario.toLowerCase().includes(termo)
            )
        );
    }

    if (abaAtual === "brechos") {
        renderBrechos(
            cacheBrechos.filter(b =>
                b.nomeCompleto.toLowerCase().includes(termo) ||
                b.nomeDeUsuario.toLowerCase().includes(termo)
            )
        );
    }

    if (abaAtual === "vendas") {
        renderVendas(
            cacheVendas.filter(v =>
                v.titulo.toLowerCase().includes(termo)
            )
        );
    }
}

// ============================
// CONTROLE DE ABAS (SPA)
// ============================
function abrirAba(tab) {
    abaAtual = tab;
    inputBusca.value = "";

    document.querySelectorAll(".spa-page").forEach(sec =>
        sec.classList.remove("active")
    );

    document.querySelectorAll(".tab-btn").forEach(btn =>
        btn.classList.remove("active")
    );

    document.getElementById(`page-${tab}`).classList.add("active");
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add("active");

    if (tab === "usuarios") carregarUsuarios();
    if (tab === "brechos")  carregarBrechos();
    if (tab === "vendas")   carregarVendas();

    location.hash = tab;
}

// ============================
// EVENTOS
// ============================
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => abrirAba(btn.dataset.tab));
});

inputBusca.addEventListener("input", e => {
    aplicarBusca(e.target.value);
});

window.addEventListener("load", () => {
    const tab = location.hash.replace("#", "") || "usuarios";
    abrirAba(tab);
});
