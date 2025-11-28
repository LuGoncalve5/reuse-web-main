// === closet.js ===
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { criarCardGaveta } from './cardGaveta.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("✅ closet.js carregado");

    const section = document.querySelector('section');
    const spinner = document.getElementById('spinner');
    const searchInput = document.getElementById('searchGaveta');

    let listaGavetasCarregadas = [];
    const uid = localStorage.getItem('currentUserUID');

    if (!uid) {
        alert('Erro interno: usuário não identificado.');
        return;
    }

    try {
        // Busca todas as gavetas do usuário
        const gavetasRef = query(ref(database, 'gavetas'), orderByChild('ownerUid'), equalTo(uid));
        const snapshotGavetas = await get(gavetasRef);

        if (!snapshotGavetas.exists()) {
            console.log("Usuário não possui gavetas.");
            if (spinner) spinner.remove();
            return;
        }

        const gavetas = snapshotGavetas.val();

        for (const gavetaId in gavetas) {
            const gaveta = gavetas[gavetaId];

            // --- Contar peças da gaveta ---
            const pecasRef = query(ref(database, 'pecas'), orderByChild('gavetaUid'), equalTo(gavetaId));
            const snapshotPecas = await get(pecasRef);
            const qtdPecas = snapshotPecas.exists() ? Object.keys(snapshotPecas.val()).length : 0;

            // --- Define imagem conforme o nome ---
            let imagemGaveta = '../../img/banco de fotos/body.jpg';
            if (gaveta.nome.toLowerCase() === 'doação' || gaveta.nome.toLowerCase() === 'doacao') {
                imagemGaveta = '../../img/doacaomao.png';
            } else if (gaveta.nome.toLowerCase() === 'vendas') {
                imagemGaveta = '../../img/dinheiro.png';
            }

            // --- Criar card e adicionar no DOM ---
            const card = criarCardGaveta(gavetaId, gaveta.nome, qtdPecas, imagemGaveta);
            section.appendChild(card);

            // --- Armazenar gaveta carregada para pesquisa ---
            listaGavetasCarregadas.push({
                id: gavetaId,
                nome: gaveta.nome.toLowerCase(),
                elemento: card
            });
        }

    } catch (err) {
        console.error('❌ Erro ao carregar gavetas:', err);
    } finally {
        if (spinner) {
            spinner.style.opacity = '0';
            spinner.style.transition = 'opacity 0.5s';
            setTimeout(() => spinner.remove(), 500);
        }
    }

    // Função de pesquisa
    function filtrarGavetas(texto) {
        const busca = texto.toLowerCase();
        listaGavetasCarregadas.forEach(gaveta => {
            gaveta.elemento.style.display = gaveta.nome.includes(busca) ? '' : 'none';
        });
    }

    searchInput.addEventListener('input', () => filtrarGavetas(searchInput.value));
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') filtrarGavetas(searchInput.value); });
});
