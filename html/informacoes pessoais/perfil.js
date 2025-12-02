import { database } from "../../firebase_connection/firebaseConfig.js";
import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

/* ===============================
   ELEMENTOS DO FORM
================================ */
const form = document.querySelector(".perfil-form");
const campos = {
    nomeCompleto: form.querySelector('input[name="nomeCompleto"]'),
    nomeUsuario: form.querySelector('input[name="nomeUsuario"]'),
    email: form.querySelector('input[name="email"]'),
    senha: form.querySelector('input[name="senha"]'),
    cpf: form.querySelector('input[name="cpf"]'),
    cnpj: form.querySelector('input[name="cnpj"]'),
    telefone: form.querySelector('input[name="telefone"]'),
    cep: form.querySelector('input[name="cep"]'),
    estado: form.querySelector('input[name="estado"]'),
    cidade: form.querySelector('input[name="cidade"]'),
    bairro: form.querySelector('input[name="bairro"]'),
    complemento: form.querySelector('input[name="complemento"]')
};

let dadosOriginais = {};
let caminhoUsuario = "";

/* ===============================
   UID DO USUÁRIO
================================ */
const uid = localStorage.getItem("userId");

if (!uid) {
    alert("Usuário não autenticado");
    location.href = "/login.html";
}

/* ===============================
   DETECTAR TIPO DE USUÁRIO
================================ */
async function detectarUsuario() {
    const baseRef = ref(database, "usuarios");

    const caminhos = [
        `pessoaFisica/${uid}`,
        `pessoaJuridica/brechos/${uid}`,
        `pessoaJuridica/instituicoes/${uid}`
    ];

    for (const caminho of caminhos) {
        const snapshot = await get(ref(database, `usuarios/${caminho}`));
        if (snapshot.exists()) {
            caminhoUsuario = `usuarios/${caminho}`;
            dadosOriginais = snapshot.val();
            configurarFormulario(caminho);
            preencherCampos(dadosOriginais);
            return;
        }
    }

    alert("Usuário não encontrado");
}

/* ===============================
   CONFIGURAR FORMULÁRIO
================================ */
function configurarFormulario(caminho) {
    // Esconde tudo primeiro
    Object.values(campos).forEach(campo => campo?.parentElement?.style.setProperty("display", "none"));

    if (caminho.startsWith("pessoaFisica")) {
        exibir([
            "nomeCompleto",
            "nomeUsuario",
            "email",
            "cpf",
            "telefone",
            "cep",
            "estado",
            "cidade",
            "bairro",
            "complemento"
        ]);
    } else {
        // brechos e instituicoes (iguais)
        exibir([
            "nomeCompleto",
            "nomeUsuario",
            "email",
            "cnpj",
            "telefone",
            "cep",
            "estado",
            "cidade",
            "bairro",
            "complemento"
        ]);
    }
}

function exibir(lista) {
    lista.forEach(campo => {
        if (campos[campo]) {
            campos[campo].parentElement.style.display = "flex";
        }
    });
}

/* ===============================
   PREENCHER CAMPOS
================================ */
function preencherCampos(dados) {
    if (campos.nomeCompleto) campos.nomeCompleto.value = dados.nomeCompleto || dados.nome || "";
    if (campos.nomeUsuario) campos.nomeUsuario.value = dados.nomeDeUsuario || "";
    if (campos.email) campos.email.value = dados.email || "";
    if (campos.cpf) campos.cpf.value = dados.cpf || "";
    if (campos.cnpj) campos.cnpj.value = dados.cnpj || "";
    if (campos.telefone) campos.telefone.value = dados.telefone || "";
    if (campos.cep) campos.cep.value = dados.cep || "";
    if (campos.estado) campos.estado.value = dados.estado || "";
    if (campos.cidade) campos.cidade.value = dados.cidade || "";
    if (campos.bairro) campos.bairro.value = dados.bairro || "";
    if (campos.complemento) campos.complemento.value = dados.complemento || "";
}

/* ===============================
   SALVAR APENAS ALTERADOS
================================ */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const atualizados = {};

    Object.entries(campos).forEach(([chave, campo]) => {
        if (!campo || campo.parentElement.style.display === "none") return;

        const valorAtual = campo.value || "";
        const valorOriginal = dadosOriginais[chave] || "";

        if (valorAtual !== valorOriginal) {
            atualizados[chave] = valorAtual;
        }
    });

    if (Object.keys(atualizados).length === 0) {
        alert("Nenhuma alteração feita.");
        return;
    }

    try {
        await update(ref(database, caminhoUsuario), atualizados);
        alert("Dados atualizados com sucesso!");
        dadosOriginais = { ...dadosOriginais, ...atualizados };
    } catch (error) {
        console.error(error);
        alert("Erro ao salvar alterações");
    }
});

/* ===============================
   INICIALIZAÇÃO
================================ */
detectarUsuario();