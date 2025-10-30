// recuperacaoSenha.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
    import { getAuth, fetchSignInMethodsForEmail, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

    // 🔹 Config Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDfYcoijl5D_0EJk4pO1SjPFjeOnzzrsTM",
        authDomain: "reuse-1512f.firebaseapp.com",
        projectId: "reuse-1512f",
        storageBucket: "reuse-1512f.firebasestorage.app",
        messagingSenderId: "296992709188",
        appId: "1:296992709188:web:d1135e3a8beee9ac1f7a11"
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();

    // 🔹 Helpers
    function exibirErro(campoId, mensagem) {
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

    function exibirMensagem(msg, sucesso = true) {
        const div = document.getElementById('mensagem');
        div.textContent = msg;
        div.style.color = sucesso ? 'green' : 'red';
    }

    
fetchSignInMethodsForEmail(auth, "email@teste.com")
    .then(console.log)
    .catch(console.error);

    // 🔹 Evento do formulário
    const form = document.getElementById('formEmail');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        limparErro('email');
        exibirMensagem('');

        if (!email) {
            exibirErro('email', 'Digite um e-mail.');
            return;
        }

        try {
            // 🔹 Verifica se o e-mail existe
            const metodos = await fetchSignInMethodsForEmail(auth, email);
            if (metodos.length === 0) {
                exibirErro('email', 'E-mail não cadastrado.');
                return;
            }

            // 🔹 Envia link de redefinição de senha
            await sendPasswordResetEmail(auth, email);
            exibirMensagem('✅ Link de redefinição enviado para seu e-mail!');
        } catch (error) {
            console.error(error);
            exibirMensagem('⚠️ Erro ao enviar link de redefinição.', false);
        }
    });