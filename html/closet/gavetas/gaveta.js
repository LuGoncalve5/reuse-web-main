// === GAVETA.JS ===
// Importa Firebase
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("gaveta.js carregado");

    // Recupera ID da gaveta a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const gavetaId = urlParams.get('id');

    if (!gavetaId) {
        alert('Gaveta não encontrada. Voltando ao closet...');
        window.location.href = '../closet.html';
        return;
    }

    console.log("Gaveta selecionada:", gavetaId);

    try {
        // Busca os dados da gaveta no Realtime Database
        const gavetaRef = ref(database, `gavetas/${gavetaId}`);
        const snapshot = await get(gavetaRef);

        if (!snapshot.exists()) {
            alert('Gaveta não encontrada no banco de dados.');
            window.location.href = '../closet.html';
            return;
        }

        const dadosGaveta = snapshot.val();
        console.log("Dados da gaveta:", dadosGaveta);

        // Atualiza título e nome na página
        const titulo = document.querySelector('title');
        const cabecalho = document.querySelector('.topbar-container h1');

        if (titulo) titulo.textContent = dadosGaveta.nomeGaveta || 'Minha Gaveta';
        if (cabecalho) cabecalho.textContent = dadosGaveta.nomeGaveta || 'Minha Gaveta';

        // mostrar se é pública ou privada
        if (dadosGaveta.privado) {
            console.log("Gaveta privada");
        } else {
            console.log("Gaveta pública");
        }

    } catch (error) {
        console.error("Erro ao carregar gaveta:", error);
        alert('Erro ao carregar a gaveta. Tente novamente.');
        window.location.href = '../closet.html';
    }
});