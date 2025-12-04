import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// =======================================
// ID DA INSTITUIÇÃO (URL)
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
const descricaoAnuncio = document.getElementById("descricaoAnuncio");
const detalhesAnuncio = document.getElementById("detalhesAnuncio");
const cidadeEstado = document.getElementById("cidadeEstado");
const enderecoEl = document.getElementById("endereco");
const cnpj = document.getElementById("cnpj");
const fazerDoacaoBtn = document.getElementById("fazerDoacao");

// =======================================
// BUSCAR INSTITUIÇÃO
// =======================================
async function carregarInstituicao() {
    const instituicaoRef = ref(
        database,
        `usuarios/pessoaJuridica/instituicoes/${idInstituicao}`
    );

    const snapshot = await get(instituicaoRef);

    if (!snapshot.exists()) {
        console.error("Instituição não encontrada");
        return;
    }

    const instituicao = snapshot.val();

    // FOTO (base64 sem prefixo)
    if (instituicao.fotoBase64) {
        fotoInstituicao.src = `data:image/jpeg;base64,${instituicao.fotoBase64}`;
    }

    // NOME
    nomeInstituicao.textContent =
        instituicao.nomeCompleto || "Instituição";

    // CNPJ
    cnpj.textContent =
        instituicao.cnpj || "CNPJ não informado";

    // ENDEREÇO (vem APENAS pelo ID)
    if (instituicao.endereco) {
        await carregarEndereco(instituicao.endereco);
    } else {
        enderecoEl.textContent = "Endereço não informado";
        cidadeEstado.textContent = "Localização não informada";
    }
}

// =======================================
// BUSCAR ENDEREÇO (cidade, estado, etc)
// =======================================
async function carregarEndereco(idEndereco) {
    const enderecoRef = ref(database, `enderecos/${idEndereco}`);
    const snapshot = await get(enderecoRef);

    if (!snapshot.exists()) {
        enderecoEl.textContent = "Endereço não encontrado";
        cidadeEstado.textContent = "Localização não encontrada";
        return;
    }

    const endereco = snapshot.val();

    // CIDADE / ESTADO
    cidadeEstado.textContent =
        endereco.cidade && endereco.estado
            ? `${endereco.cidade} - ${endereco.estado}`
            : "Localização não informada";

    // ENDEREÇO COMPLETO
    const partesEndereco = [
        endereco.logradouro,
        endereco.numero,
        endereco.bairro,
        endereco.cep
    ].filter(Boolean);

    enderecoEl.textContent = partesEndereco.join(", ");
}

// =======================================
// BUSCAR ANÚNCIO DA INSTITUIÇÃO
// =======================================
async function carregarAnuncio() {
    const anunciosRef = ref(database, "anuncios");
    const snapshot = await get(anunciosRef);

    if (!snapshot.exists()) {
        descricaoAnuncio.textContent = "Nenhuma descrição disponível.";
        detalhesAnuncio.textContent = "Nenhum detalhe disponível.";
        return;
    }

    const anuncios = snapshot.val();
    let encontrou = false;

    Object.values(anuncios).forEach(anuncio => {
        if (anuncio.idInstituicao === idInstituicao && !encontrou) {

            // DESCRIÇÃO CURTA (TOPO)
            descricaoAnuncio.textContent =
                anuncio.breveDescricao || "Sem descrição disponível.";

            // DETALHES (SUBSTITUI 'NOSSA HISTÓRIA')
            detalhesAnuncio.textContent =
                anuncio.detalhes || "Sem detalhes cadastrados.";

            encontrou = true;
        }
    });

    if (!encontrou) {
        descricaoAnuncio.textContent = "Sem anúncio ativo.";
        detalhesAnuncio.textContent =
            "Esta instituição não possui anúncios.";
    }
}

// =======================================
// INICIALIZAÇÃO
// =======================================
document.addEventListener("DOMContentLoaded", async () => {
    await carregarInstituicao();
    await carregarAnuncio();
    fazerDoacaoBtn.onclick = () => {
        window.location.href = `../doar/doar.html?idInstituicao=${idInstituicao}`;
    }
});
