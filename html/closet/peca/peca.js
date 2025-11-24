// peca.js
import { database } from "../../../firebase_connection/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {

    // ====== PEGAR ID DA URL ======
    const params = new URLSearchParams(window.location.search);
    const idPeca = params.get("idPeca");

    if (!idPeca) {
        console.error("Nenhum idPeca informado na URL");
        return;
    }

    // ====== BUSCAR PEÇA NO BANCO ======
    const pecaRef = ref(database, `pecas/${idPeca}`);
    const snapshot = await get(pecaRef);

    if (!snapshot.exists()) {
        console.error("Peça não encontrada no banco");
        return;
    }

    const peca = snapshot.val();

    // ====== PREENCHER TELA ======
    document.getElementById("tituloPeca").textContent = peca.titulo;
    document.getElementById("descricaoPeca").textContent = peca.descricao;
    document.getElementById("categoriaPeca").textContent = peca.categoria;
    document.getElementById("finalidadePeca").textContent = peca.finalidade;
    document.getElementById("tamanhoPeca").textContent = peca.tamanho;

    // Imagem
    if (peca.imagem) {
        document.getElementById("imagemPeca").src = peca.imagem;
    }

    // ====== COR (gera bolinha) ======
    const corDiv = document.getElementById("corPecaList");
    corDiv.innerHTML = ""; // limpa antes

    if (peca.cor) {
        const cor = document.createElement("div");
        cor.classList.add("color");
        cor.style.background = peca.cor;  
        corDiv.appendChild(cor);
    }

    // ====== BOTÃO EDITAR ======
    document.getElementById("editarPecaBtn").addEventListener("click", () => {
        window.location.href = `../edita peca/editaPeca.html?idPeca=${idPeca}`;
    });

});
