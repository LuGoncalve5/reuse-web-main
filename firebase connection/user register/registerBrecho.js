import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

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

function writeUserDataBrecho(uid, nomeFantasia, email, telefone, senha, nomeUsuario, cnpj) {
    const userRef = ref(database, `usuarios/pessoaJuridica/brechos/${uid}`);
    return set(userRef, {
        nomeFantasia,
        email,
        telefone,
        senha,
        nomeUsuario,
        cnpj,
        tipoPessoa: 'pessoaJuridica',
        tipoUsuario: 'brecho',
        dataCadastro: new Date().toISOString()
    });
}

const submit = document.getElementById('submit');
submit.addEventListener('click', (e) => {
    e.preventDefault();

    const nomeFantasia = document.getElementById('nomeFantasia').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;
    const nomeUsuario = document.getElementById('nomeUsuario').value;
    const cnpj = document.getElementById('cnpj').value;

    createUserWithEmailAndPassword(auth, email, senha)
        .then(userCredential => {
            const user = userCredential.user;
            localStorage.setItem('currentUserUID', user.uid);
            localStorage.setItem('currentUserTipo', 'brecho');
            return writeUserDataBrecho(user.uid, nomeFantasia, email, telefone, senha, nomeUsuario, cnpj);
        })
        .then(() => window.location.href = 'ci_endereco.html')
        .catch(err => alert('Erro: ' + err.message));
});