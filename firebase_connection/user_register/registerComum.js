// REGISTE COMUM USER - FIREBASE CONNECTION
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCPF, validarTelefone, validarEmail, validarNomeCompleto, validarSenha, validarData, validarUsuarioUnico, validarNomeUsuario } from './validacoes.js';

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
const submitBtn = document.getElementById('submit');

// 🔸 Função para mostrar erro embaixo do campo
function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    campo.classList.add('is-invalid');
    if (feedback) feedback.textContent = mensagem;
}

// 🔸 Função para limpar erro ao digitar
function limparErro(campoId) {
    const campo = document.getElementById(campoId);
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    campo.classList.remove('is-invalid');
    if (feedback) feedback.textContent = '';
}

// Ativa limpeza automática ao digitar
['nome', 'email', 'telefone', 'senha', 'usuario', 'cpf', 'nascimento'].forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener('input', () => limparErro(id));
});

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

    let valido = true;

    // campos obrigatórios
    if (!nome) { mostrarErro('nome', 'Informe seu nome completo.'); valido = false; }
    if (!email) { mostrarErro('email', 'Informe um e-mail.'); valido = false; }
    if (!telefone) { mostrarErro('telefone', 'Informe um telefone.'); valido = false; }
    if (!senha) { mostrarErro('senha', 'Informe uma senha.'); valido = false; }
    if (!nomeUsuario) { mostrarErro('usuario', 'Informe um nome de usuário.'); valido = false; }
    if (!cpf) { mostrarErro('cpf', 'Informe seu CPF.'); valido = false; }
    if (!nascimento) { mostrarErro('nascimento', 'Informe sua data de nascimento.'); valido = false; }

    if (!valido) return;


    // e-mail válido e existente
    const emailValido = await validarEmail(email);
    if (!emailValido) {
        mostrarErro('email', 'E-mail inválido ou inexistente.');
        return;
    }

    // telefone
    if (!validarTelefone(telefone)) {
        mostrarErro('telefone', 'Telefone inválido. Use o formato (DD) 9xxxx-xxxx.');
        return;
    }

    // senha
    if (!validarSenha(senha)) {
        mostrarErro('senha', 'A senha deve ter pelo menos 8 caracteres.');
        return;
    }

    // nome completo
    if (!validarNomeCompleto(nome)) {
        mostrarErro('nome', 'Informe seu nome completo (duas ou mais palavras).');
        return;
    }

    // nome de usuário (formato válido)
    if (!validarNomeUsuario(nomeUsuario)) {
        mostrarErro('usuario', 'Nome de usuário inválido. Use apenas letras, números, "_" ou "." e mínimo 3 caracteres.');
        return;
    }

    // nome de usuário único
    const usuarioUnico = await validarUsuarioUnico(nomeUsuario);
    if (!usuarioUnico) {
        mostrarErro('usuario', 'Nome de usuário já está em uso. Escolha outro.');
        return;
    }

    // CPF
    if (!validarCPF(cpf)) {
        mostrarErro('cpf', 'CPF inválido.');
        return;
    }

    // data
    if (!validarData(nascimento)) {
        mostrarErro('nascimento', 'Data de nascimento inválida ou futura.');
        return;
    }

    // criar usuário
    submitBtn.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        localStorage.setItem('currentUserUID', user.uid);
        localStorage.setItem('currentUserTipo', 'pessoaFisica');

        await writeUserDataComum(user.uid, nome, email, telefone, nomeUsuario, cpf, nascimento);

        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success mt-3';
        successAlert.textContent = 'Cadastro criado com sucesso! Redirecionando...';
        form.appendChild(successAlert);
        
        setTimeout(() => {
            window.location.href = 'ci_endereco.html';
        }, 1000);
    } catch (err) {
        console.error(err);

        const erroCampo = document.createElement('div');
        erroCampo.className = 'alert alert-danger mt-3';
        erroCampo.textContent = 'Erro ao criar usuário: ' + (err.message || err);
        form.appendChild(erroCampo);

        submitBtn.disabled = false;
    }
});
