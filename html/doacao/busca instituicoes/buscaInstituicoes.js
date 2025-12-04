// ================================
// IMPORTS FIREBASE
// ================================
import { database } from "../../../firebase_connection/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// ================================
// ELEMENTOS
// ================================
const containerInstituicoes = document.querySelector('.instituicoes-list');
const searchInput = document.querySelector('.search-input');
const spinnerContainer = document.querySelector('.spinner-container'); // spinner fixo

// ================================
// UID LOGADO
// ================================
const userUID = localStorage.getItem('currentUserUID');

if (!userUID) {
    alert("Usuário não logado.");
    throw new Error("UID ausente");
}

// ================================
// ENDEREÇO → STRING
// ================================
function enderecoParaString(end) {
    return `${end.rua}, ${end.numero}, ${end.bairro}, ${end.cidade} - ${end.estado}, ${end.pais}`;
}

// ================================
// GEOCODING (OpenStreetMap)
// ================================
async function geocodificarEndereco(enderecoString) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoString)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.length) return null;

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
    };
}

// ================================
// DISTÂNCIA (HAVERSINE)
// ================================
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ================================
// DESCOBRIR ENDEREÇO DO USUÁRIO
// ================================
async function obterEnderecoUsuario(uid) {

    const caminhos = [
        `usuarios/pessoaFisica/${uid}`,
        `usuarios/pessoaJuridica/brechos/${uid}`,
        `usuarios/pessoaJuridica/instituicoes/${uid}`
    ];

    for (const caminho of caminhos) {
        const snap = await get(ref(database, caminho));
        if (snap.exists() && snap.val().endereco) {
            return snap.val().endereco;
        }
    }

    return null;
}

// ================================
// NORMALIZAR BASE64
// ================================
function normalizarBase64(base64) {
    if (!base64) return null;

    if (base64.startsWith('data:image')) {
        return base64;
    }

    return `data:image/jpeg;base64,${base64}`;
}

// ================================
// SPINNER (CSS BASED)
// ================================
function mostrarSpinner() {
    spinnerContainer.classList.remove('hidden');
}

function esconderSpinner() {
    spinnerContainer.classList.add('hidden');
}

// ================================
// CARD
// ================================
function criarCardInstituicao(inst) {
    const imagem = normalizarBase64(inst.fotoBase64) 
        || '../../img/instituicoes/default.png';
    const url = `../perfil instituicao/p_doacao.html?idInstituicao=${encodeURIComponent(inst.id)}`;
    return `
        <a class="inst-link" href="${url}" style="text-decoration: none; color: inherit;">
        <div class="inst-card">
            <div class="inst-info">
            <img src="${imagem}" class="inst-logo">
            <div>
                <h3>${inst.nomeCompleto}</h3>
                <p>${inst.distancia.toFixed(2)} km de distância</p>
            </div>
            </div>
            <button class="inst-btn" type="button">Ver perfil</button>
        </div>
        </a>
    `;
}

// ================================
// LOAD INSTITUIÇÕES
// ================================
let instituicoesComDistancia = [];

async function carregarInstituicoes() {
    mostrarSpinner(); // 🔹 mostra spinner

    // 🔹 endereço do usuário
    const enderecoIdUsuario = await obterEnderecoUsuario(userUID);

    if (!enderecoIdUsuario) {
        alert("Endereço do usuário não encontrado.");
        esconderSpinner();
        return;
    }

    const snapEnderecoUser = await get(
        ref(database, `enderecos/${enderecoIdUsuario}`)
    );

    if (!snapEnderecoUser.exists()) {
        esconderSpinner();
        return;
    }

    const coordUsuario = await geocodificarEndereco(
        enderecoParaString(snapEnderecoUser.val())
    );

    if (!coordUsuario) {
        esconderSpinner();
        return;
    }

    // 🔹 buscar instituições
    const snapInst = await get(ref(database, 'usuarios/pessoaJuridica/instituicoes'));
    if (!snapInst.exists()) {
        esconderSpinner();
        return;
    }

    instituicoesComDistancia = [];

    for (const id in snapInst.val()) {
        if (id === userUID) continue;
        
        const inst = snapInst.val()[id];
        if (!inst.endereco) continue;

        const snapEndInst = await get(ref(database, `enderecos/${inst.endereco}`));
        if (!snapEndInst.exists()) continue;

        const coordInst = await geocodificarEndereco(
            enderecoParaString(snapEndInst.val())
        );

        if (!coordInst) continue;

        const distancia = calcularDistancia(
            coordUsuario.lat,
            coordUsuario.lon,
            coordInst.lat,
            coordInst.lon
        );

        instituicoesComDistancia.push({
            id,
            ...inst,
            distancia
        });
    }

    instituicoesComDistancia.sort((a, b) => a.distancia - b.distancia);
    renderizarInstituicoes(instituicoesComDistancia.slice(0, 10));
    esconderSpinner(); // 🔹 esconde spinner após renderizar
}

// ================================
// RENDER
// ================================
function renderizarInstituicoes(lista) {
    containerInstituicoes.innerHTML = lista.map(criarCardInstituicao).join('');
}

// ================================
// BUSCA POR NOME
// ================================
searchInput.addEventListener('input', () => {
    const termo = searchInput.value.toLowerCase();

    renderizarInstituicoes(
        instituicoesComDistancia
            .filter(inst => inst.nomeCompleto.toLowerCase().includes(termo)  && inst.id !== "idQueNaoPodeAparecer" )
            .slice(0, 10)
    );
});

// ================================
// INIT
// ================================
carregarInstituicoes();
