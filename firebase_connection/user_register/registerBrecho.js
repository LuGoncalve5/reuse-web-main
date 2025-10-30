// REGISTE LOJA USER - FIREBASE CONNECTION
import { auth, database } from '../firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCNPJ, validarTelefone, validarEmail, validarNomeCompleto, validarSenha, validarUsuarioUnico, validarNomeUsuario } from './validacoes.js';
import { exibirErro, limparErro } from './uiHelpers.js';


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
const submitBtn = document.getElementById('submit');

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
    if (!nomeFantasia) {exibirErro('nome', 'Informe o nome fantasia do brechó.'); valido = false; }
    if (!email) {exibirErro('email', 'Informe um e-mail.'); valido = false; }
    if (!telefone) {exibirErro('telefone', 'Informe um telefone.'); valido = false; }
    if (!senha) {exibirErro('senha', 'Informe uma senha.'); valido = false; }
    if (!nomeUsuario) {exibirErro('usuario', 'Informe um nome de usuário.'); valido = false; }
    if (!cnpj) {exibirErro('cnpj', 'Informe o CNPJ.'); valido = false; }

    if (!valido) return;

    // Nome fantasia
    if (!validarNomeCompleto(nomeFantasia)) { 
    exibirErro('nome', 'Informe o nome completo do brechó (duas ou mais palavras).'); 
        return; }

    // E-mail
    const emailValido = await validarEmail(email);
    if (!emailValido) { 
    exibirErro('email', 'E-mail inválido ou inexistente.'); 
        return; 
    }

    // Telefone
    if (!validarTelefone(telefone)) { 
    exibirErro('telefone', 'Telefone inválido. Use o formato (DD) 9xxxx-xxxx.'); 
        return; 
    }

    // Senha
    if (!validarSenha(senha)) { 
    exibirErro('senha', 'A senha deve ter pelo menos 8 caracteres.'); 
        return; 
    }

    // Nome de usuário
    if (!validarNomeUsuario(nomeUsuario)) {
    exibirErro('usuario', 'Nome de usuário inválido. Use apenas letras, números, "_" ou "." e mínimo 3 caracteres.');
        return;
    }

    const usuarioUnico = await validarUsuarioUnico(nomeUsuario);
    if (!usuarioUnico) { 
    exibirErro('usuario', 'Nome de usuário já está em uso. Escolha outro.'); 
        return; 
    }

    // CNPJ
    if (!validarCNPJ(cnpj)) { 
    exibirErro('cnpj', 'CNPJ inválido.'); 
        return; 
    }

    // Criação do usuário
    submitBtn.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        localStorage.setItem('currentUserUID', user.uid);
        localStorage.setItem('currentUserTipo', 'brecho');

        await writeUserDataBrecho(user.uid, nomeFantasia, email, telefone, senha, nomeUsuario, cnpj);
        
        setTimeout(() => {
            window.location.href = 'ci_endereco.html';
        }, 1000);
    } catch (err) {
        console.error(err);
        
        if (err.code === 'auth/email-already-in-use') {
        exibirErro('email', 'Este e-mail já está em uso. Use outro e-mail.');
        } else {
        exibirErro('email', 'Erro ao criar usuário: ' + (err.message || err));
        }

        submitBtn.disabled = false;
    }
});
