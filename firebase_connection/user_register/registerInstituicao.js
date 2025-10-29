// REGISTE INSTITUIÇÃO USER - FIREBASE CONNECTION
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

function writeUserDataInstituicao(uid, nome, email, telefone, senha, usuario, cnpj) {
    const userRef = ref(database, `usuarios/pessoaJuridica/instituicoes/${uid}`);
    return set(userRef, {
        nomeFantasia: nome,
        email,
        telefone,
        senha,
        nomeDeUsuario: usuario,
        cnpj,
        tipoPessoa: 'pessoaJuridica',
        tipoUsuario: 'instituicao',
        dataCadastro: new Date().toISOString()
    });
}

// Inicialização (máscaras)
document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();
});

// Controle do formulário
const form = document.getElementById('formInstituicao');
const submitBtn = document.getElementById('submit');

// Funções de erro
function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    campo.classList.add('is-invalid');
    if (feedback) feedback.textContent = mensagem;
}

function limparErro(campoId) {
    const campo = document.getElementById(campoId);
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    campo.classList.remove('is-invalid');
    if (feedback) feedback.textContent = '';
}

// Ativa limpeza automática ao digitar
['nome', 'email', 'telefone', 'senha', 'usuario', 'cnpj'].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.addEventListener('input', () => limparErro(id));
});

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

    let valido = true;
    
    // Campos obrigatórios
    if (!nomeFantasia) { mostrarErro('nome', 'Informe o nome fantasia do brechó.'); valido = false; }
    if (!email) { mostrarErro('email', 'Informe um e-mail.'); valido = false; }
    if (!telefone) { mostrarErro('telefone', 'Informe um telefone.'); valido = false; }
    if (!senha) { mostrarErro('senha', 'Informe uma senha.'); valido = false; }
    if (!nomeUsuario) { mostrarErro('usuario', 'Informe um nome de usuário.'); valido = false; }
    if (!cnpj) { mostrarErro('cnpj', 'Informe o CNPJ.'); valido = false; }
    
    if (!valido) return;
    
    // Nome fantasia
    if (!validarNomeCompleto(nomeFantasia)) { 
        mostrarErro('nome', 'Informe o nome completo da instituição (duas ou mais palavras).'); 
        return; 
    }

    // E-mail
    const emailValido = await validarEmail(email);
    if (!emailValido) { 
        mostrarErro('email', 'E-mail inválido ou inexistente.'); 
        return; 
    }
    
    // Telefone
    if (!validarTelefone(telefone)) { 
        mostrarErro('telefone', 'Telefone inválido. Use o formato (DD) 9xxxx-xxxx.'); 
        return; 
    }
    
    // Senha
    if (!validarSenha(senha)) { 
        mostrarErro('senha', 'A senha deve ter pelo menos 8 caracteres.'); 
        return; 
    }
    
    // Nome de usuário
    if (!validarNomeUsuario(nomeUsuario)) {
        mostrarErro('usuario', 'Nome de usuário inválido. Use apenas letras, números, "_" ou "." e mínimo 3 caracteres.');
        return;
    }
    
    const usuarioUnico = await validarUsuarioUnico(nomeUsuario);
    if (!usuarioUnico) { 
        mostrarErro('usuario', 'Nome de usuário já está em uso. Escolha outro.'); 
        return; 
    }
    
    // CNPJ
    if (!validarCNPJ(cnpj)) { 
        mostrarErro('cnpj', 'CNPJ inválido.'); 
        return; 
    }
    
    // Criação do usuário
    submitBtn.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        localStorage.setItem('currentUserUID', user.uid);
        localStorage.setItem('currentUserTipo', 'instituicao');

        await writeUserDataInstituicao(user.uid, nomeFantasia, email, telefone, senha, nomeUsuario, cnpj);

        setTimeout(() => {
            window.location.href = 'ci_endereco.html';
        }, 1000);
    } catch (err) {
        console.error(err);
        
        if (err.code === 'auth/email-already-in-use') {
            mostrarErro('email', 'Este e-mail já está em uso. Use outro e-mail.');
        } else {
            mostrarErro('email', 'Erro ao criar usuário: ' + (err.message || err));
        }

        submitBtn.disabled = false;
    }
});
