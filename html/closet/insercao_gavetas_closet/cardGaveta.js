// === cardGaveta.js ===
// Função que cria e retorna o HTML de um card de gaveta
import { ref, remove } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { database } from '../../../firebase_connection/firebaseConfig.js';

export function criarCardGaveta(gavetaId, nomeGaveta, qtdRoupas = 0, img = "../../img/banco de fotos/body.jpg") {
    const card = document.createElement('div');
    card.classList.add('card');
    card.style.position = 'relative'; // necessário para posicionar o menu
    card.style.cursor = 'pointer';

    // Monta conteúdo interno
    card.innerHTML = `
        <img src="${img}" alt="${nomeGaveta}">
        <div class="paragrafo">
            <p>${nomeGaveta}</p>
            <p>${qtdRoupas}</p>
        </div>

        <!-- Menu de três pontinhos -->
        <div class="card-menu">
            <i class="bi bi-three-dots-vertical"></i>
            <div class="menu-options">
                <a href="#" class="editar-gaveta"><i class="bi bi-pencil"></i> Editar</a>
                <a href="#" class="apagar-gaveta"><i class="bi bi-trash"></i> Apagar</a>
            </div>
        </div>
    `;

    // Botão de menu
    const menu = card.querySelector('.card-menu');
    const menuOptions = card.querySelector('.menu-options');

    menu.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', () => {
        menu.classList.remove('active');
    });

    // Opção Editar
    card.querySelector('.editar-gaveta').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `edita gaveta/editaGaveta.html?idGaveta=${gavetaId}`;
    });

    // Opção Apagar
    card.querySelector('.apagar-gaveta').addEventListener('click', async (e) => {
        e.preventDefault();
        const confirmar = confirm("Você tem certeza que deseja apagar esta gaveta?");
        if (confirmar) {
            try {
                await remove(ref(database, `gavetas/${gavetaId}`));
                alert('Gaveta apagada com sucesso!');
                card.remove(); // remove do DOM
            } catch (error) {
                console.error("Erro ao apagar gaveta:", error);
                alert('Não foi possível apagar a gaveta.');
            }
        }
    });

    // Define o comportamento de clique no card (fora do menu)
    card.addEventListener('click', (e) => {
        // impede que clique no menu dispare a navegação
        if (!e.target.closest('.card-menu')) {
            window.location.href = `gaveta/gaveta.html?idGaveta=${gavetaId}`;
        }
    });

    return card;
}
