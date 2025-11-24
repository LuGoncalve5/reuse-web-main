// === cardPeca.js ===
// Função que cria e retorna o HTML de um card de peça (closet)

export function criarCardPeca(idPeca, titulo, preco = "0,00", status = "venda", img = "../../img/banco de fotos/body.jpg") {
    // Cria elemento principal
    const card = document.createElement('a');
    card.classList.add('closet-card');
    card.classList.add(status === "venda" ? "status-venda" : "status-doacao");
    card.style.cursor = 'pointer';
    card.href = `../peca/peca.html?idPeca=${idPeca}`;

    // Monta conteúdo HTML do card
    card.innerHTML = `
        <div class="closet-image-container">
            <img src="${img}" alt="${titulo}" loading="lazy">
            <div class="status-badge">
                <i class="bi bi-tag"></i> ${status === "venda" ? "Venda" : "Doação"}
            </div>
        </div>

        <div class="closet-details">
            ${
                status === "doacao"
                ? `<p class="closet-price status-text">Doação</p>`
                : `<p class="closet-price">R$ ${preco}</p>`
            }
            <h4 class="closet-title">${titulo}</h4>
        </div>
    `;

    return card;
}