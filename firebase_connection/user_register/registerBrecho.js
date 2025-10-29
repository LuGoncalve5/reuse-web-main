// REGISTE LOJA USER - FIREBASE CONNECTION
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCNPJ, validarTelefone, validarEmail, validarNomeCompleto, validarSenha, validarUsuarioUnico, validarNomeUsuario } from './validacoes.js';

// Configuração Firebase
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

function writeUserDataBrecho(uid, nome, email, telefone, senha, usuario, cnpj) {
    const userRef = ref(database, `usuarios/pessoaJuridica/brechos/${uid}`);
    return set(userRef, {
        nomeFantasia: nome,
        email,
        telefone,
        senha,
        nomeDeUsuario: usuario,
        cnpj,
        tipoPessoa: 'pessoaJuridica',
        tipoUsuario: 'brecho',
        dataCadastro: new Date().toISOString()
    });
}

// Inicialização (máscaras)
document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();
});

// Controle do formulário
const form = document.getElementById('formLoja');
const alertBox = document.getElementById('formAlert');
const submitBtn = document.getElementById('submit');

function showAlert(type, message) {
    alertBox.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info');
    alertBox.classList.add('alert-' + type);
    alertBox.textContent = message;
}

// Validação e criação do usuário
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // valores e trims
    const nomeFantasia = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const nomeUsuario = document.getElementById('usuario').value.trim();
    const cnpj = document.getElementById('cnpj').value.trim();


    // campos obrigatórios
    if (!nomeFantasia || !email || !telefone || !senha || !nomeUsuario || !cnpj) {
        showAlert('danger', 'Preencha todos os campos obrigatórios.');
        return;
    }

    // e-mail válido e existente
    const emailValido = await validarEmail(email);
    if (!emailValido) {
        showAlert('danger', 'E-mail inválido ou inexistente.');
        return;
    }

    // telefone
    if (!validarTelefone(telefone)) {
        showAlert('danger', 'Telefone inválido. Use o formato (DD) 9xxxx-xxxx.');
        return;
    }

    // senha
    if (!validarSenha(senha)) {
        showAlert('danger', 'Senha deve ter pelo menos 8 caracteres.');
        return;
    }

    if (!validarNomeCompleto(nomeFantasia)) {
        showAlert('danger', 'Informe seu nome completo (duas ou mais palavras).');
        return;
    }

    // ✅ nome de usuário (formato válido)
    if (!validarNomeUsuario(nomeUsuario)) {
        showAlert('danger', 'Nome de usuário inválido. Use apenas letras, números, "_" ou "." e mínimo 3 caracteres.');
        return;
    }

    // nome de usuário único
    const usuarioUnico = await validarUsuarioUnico(nomeUsuario);
    if (!usuarioUnico) {
        showAlert('danger', 'Nome de usuário já está em uso. Escolha outro.');
        return;
    }

    // CNPJ
    if (!validarCNPJ(cnpj)) {
        showAlert('danger', 'CNPJ inválido.');
        return;
    }

    // criar usuário
    submitBtn.disabled = true;
    showAlert('info', 'Criando usuário...');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        localStorage.setItem('currentUserUID', user.uid);
        localStorage.setItem('currentUserTipo', 'brecho');

        await writeUserDataBrecho(user.uid, nomeFantasia, email, telefone, senha, nomeUsuario, cnpj);

        showAlert('success', 'Cadastro criado com sucesso! Redirecionando...');
        setTimeout(() => {
            window.location.href = 'ci_endereco.html';
        }, 1000);
    } catch (err) {
        console.error(err);
        showAlert('danger', 'Erro ao criar usuário: ' + (err.message || err));
        submitBtn.disabled = false;
    }
});
