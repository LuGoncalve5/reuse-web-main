// pesquisa_perfil.js
import { database } from "../../../firebase_connection/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// -----------------------------
// 1. PEGAR O ID DA URL
// -----------------------------
const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("idUsuario");

if (!usuarioId) {
    console.error("Nenhum ID encontrado na URL.");
}

// -----------------------------
// 2. CANDIDATOS ÀS ROTAS
// -----------------------------
const rotasPossiveis = [
    `usuarios/pessoaFisica/${usuarioId}`,
    `usuarios/pessoaJuridica/brechos/${usuarioId}`,
    `usuarios/pessoaJuridica/instituicoes/${usuarioId}`
];

async function localizarUsuario() {
    for (const rota of rotasPossiveis) {
        const snapshot = await get(ref(database, rota));
        if (snapshot.exists()) {
            return { rota, dados: snapshot.val() };
        }
    }
    return null;
}

// -----------------------------
// 3. CARREGAR PERFIL
// -----------------------------
async function carregarPerfil() {

    const resultado = await localizarUsuario();

    if (!resultado) {
        console.error("Usuário não encontrado em nenhuma categoria.");
        return;
    }

    const userData = resultado.dados || {};
    const enderecoId = resultado.dados.endereco;

    // Campos básicos
    const nomeDeUsuario = userData.nomeDeUsuario || userData.login || "indefinido";
    const nomeCompleto = userData.nomeCompleto || userData.nome || "Nome não informado";
    const numeroDePecas = userData.numeroDePecas || 0;
    const fotoBase64 = userData.fotoBase64 || null;

    // INSERE OS DADOS
    document.getElementById("nomeDeUsuario").childNodes[0].textContent = `@${nomeDeUsuario} `;
    document.getElementById("nomeCompleto").textContent = nomeCompleto;
    document.getElementById("numeroDePecas").textContent = numeroDePecas;

    if (fotoBase64) {
        document.getElementById("fotoDePerfil").src =
            `data:image/jpeg;base64,${fotoBase64}`;
    }

    // -----------------------------
    // 4. BUSCAR ENDEREÇO NO NÓ /enderecos
    // -----------------------------
    if (enderecoId) {
        const endSnap = await get(ref(database, `enderecos/${enderecoId}`));
        if (endSnap.exists()) {
            const endData = endSnap.val();
            const cidade = endData.cidade || "Cidade";
            const estado = endData.estado || "UF";

            document.getElementById("Cidade-Estado").innerHTML =
                `<i class="bi bi-pin-map"></i> ${cidade} - ${estado}`;
        }
    }
}

// -----------------------------
// 5. CARREGAR CLOSET DO USUÁRIO
// -----------------------------
async function carregarCloset() {

    const closetGrid = document.getElementById("closetGrid");
    closetGrid.innerHTML = "";

    const pecasSnap = await get(ref(database, "pecas"));

    if (!pecasSnap.exists()) {
        closetGrid.innerHTML = "<p>Nenhuma peça encontrada.</p>";
        return;
    }

    const pecas = pecasSnap.val();
    let encontrouAlguma = false;

    Object.entries(pecas).forEach(([pecaId, peca]) => {

        // ✅ NOVO FILTRO CORRETO
        if (peca.ownerUid !== usuarioId) return;

        encontrouAlguma = true;

        const isVenda = peca.status === "venda";
        const isDoacao = peca.status === "doacao";

        const card = document.createElement("a");
        card.href = "#";
        card.classList.add("closet-card");

        if (isVenda) card.classList.add("status-venda");
        if (isDoacao) card.classList.add("status-doacao");

        card.innerHTML = `
            <div class="closet-image-container">
                <img src="${
                    peca.fotoBase64
                        ? `data:image/jpeg;base64,${peca.fotoBase64}`
                        : "../../../img/sem-foto.png"
                }">

                ${isVenda ? `
                    <div class="status-badge">
                        <i class="bi bi-tag"></i> Venda
                    </div>` : ""}

                ${isDoacao ? `
                    <div class="status-badge">
                        <i class="bi bi-gift-fill"></i> Doação
                    </div>` : ""}
            </div>

            <div class="closet-details">
                ${isVenda
                    ? `<p class="closet-price">R$ ${peca.preco}</p>`
                    : `<p class="closet-price status-text">Para Doação</p>`}
                <h4 class="closet-title">${peca.titulo}</h4>
            </div>
        `;

        closetGrid.appendChild(card);
    });

    // ✅ Feedback visual se não houver peças
    if (!encontrouAlguma) {
        closetGrid.innerHTML = "<p>Este usuário ainda não possui peças cadastradas.</p>";
    }
}

// -----------------------------
// 6. CONTROLE DAS ABAS (SPA)
// -----------------------------
const btns = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".section-page");

btns.forEach(btn => {
    btn.addEventListener("click", async () => {

        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        sections.forEach(sec => sec.classList.remove("section-active"));
        document
            .getElementById(btn.dataset.target)
            .classList.add("section-active");

        if (btn.dataset.target === "closet") {
            await carregarCloset();
        }
    });
});

carregarPerfil();
