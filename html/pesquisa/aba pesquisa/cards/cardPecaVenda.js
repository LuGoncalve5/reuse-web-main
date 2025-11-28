// cards/cardPecaVenda.js

export function criarCardPecaVenda({ id, imagem, valor, titulo, descricao }) {
    const card = document.createElement("a");
    card.classList.add("product-card");
    card.href = `../aba produto/produto.html?idPeca=${id}`;

    card.innerHTML = `
        <div class="product-image-container">
            <i class="bi bi-heart bookmark-icon"></i>
            <img 
                src="${imagem}" 
                alt="${titulo}"
                class="product-image"
                loading="lazy"
            >
        </div>

        <div class="product-details">
            <p class="product-price">R$ ${Number(valor).toFixed(2)}</p>
            <h4 class="product-title">${titulo}</h4>
            <p class="product-description-snippet">${descricao}</p>
        </div>
    `;

    return card;
}
