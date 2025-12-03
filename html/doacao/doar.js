console.log('✅ doar.js carregado');

import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get, push, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

/* =====================================================
   ELEMENTOS DOM
===================================================== */
const nomeInstituicaoEl = document.querySelector('.instituicao-nome h2');
const userInstituicaoEl = document.querySelector('.instituicao-nome span');
const cepEl = document.querySelector('.instituicao-info div:nth-child(1)');
const cnpjEl = document.querySelector('.instituicao-info div:nth-child(2)');
const productGrid = document.querySelector('.product-grid');
const instituicaoFotoEl = document.querySelector('.profile-photo');
const btnConfirmar = document.querySelector('#btnConfirmarDoacao');

/* =====================================================
   PARAMS / LOCALSTORAGE
===================================================== */
const params = new URLSearchParams(window.location.search);
const idInstituicao = params.get('idInstituicao');
const userUid = localStorage.getItem('currentUserUID');

/* =====================================================
   VARIÁVEL GLOBAL
===================================================== */
let enderecoDestinoDoacao = '';

/* =====================================================
   CARREGAR INSTITUIÇÃO (DADOS BÁSICOS)
===================================================== */
async function carregarInstituicao() {
    if (!idInstituicao) return;

    const snap = await get(
        ref(database, `usuarios/pessoaJuridica/instituicoes/${idInstituicao}`)
    );

    if (!snap.exists()) return;

    const instituicao = snap.val();

    nomeInstituicaoEl.textContent =
        instituicao.nomeCompleto || 'Instituição';

    userInstituicaoEl.textContent =
        instituicao.nomeDeUsuario || '';

    cnpjEl.innerHTML =
        `<strong>CNPJ:</strong> ${instituicao.cnpj || '-'}`;

    // ✅ Foto da instituição (base64 sem prefixo)
    if (instituicao.fotoBase64) {
        instituicaoFotoEl.src =
            `data:image/jpeg;base64,${instituicao.fotoBase64.replace(/\s/g, '')}`;
    }

    // ✅ Apenas para exibição (CEP)
    if (instituicao.endereco) {
        const endSnap = await get(
            ref(database, `enderecos/${instituicao.endereco}`)
        );

        cepEl.innerHTML =
            `<strong>CEP:</strong> ${endSnap.val()?.cep || '-'}`;
    }
}

/* =====================================================
   ENDEREÇO DA DOAÇÃO (VEM DE ANUNCIOS)
===================================================== */
async function carregarEnderecoDoacao() {
    if (!idInstituicao) return;

    const snap = await get(ref(database, 'anuncios'));
    if (!snap.exists()) return;

    for (const anuncio of Object.values(snap.val())) {
        if (
            anuncio.idInstituicao === idInstituicao &&
            anuncio.endereco
        ) {
            enderecoDestinoDoacao = anuncio.endereco;
            break;
        }
    }
}

/* =====================================================
   CARREGAR PEÇAS DO USUÁRIO (SOMENTE DOAÇÃO)
===================================================== */
async function carregarPecasUsuario() {
    if (!userUid) return;

    productGrid.innerHTML = '';

    const snap = await get(ref(database, 'pecas'));
    if (!snap.exists()) {
        productGrid.innerHTML = '<p>Nenhuma peça encontrada.</p>';
        return;
    }

    Object.entries(snap.val()).forEach(([idPeca, peca]) => {
        if (
            peca.ownerUid === userUid &&
            peca.finalidade === 'Doar' &&
            peca.fotoBase64
        ) {
            const card = document.createElement('div');
            card.className = 'product-image-container';
            card.dataset.idPeca = idPeca;

            const img = document.createElement('img');
            img.src =
                `data:image/jpeg;base64,${peca.fotoBase64.replace(/\s/g, '')}`;

            card.appendChild(img);

            // ✅ seleção única
            card.addEventListener('click', () => {
                document
                    .querySelectorAll('.product-image-container')
                    .forEach(c => c.classList.remove('active'));

                card.classList.add('active');
            });

            productGrid.appendChild(card);
        }
    });

    if (!productGrid.children.length) {
        productGrid.innerHTML =
            '<p>Nenhuma peça disponível para doação.</p>';
    }
}

/* =====================================================
   CONFIRMAR DOAÇÃO
===================================================== */
btnConfirmar.addEventListener('click', async () => {

    // ✅ peça selecionada
    const pecaSelecionada =
        document.querySelector('.product-image-container.active');

    if (!pecaSelecionada) {
        alert('Selecione uma peça para realizar a doação.');
        return;
    }

    // ✅ modo de envio selecionado
    const envioSelecionado =
        document.querySelector('input[name="env"]:checked');

    if (!envioSelecionado) {
        alert('Selecione um modo de envio para continuar.');
        return;
    }

    if (!enderecoDestinoDoacao) {
        alert('Endereço da instituição não encontrado.');
        return;
    }

    // ✅ confirmação final
    const confirmar = confirm(
        'Você deseja realmente doar essa peça à instituição?'
    );

    if (!confirmar) return;

    // ✅ objeto salvo no banco
    const novaDoacao = {
        pecaUID: pecaSelecionada.dataset.idPeca,
        doadorUID: userUid,
        instituicaoUID: idInstituicao,
        formaEnvio: envioSelecionado.value,
        enderecoDestino: enderecoDestinoDoacao,
        dataTransacao: new Date().toISOString(),
        status: 'Pendente'
    };

    await push(
        ref(database, 'transacoes/doacao'),
        novaDoacao
    );

    // Atualizar peça para "Reservada"
    const pecaRef = ref(database, `pecas/${novaDoacao.pecaUID}`);
    await update(pecaRef, { finalidade: "Reservada" });

    alert('✅ Doação registrada com sucesso!');
    window.location.href = '../closet/rastreamento/rastreamento.html';
});

/* =====================================================
   UI — OPÇÕES DE ENVIO
===================================================== */
document.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('click', () => {
        document
            .querySelectorAll('.option')
            .forEach(o => o.classList.remove('active'));

        opt.classList.add('active');
        opt.querySelector('input').checked = true;
    });
});

/* =====================================================
   INÍCIO
===================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    await carregarInstituicao();
    await carregarEnderecoDoacao(); // ✅ FUNDAMENTAL
    await carregarPecasUsuario();
});
