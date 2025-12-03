// cards/cardUsuario.js

export function criarCardUsuario({ id, nomeCompleto, nomeDeUsuario, fotoDePerfil }) {
    const card = document.createElement("div");
    card.classList.add("user-card");

    card.innerHTML = `
        <div class="user-info">
            <img 
                src="${fotoDePerfil || '../../../img/perfil_default.png'}"
                class="user-photo"
                alt="Foto de ${nomeCompleto}"
            >
            <div>
                <h3>${nomeCompleto}</h3>
                <p>@${nomeDeUsuario}</p>
            </div>
        </div>
    `;

    card.addEventListener("click", () => {
        window.location.href = `../aba usuario/pesquisa_perfil.html?idUsuario=${id}`;
    });

    return card;
}
