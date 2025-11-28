// peca.js
import { database } from "../../../firebase_connection/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {

    // ID da peça
    const params = new URLSearchParams(window.location.search);
    const idPeca = params.get("idPeca");

    if (!idPeca) {
        console.error("Nenhum idPeca informado na URL");
        return;
    }

    // Buscar peça
    const pecaRef = ref(database, `pecas/${idPeca}`);
    const snapshot = await get(pecaRef);

    if (!snapshot.exists()) {
        console.error("Peça não encontrada no banco");
        return;
    }

    const peca = snapshot.val();

    // Preencher textos
    document.getElementById("tituloPeca").textContent = peca.titulo;
    document.getElementById("descricaoPeca").textContent = peca.descricao;
    document.getElementById("categoriaPeca").textContent = peca.categoria;
    document.getElementById("finalidadePeca").textContent = peca.finalidade;
    document.getElementById("tamanhoPeca").textContent = peca.tamanho;

    // Preço (somente se for venda)
    const precoSpan = document.getElementById("precoPeca");
    if (peca.finalidade === "Vender") {
        if (precoSpan) precoSpan.textContent = "R$ " + (peca.preco || peca.valor || "0,00");
    } else {
        if (precoSpan) precoSpan.parentElement.style.display = "none";
    }

    // Imagem
    if (peca.fotoBase64) {
        document.getElementById("imagemPeca").src = peca.fotoBase64;
    }

    /* ============================================================
        CORES (múltiplas)
        peca.cores = "white, red, blue"
    ============================================================ */
    const corDiv = document.getElementById("corPecaList");
    corDiv.innerHTML = "";  // limpar antes

    if (peca.cores) {
        const listaCores = peca.cores
            .split(",")
            .map(c => c.trim())
            .filter(c => c !== "");

        listaCores.forEach(cor => {
            const circle = document.createElement("div");
            circle.classList.add("color");
            circle.style.background = cor;
            circle.setAttribute("data-cor", cor);
            corDiv.appendChild(circle);
        });
    }

    /* ============================================================
        BOTÃO EDITAR
    ============================================================ */
    document.getElementById("editarPecaBtn").addEventListener("click", () => {
        window.location.href = `../edita peca/editaPeca.html?idPeca=${idPeca}`;
    });

    /* ============================================================
        BOTÃO DELETAR PEÇA
    ============================================================ */
    document.getElementById("deletarPecaBtn").addEventListener("click", async () => {

        const confirmacao = confirm("Você tem certeza que deseja apagar esta peça?");

        if (!confirmacao) return;

        try {
            await remove(ref(database, `pecas/${idPeca}`));
            alert("Peça apagada com sucesso!");
            window.location.href = "../../closet/closet.html";
        } catch (error) {
            console.error("Erro ao deletar peça:", error);
            alert("Erro ao apagar a peça.");
        }
    });

});
