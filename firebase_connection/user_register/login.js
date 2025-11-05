// LOGIN USER - FIREBASE CONNECTION
console.log("✅ login.js carregado com sucesso!");

import { auth, database } from '../firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"; 
import { ref, get, child } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Seleciona o botão de login
const loginEnviar = document.getElementById('loginEnviar');
loginEnviar.addEventListener('click', function(event) {
    event.preventDefault(); // Evita comportamento padrão de envio de formulário

    const emailLogin = document.getElementById('email').value;
    const senhaLogin = document.getElementById('senha').value;

    // Garante que os dois campos foram preenchidos
    if (!emailLogin || !senhaLogin) {
        alert('Por favor, preencha E-mail e Senha para continuar.');
        return; // Sai da função se estiver vazio
    }

    // Chama a função de login do Firebase
    signInWithEmailAndPassword(auth, emailLogin, senhaLogin)
        .then(async (userCredential) => {
            // O usuário foi autenticado com sucesso
            const user = userCredential.user;
            const uid = user.uid;

            const dbRef = ref(database);
            let tipoUsuario = null;

            try {
                const pessoaFisica = await get(child(dbRef, `usuarios/pessoaFisica/${uid}`));
                const instituicao = await get(child(dbRef, `usuarios/pessoaJuridica/instituicoes/${uid}`));
                const brecho = await get(child(dbRef, `usuarios/pessoaJuridica/brechos/${uid}`));

                if (pessoaFisica.exists()) tipoUsuario = 'pessoaFisica';
                else if (instituicao.exists()) tipoUsuario = 'instituicao';
                else if (brecho.exists()) tipoUsuario = 'brecho';
            } catch (err) {
                console.error('Erro ao buscar tipo de usuário:', err);
            }

            if (!tipoUsuario) {
                alert('Erro interno: tipo de usuário não encontrado.');
                return;
            }

            // 🔹 Salva os parâmetros no localStorage
            localStorage.setItem('currentUserUID', uid);
            localStorage.setItem('currentUserTipo', tipoUsuario);


            alert('Login realizado com sucesso! Bem-vindo(a) ao ReUse!');
            console.log('Usuário logado:', user.email);
            window.location.href = '../closet/closet.html'; 
        })
        .catch((error) => {
            // Houve algum erro
            const errorCode = error.code;
            const errorMessage = error.message;

            let mensagemErroUsuario = 'Ocorreu um erro desconhecido ao fazer login.';

            // Tratamento de Erros Comuns do Firebase Auth
            if (errorCode === 'auth/user-not-found') {
                mensagemErroUsuario = 'Usuário não encontrado. O e-mail informado não está cadastrado.';
            } else if (errorCode === 'auth/wrong-password') {
                mensagemErroUsuario = 'Senha incorreta. Por favor, verifique sua senha e tente novamente.';
            } else if (errorCode === 'auth/invalid-email') {
                mensagemErroUsuario = 'O formato do e-mail é inválido.';
            } else if (errorCode === 'auth/too-many-requests') {
                mensagemErroUsuario = 'Tentativas de login excessivas. Tente novamente mais tarde.';
            }

            alert(mensagemErroUsuario);
            console.error('Erro no login:', errorMessage); // Para fins de depuração
        });
});