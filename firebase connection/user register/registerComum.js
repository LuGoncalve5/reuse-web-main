import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCPF, validarTelefone, validarEmail } from './validacoes.js';

const firebaseConfig = {
    apiKey: "AIzaSyDfYcoijl5D_0EJk4pO1SjPFjeOnzzrsTM",
    authDomain: "reuse-1512f.firebaseapp.com",
    projectId: "reuse-1512f",
    storageBucket: "reuse-1512f.firebasestorage.app",
    messagingSenderId: "296992709188",
    appId: "1:296992709188:web:d1135e3a8beee9ac1f7a11"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function writeUserDataComum(uid, nome, email, telefone, usuario, cpf, nascimento) {
    const userRef = ref(database, `usuarios/pessoaFisica/${uid}`);
    return set(userRef, {
        nomeCompleto: nome,
        email,
        telefone,
        nomeDeUsuario: usuario,
        cpf,
        dataNascimento: nascimento,
        tipoPessoa: 'pessoaFisica',
        tipoUsuario: 'comum',
        dataCadastro: new Date().toISOString()
    });
}

/* ========= Inicialização: aplicar máscaras ========= */
document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();
});

/* ========= Controle do formulário ========= */
const form = document.getElementById('formComum');
const alertBox = document.getElementById('formAlert');
const submitBtn = document.getElementById('submit');

function showAlert(type, message) {
    alertBox.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info');
    alertBox.classList.add('alert-' + type);
    alertBox.textContent = message;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // obter valores e trim
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const nomeUsuario = document.getElementById('usuario').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const nascimento = document.getElementById('nascimento').value;

    // validações
    if (!nome || !email || !telefone || !senha || !nomeUsuario || !cpf || !nascimento) {
        showAlert('danger', 'Preencha todos os campos obrigatórios.');
        return;
    }

    if (!validarEmail(email)) {
        showAlert('danger', 'E-mail inválido.');
        return;
    }

    if (!validarTelefone(telefone)) {
        showAlert('danger', 'Telefone inválido. Use o formato (DD) 9xxxx-xxxx.');
        return;
    }

    if (!validarCPF(cpf)) {
        showAlert('danger', 'CPF inválido.');
        return;
    }

    if (senha.length < 8) {
        showAlert('danger', 'Senha deve ter pelo menos 8 caracteres.');
        return;
    }

    // disable botão
    submitBtn.disabled = true;
    showAlert('info', 'Criando usuário...');

    // cria usuário no Firebase Auth
    createUserWithEmailAndPassword(auth, email, senha)
        .then(userCredential => {
            const user = userCredential.user;
            localStorage.setItem('currentUserUID', user.uid);
            localStorage.setItem('currentUserTipo', 'pessoaFisica');

            // gravar os dados (sem a senha) no Realtime Database
            return writeUserDataComum(user.uid, nome, email, telefone, nomeUsuario, cpf, nascimento);
        })
        .then(() => {
            showAlert('success', 'Cadastro criado. Redirecionando para endereço...');
            // redireciona após pequeno delay para permitir ver mensagem
            setTimeout(() => {
                window.location.href = 'ci_endereco.html';
            }, 900);
        })
        .catch(err => {
            console.error(err);
            submitBtn.disabled = false;
            showAlert('danger', 'Erro ao criar usuário: ' + (err.message || err));
        });
});
