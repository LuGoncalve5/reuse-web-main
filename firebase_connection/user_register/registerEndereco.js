// REGISTE ENDEREÇO USUÁRIO - FIREBASE CONNECTION
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, set, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCEP, buscarEnderecoPorCEP, preencherCamposEndereco } from './validacoes.js';

const firebaseConfig = {
    apiKey: "AIzaSyDfYcoijl5D_0EJk4pO1SjPFjeOnzzrsTM",
    authDomain: "reuse-1512f.firebaseapp.com",
    projectId: "reuse-1512f",
    storageBucket: "reuse-1512f.firebasestorage.app",
    messagingSenderId: "296992709188",
    appId: "1:296992709188:web:d1135e3a8beee9ac1f7a11"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function exibirErro(campo, mensagem) {
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = mensagem;
        campo.classList.add('is-invalid');
    }
}

function limparErro(campo) {
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = '';
        campo.classList.remove('is-invalid');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();

    const cepInput = document.getElementById('cep');

    // Busca automática de endereço ao sair do campo CEP
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.trim();
        limparErro(cepInput);

        if (!cep) return;

        const valido = await validarCEP(cep);
        if (!valido) {
            exibirErro(cepInput, 'CEP inválido ou inexistente.');
            return;
        }

        const dados = await buscarEnderecoPorCEP(cep);
        if (dados) {
            preencherCamposEndereco(dados);
        } else {
            exibirErro(cepInput, 'CEP não encontrado.');
        }
    });
});


const form = document.getElementById('formEndereco');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const uid = localStorage.getItem('currentUserUID');
    const tipoUsuario = localStorage.getItem('currentUserTipo');

    const cep = document.getElementById('cep').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const complemento = document.getElementById('complemento').value.trim();

    const campos = [cep, rua, numero, bairro, cidade, estado];
    let valido = true;

    // Limpar erros antigos
    campos.forEach(campo => limparErro(campo));

    if (!uid || !tipoUsuario) {
        exibirErro(cep, 'Erro interno: usuário não encontrado.');
        return;
    }

    // Validação obrigatória
    campos.forEach(campo => {
        if (!campo.value.trim()) {
            exibirErro(campo, 'Campo obrigatório.');
            valido = false;
        }
    });

    // Validação do CEP
    if (cep.value.trim() && !(await validarCEP(cep.value.trim()))) {
        exibirErro(cep, 'CEP inválido ou inexistente.');
        valido = false;
    }

    if (!valido) return;

    try {
        // Salva endereço no Realtime Database
        const enderecosRef = ref(database, 'enderecos');
        const novoEnderecoRef = push(enderecosRef);
        const enderecoId = novoEnderecoRef.key;

        await set(novoEnderecoRef, {
            cep: cep.value.trim(),
            rua: rua.value.trim(),
            numero: numero.value.trim(),
            bairro: bairro.value.trim(),
            cidade: cidade.value.trim(),
            estado: estado.value.trim(),
            complemento: complemento.value.trim()
        });

        // Vincula o endereço ao usuário correto
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
                exibirErro(cep, 'Tipo de usuário desconhecido.');
                return;
        }

        await update(usuarioRef, { enderecos: { enderecoPrincipal: enderecoId } });

        // Finaliza cadastro
        localStorage.removeItem('currentUserUID');
        localStorage.removeItem('currentUserTipo');
        alert('Endereço salvo com sucesso! Você será redirecionado para o closet.');
        setTimeout(() => window.location.href = '../closet/closet.html', 1500);

    } catch (err) {
        console.error(err);
        exibirErro(cep, 'Erro ao salvar endereço. Tente novamente.');
    }
});
