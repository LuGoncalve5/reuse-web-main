import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCPF, validarTelefone, validarEmail, validarData, validarUsuarioUnico } from './validacoes.js';

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

/* ==========================================================
   🔹 Função para gravar dados do usuário comum
   ========================================================== */
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

/* ==========================================================
   🔹 Inicialização (máscaras)
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();
});

/* ==========================================================
   🔹 Controle do formulário
   ========================================================== */
const form = document.getElementById('formComum');
const alertBox = document.getElementById('formAlert');
const submitBtn = document.getElementById('submit');

function showAlert(type, message) {
    alertBox.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info');
    alertBox.classList.add('alert-' + type);
    alertBox.textContent = message;
}

/* ==========================================================
   🔹 Validação e criação do usuário
   ========================================================== */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // valores e trims
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const nomeUsuario = document.getElementById('usuario').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const nascimento = document.getElementById('nascimento').value;

    // campos obrigatórios
    if (!nome || !email || !telefone || !senha || !nomeUsuario || !cpf || !nascimento) {
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

    // CPF
    if (!validarCPF(cpf)) {
        showAlert('danger', 'CPF inválido.');
        return;
    }

    // data
    if (!validarData(nascimento)) {
        showAlert('danger', 'Data de nascimento inválida ou futura.');
        return;
    }

    // nome de usuário único
    const usuarioUnico = await validarUsuarioUnico(nomeUsuario);
    if (!usuarioUnico) {
        showAlert('danger', 'Nome de usuário já está em uso. Escolha outro.');
        return;
    }

    // senha
    if (senha.length < 8) {
        showAlert('danger', 'Senha deve ter pelo menos 8 caracteres.');
        return;
    }

    // criar usuário
    submitBtn.disabled = true;
    showAlert('info', 'Criando usuário...');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        localStorage.setItem('currentUserUID', user.uid);
        localStorage.setItem('currentUserTipo', 'pessoaFisica');

        await writeUserDataComum(user.uid, nome, email, telefone, nomeUsuario, cpf, nascimento);

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
