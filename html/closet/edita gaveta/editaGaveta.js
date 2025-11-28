import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gavetaId = urlParams.get('idGaveta');
    if (!gavetaId) {
        alert("Gaveta não especificada!");
        window.location.href = "../../closet/closet.html";
        return;
    }

    const nomeInput = document.getElementById('nomeGaveta');
    const btnPrivado = document.getElementById('btnPrivado');
    const btnPublico = document.getElementById('btnPublico');
    const btnAtualizar = document.getElementById('btnAtualizarGaveta');
    let isPrivado = true;

    // Buscar dados da gaveta no Firebase
    try {
        const gavetaRef = ref(database, `gavetas/${gavetaId}`);
        const snapshot = await get(gavetaRef);
        if (!snapshot.exists()) {
            alert("Gaveta não encontrada!");
            window.location.href = "../closet.html";
            return;
        }

        const dados = snapshot.val();

        // Preenche os campos
        nomeInput.value = dados.nome || "";
        isPrivado = dados.privado ?? true;
        if (isPrivado) {
            btnPrivado.classList.add('active');
            btnPublico.classList.remove('active');
        } else {
            btnPublico.classList.add('active');
            btnPrivado.classList.remove('active');
        }

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados da gaveta!");
    }

    // Alterna privacidade
    btnPrivado.addEventListener('click', () => isPrivado = true);
    btnPublico.addEventListener('click', () => isPrivado = false);

    // Atualizar gaveta
    btnAtualizar.addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = nomeInput.value.trim();
        if (!nome) {
            alert("Digite um nome para a gaveta!");
            return;
        }

        try {
            await update(ref(database, `gavetas/${gavetaId}`), {
                nome: nome,
                privado: isPrivado
            });
            alert("Gaveta atualizada com sucesso!");
            window.location.href = `../gaveta/gaveta.html?idGaveta=${gavetaId}`;
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar a gaveta!");
        }
    });
});
