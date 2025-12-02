// produto.js
import { database } from "../../../firebase_connection/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {

    // ---------------- PEGAR ID DA PEÇA ----------------
    const params = new URLSearchParams(window.location.search);
    const idPeca = params.get("idPeca");

    if (!idPeca) {
        console.error("Nenhum idPeca informado.");
        return;
    }

    // ---------------- BUSCAR PEÇA ----------------
    const pecaRef = ref(database, `pecas/${idPeca}`);
    const snapPeca = await get(pecaRef);

    if (!snapPeca.exists()) {
        console.error("Peça não encontrada.");
        return;
    }

    const peca = snapPeca.val();


    // ==========================================================
    // 1) PREENCHER INFORMAÇÕES DA PEÇA
    // ==========================================================

    // Foto da peça (base64)
    document.getElementById("fotoProduto").src =
        peca.fotoBase64 && peca.fotoBase64.startsWith("data:")
            ? peca.fotoBase64
            : peca.fotoBase64
                ? `data:image/png;base64,${peca.fotoBase64}`
                : "../../../img/sem-imagem.png";

    // Título
    document.getElementById("tituloProduto").textContent = peca.titulo || "Sem título";

    // Preço
    const precoFormatado = peca.preco
        ? `R$ ${peca.preco}`
        : "—";
    document.getElementById("precoProduto").textContent = precoFormatado;

    // Descrição
    document.getElementById("descricaoProduto").textContent = peca.descricao || "Sem descrição.";


    // ==========================================================
    // 2) BUSCAR DONO DA PEÇA (ownerUid)
    // ==========================================================

    if (!peca.ownerUid) {
        console.warn("ownerUid não encontrado na peça.");
        return;
    }

    const uid = peca.ownerUid;

    let usuario = null;

    // caminhos possíveis no banco
    const caminhos = [
        `usuarios/pessoaFisica/${uid}`,
        `usuarios/pessoaJuridica/brechos/${uid}`,
        `usuarios/pessoaJuridica/instituicoes/${uid}`
    ];

    for (const caminho of caminhos) {
        const snapUser = await get(ref(database, caminho));
        if (snapUser.exists()) {
            usuario = snapUser.val();
            break;
        }
    }

    if (!usuario) {
        console.warn("Usuário não encontrado.");
        return;
    }


    // ==========================================================
    // 3) PREENCHER INFORMAÇÕES DO USUÁRIO
    // ==========================================================

    // Foto do perfil (base64)
    document.getElementById("fotoPerfilVendedor").src =
        usuario.fotoBase64
            ? `data:image/png;base64,${usuario.fotoBase64}`
            : "../../../img/perfil_padrao.png";

    // Nome completo ou de usuário
    document.getElementById("nomeVendedor").textContent =
        usuario.nomeCompleto || usuario.nomeDeUsuario || "Usuário";

    // @arroba
    document.getElementById("userVendedor").textContent =
        usuario.nomeDeUsuario ? `@${usuario.nomeDeUsuario}` : "@usuario";


    console.log("PEÇA:", peca);
    console.log("USUÁRIO:", usuario);

    // redirecionar para página de compra de peça
    document.getElementById("btn-comprar").addEventListener("click", () => {
        window.location.href = `../compra/compra.html?idPeca=${idPeca}`;
    });
});
