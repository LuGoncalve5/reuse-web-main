// LOGIN USER - FIREBASE CONNECTION
console.log("✅ login.js carregado com sucesso!");

import { auth } from '../firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"; 

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
        .then((userCredential) => {
            // O usuário foi autenticado com sucesso
            const user = userCredential.user;
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