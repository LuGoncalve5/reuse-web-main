// REGISTE COMUM USER - FIREBASE CONNECTION
import { auth, database } from '../firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { ref, set, push, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCPF, validarTelefone, validarEmail, validarNomeCompleto, validarSenha, validarData, validarUsuarioUnico, validarNomeUsuario } from './validacoes.js';
import { exibirErro, limparErro } from './uiHelpers.js';

function writeUserDataComum(uid, nome, email, telefone, usuario, cpf, nascimento) {
    const userRef = ref(database, `usuarios/pessoaFisica/${uid}`);
    return set(userRef, {
        nomeCompleto: nome,
        email,
        telefone,
        nomeDeUsuario: usuario,
        cpf,
        dataNascimento: nascimento,
        dataCadastro: new Date().toISOString()
    });
}

// Função adicional: cria as duas gavetas padrão
async function criarGavetasPadrao(uid) {
    const gavetasRef = ref(database, 'gavetas');
    const dataCriacao = new Date().toISOString();

    // cria duas gavetas globais
    const doacaoRef = push(gavetasRef);
    const vendasRef = push(gavetasRef);

    const doacaoId = doacaoRef.key;
    const vendasId = vendasRef.key;

    // salva as gavetas na tabela "gavetas"
    await Promise.all([
        set(doacaoRef, {
            nome: 'Doação',
            privado: false,
            dataCriacao,
            dono: uid
        }),
        set(vendasRef, {
            nome: 'Vendas',
            privado: false,
            dataCriacao,
            dono: uid
        })
    ]);

    // referencia essas gavetas no perfil do usuário
    const userGavetasRef = ref(database, `usuarios/pessoaFisica/${uid}/gavetas`);
    await update(userGavetasRef, {
        [doacaoId]: true,
        [vendasId]: true
    });

    console.log("✅ Gavetas padrão criadas e vinculadas ao usuário!");
}
    
// Inicialização (máscaras)
document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();
});

// Controle do formulário
const form = document.getElementById('formComum');
const submitBtn = document.getElementById('submit');

// Ativa limpeza automática ao digitar
['nome', 'email', 'telefone', 'senha', 'usuario', 'cpf', 'nascimento'].forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener('input', () => limparErro(id));
});

// Validação e criação do usuário
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
    if (!nome) { exibirErro('nome', 'Informe seu nome completo.'); valido = false; }
    if (!email) { exibirErro('email', 'Informe um e-mail.'); valido = false; }
    if (!telefone) { exibirErro('telefone', 'Informe um telefone.'); valido = false; }
    if (!senha) { exibirErro('senha', 'Informe uma senha.'); valido = false; }
    if (!nomeUsuario) { exibirErro('usuario', 'Informe um nome de usuário.'); valido = false; }
    if (!cpf) { exibirErro('cpf', 'Informe seu CPF.'); valido = false; }
    if (!nascimento) { exibirErro('nascimento', 'Informe sua data de nascimento.'); valido = false; }

    if (!valido) return;


    // e-mail válido e existente
    const emailValido = await validarEmail(email);
    if (!emailValido) {
        exibirErro('email', 'E-mail inválido ou inexistente.');
        return;
    }

    // telefone
    if (!validarTelefone(telefone)) {
        exibirErro('telefone', 'Telefone inválido. Use o formato (DD) 9xxxx-xxxx.');
        return;
    }

    // senha
    if (!validarSenha(senha)) {
        exibirErro('senha', 'A senha deve ter pelo menos 8 caracteres.');
        return;
    }

    // nome completo
    if (!validarNomeCompleto(nome)) {
        exibirErro('nome', 'Informe seu nome completo (duas ou mais palavras).');
        return;
    }

    // nome de usuário (formato válido)
    if (!validarNomeUsuario(nomeUsuario)) {
        exibirErro('usuario', 'Nome de usuário inválido. Use apenas letras, números, "_" ou "." e mínimo 3 caracteres.');
        return;
    }

    // nome de usuário único
    const usuarioUnico = await validarUsuarioUnico(nomeUsuario);
    if (!usuarioUnico) {
        exibirErro('usuario', 'Nome de usuário já está em uso. Escolha outro.');
        return;
    }

    // CPF
    if (!validarCPF(cpf)) {
        exibirErro('cpf', 'CPF inválido.');
        return;
    }

    // data
    if (!validarData(nascimento)) {
        exibirErro('nascimento', 'Data de nascimento inválida ou futura.');
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
        await criarGavetasPadrao(user.uid);

        alert('Usuário criado com sucesso! Você será redirecionado para a próxima etapa do cadastro.');
        
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
