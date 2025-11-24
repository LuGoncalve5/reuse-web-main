// === closet.js ===
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { criarCardGaveta } from './cardGaveta.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("✅ closet.js carregado");

    const section = document.querySelector('section');
    const spinner = document.getElementById('spinner');
    const searchInput = document.getElementById('searchGaveta'); // campo de pesquisa

    let listaGavetasCarregadas = [];  // armazenar gavetas já carregadas

    const uid = localStorage.getItem('currentUserUID');
    const tipoUsuario = localStorage.getItem('currentUserTipo');

    if (!uid || !tipoUsuario) {
        alert('Erro interno: usuário não identificado.');
        return;
    }

    try {
        // --- Seleciona o caminho correto do usuário ---
        let usuarioRef;
        switch (tipoUsuario) {
            case 'pessoaFisica':
                usuarioRef = ref(database, `usuarios/pessoaFisica/${uid}`);
                break;
            case 'instituicao':
                usuarioRef = ref(database, `usuarios/pessoaJuridica/instituicoes/${uid}`);
                break;
            case 'brecho':
                usuarioRef = ref(database, `usuarios/pessoaJuridica/brechos/${uid}`);
                break;
            default:
                throw new Error('Tipo de usuário desconhecido.');
        }

        // --- Busca nó do usuário ---
        const snapshotUsuario = await get(usuarioRef);
        if (!snapshotUsuario.exists()) {
            console.log("Usuário não encontrado no banco.");
            if (spinner) spinner.remove();
            return;
        }

        const dadosUsuario = snapshotUsuario.val();
        const gavetasUsuario = dadosUsuario.gavetas || {};

        if (Object.keys(gavetasUsuario).length === 0) {
            console.log("Usuário sem gavetas.");
            if (spinner) spinner.remove();
            return;
        }

        // --- Carrega gavetas do Firebase ---
        for (const gavetaId in gavetasUsuario) {
            const gavetaRef = ref(database, `gavetas/${gavetaId}`);
            const snapshotGaveta = await get(gavetaRef);

            if (snapshotGaveta.exists()) {
                const gaveta = snapshotGaveta.val();
                const qtdPecas = gaveta.pecas ? Object.keys(gaveta.pecas).length : 0;

                // --- Define imagem conforme o nome ---
                let imagemGaveta = '../../img/banco de fotos/body.jpg';

                if (gaveta.nome.toLowerCase() === 'doação' || gaveta.nome.toLowerCase() === 'doacao') {
                    imagemGaveta = '../../img/doacaomao.png';
                }
                else if (gaveta.nome.toLowerCase() === 'vendas') {
                    imagemGaveta = '../../img/dinheiro.png';
                }

                // --- Criar card e adicionar no DOM ---
                const card = criarCardGaveta(gavetaId, gaveta.nome, qtdPecas, imagemGaveta);
                section.appendChild(card);

                // --- Armazenar gaveta carregada ---
                listaGavetasCarregadas.push({
                    id: gavetaId,
                    nome: gaveta.nome.toLowerCase(), // facilita pesquisa
                    elemento: card
                });
            }
        }

    } catch (err) {
        console.error('❌ Erro ao carregar gavetas:', err);
    } finally {
        // --- Remove spinner suavemente ---
        if (spinner) {
            spinner.style.opacity = '0';
            spinner.style.transition = 'opacity 0.5s';
            setTimeout(() => spinner.remove(), 500);
        }
    }

    // ======================================================================
    // 🔎 FUNÇÃO DE PESQUISA
    // ======================================================================

    function filtrarGavetas(texto) {
        const busca = texto.toLowerCase();

        listaGavetasCarregadas.forEach(gaveta => {
            // mostra somente gavetas que contenham o texto digitado
            if (gaveta.nome.includes(busca)) {
                gaveta.elemento.style.display = '';
            } else {
                gaveta.elemento.style.display = 'none';
            }
        });
    }

    // --- evento ao digitar (opcional: pesquisa dinâmica) ---
    searchInput.addEventListener('input', () => {
        filtrarGavetas(searchInput.value);
    });

    // --- evento ao apertar Enter ---
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            filtrarGavetas(searchInput.value);
        }
    });
});
