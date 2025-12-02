import { database } from '../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// =======================================
// PEGAR ID DA INSTITUIÇÃO DA URL
// =======================================
const params = new URLSearchParams(window.location.search);
const idInstituicao = params.get("idInstituicao");

if (!idInstituicao) {
    console.error("ID da instituição não encontrado na URL");
}

// =======================================
// ELEMENTOS
// =======================================
const fotoInstituicao = document.getElementById("fotoInstituicao");
const nomeInstituicao = document.getElementById("nomeInstituicao");
const descricaoInstituicao = document.getElementById("descricaoInstituicao");
const detalhesAnuncio = document.getElementById("detalhesAnuncio");

// =======================================
// BUSCAR INSTITUIÇÃO
// =======================================
async function carregarInstituicao() {
    const instituicaoRef = ref(database, `instituicoes/${idInstituicao}`);
    const snapshot = await get(instituicaoRef);

    if (!snapshot.exists()) {
        console.error("Instituição não encontrada");
        return;
    }

    const instituicao = snapshot.val();

    // FOTO (base64 SEM PREFIXO)
    if (instituicao.fotoBase64) {
        fotoInstituicao.src =
            `data:image/jpeg;base64,${instituicao.fotoBase64}`;
    }

    nomeInstituicao.textContent = instituicao.nomeCompleto || "Instituição";
    descricaoInstituicao.textContent =
        instituicao.descricao || "Sem descrição disponível";
}

// =======================================
// BUSCAR ANÚNCIOS DA INSTITUIÇÃO
// =======================================
async function carregarAnuncios() {
    const anunciosRef = ref(database, "anuncios");
    const snapshot = await get(anunciosRef);

    if (!snapshot.exists()) {
        detalhesAnuncio.textContent = "Nenhum anúncio encontrado.";
        return;
    }

    const anuncios = snapshot.val();

    let descricoes = [];

    Object.values(anuncios).forEach(anuncio => {
        if (anuncio.idInstituicao === idInstituicao) {
            if (anuncio.breveDescricao) {
                descricoes.push(`• ${anuncio.breveDescricao}`);
            }
        }
    });

    detalhesAnuncio.textContent =
        descricoes.length > 0
            ? descricoes.join("\n")
            : "Nenhum anúncio cadastrado para esta instituição.";
}

// =======================================
// INICIALIZAÇÃO
// =======================================
document.addEventListener("DOMContentLoaded", async () => {
    await carregarInstituicao();
    await carregarAnuncios();
});
