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

document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();

    const cepInput = document.getElementById('cep');

    // Busca automática de endereço ao sair do campo CEP
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.trim();
        if (!cep) return;

        const valido = await validarCEP(cep);
        if (!valido) {
            alert('CEP inválido ou inexistente.');
            return;
        }

        const dados = await buscarEnderecoPorCEP(cep);
        if (dados) {
            preencherCamposEndereco(dados);
        } else {
            alert('CEP não encontrado.');
        }
    });
});


const form = document.getElementById('formEndereco');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const uid = localStorage.getItem('currentUserUID');
    const tipoUsuario = localStorage.getItem('currentUserTipo');

    if (!uid || !tipoUsuario) {
        alert('Erro: dados do usuário não encontrados.');
        return;
    }

    const cep = document.getElementById('cep').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const complemento = document.getElementById('complemento').value.trim();

    // Validação extra
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    if (!(await validarCEP(cep))) {
        alert('CEP inválido ou inexistente.');
        return;
    }

    try {
        // Salva endereço no Realtime Database
        const enderecosRef = ref(database, 'enderecos');
        const novoEnderecoRef = push(enderecosRef);
        const enderecoId = novoEnderecoRef.key;

        await set(novoEnderecoRef, {
            cep, rua, numero, bairro, cidade, estado, complemento
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
                throw new Error('Tipo de usuário desconhecido');
        }

        await update(usuarioRef, { enderecos: { enderecoPrincipal: enderecoId } });

        // Finaliza cadastro
        localStorage.removeItem('currentUserUID');
        localStorage.removeItem('currentUserTipo');

        alert('Cadastro concluído com sucesso!');
        window.location.href = '../closet/closet.html';
    } catch (err) {
        console.error(err);
        alert('Erro ao salvar endereço. Tente novamente.');
    }
});
