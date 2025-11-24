// === cardGaveta.js ===
// Função que cria e retorna o HTML de um card de gaveta
export function criarCardGaveta(gavetaId, nomeGaveta, qtdRoupas = 0, img = "../../img/banco de fotos/body.jpg") {
    const card = document.createElement('div');
    card.classList.add('card');
    card.style.cursor = 'pointer';

    // Define o comportamento de clique
    card.addEventListener('click', () => {
        window.location.href = `gaveta/gaveta.html?idGaveta=${gavetaId}`;
    });

    // Monta conteúdo interno
    card.innerHTML = `
        <img src="${img}" alt="${nomeGaveta}">
        <div class="paragrafo">
            <p>${nomeGaveta}</p>
            <p>${qtdRoupas}</p>
        </div>
    `;
    return card;
}
