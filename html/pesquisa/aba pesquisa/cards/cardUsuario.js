// cards/cardUsuario.js

export function criarCardUsuario({ id, nomeDeUsuario, arroba, fotoDePerfil }) {
    const card = document.createElement("div");
    card.classList.add("user-card");

    card.innerHTML = `
        <div class="user-info">
            <img 
                src="${fotoDePerfil || '../../../img/perfil_default.png'}"
                class="user-photo"
                alt="Foto de ${nomeDeUsuario}"
            >
            <div>
                <h3>${nomeDeUsuario}</h3>
                <p>@${arroba}</p>
            </div>
        </div>

        <div class="user-rating">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star"></i>
        </div>
    `;

    card.addEventListener("click", () => {
        window.location.href = `perfil.html?id=${id}`;
    });

    return card;
}
