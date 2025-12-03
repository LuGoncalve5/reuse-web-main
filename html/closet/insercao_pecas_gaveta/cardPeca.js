// === cardPeca.js ===
// Função que cria e retorna o HTML de um card de peça (closet)

export function criarCardPeca(
    idPeca,
    titulo,
    preco = "0,00",
    status = "venda",
    img = "../../img/banco de fotos/body.jpg",
    descricao = ""
) {
    const card = document.createElement('a');
    card.classList.add('closet-card', `status-${status}`);
    card.style.cursor = 'pointer';
    card.href = `../peca/peca.html?idPeca=${idPeca}`;

    card.innerHTML = `
        <div class="closet-image-container">
            <img src="${img}" alt="${titulo}" loading="lazy">
            <div class="status-badge">
                ${
                    status === "venda"
                        ? `<i class="bi bi-tag"></i> Venda`
                        : status === "doacao"
                        ? `<i class="bi bi-gift"></i> Doação`
                        : `<i class="bi bi-archive"></i> Organizar`
                }
            </div>
        </div>

        <div class="closet-details">

            ${
                status === "venda"
                ? `<p class="closet-price">R$ ${preco}</p>`
                : status === "doacao"
                ? `<p class="closet-price status-text">Doação</p>`
                : ""
            }

            <h4 class="closet-title">${titulo}</h4>

            ${
                status === "organizar"
                ? `<p class="closet-desc">${descricao}</p>`
                : ""
            }
        </div>
    `;

    return card;
}
