// registerBrecho.js
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

function isEmailValid(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
function onlyDigits(str) { return str.replace(/\D/g,''); }
function isCNPJValid(cnpj) { return onlyDigits(cnpj).length === 14; }
function isPhoneValid(phone) {
    const d = onlyDigits(phone);
    return d.length >= 10 && d.length <= 11;
}
function isPasswordValid(pwd) { return pwd.length >= 8; }

const form = document.getElementById('formBrecho');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nomeFantasia = document.getElementById('nomeFantasia').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const nomeUsuario = document.getElementById('nomeUsuario').value.trim();
    const cnpj = document.getElementById('cnpj').value.trim();

    document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');

    let valid = true;
    if (!nomeFantasia) { document.getElementById('err-nomeFantasia').style.display = 'block'; valid = false; }
    if (!isEmailValid(email)) { document.getElementById('err-email').style.display = 'block'; valid = false; }
    if (!isPhoneValid(telefone)) { document.getElementById('err-telefone').style.display = 'block'; valid = false; }
    if (!isPasswordValid(senha)) { document.getElementById('err-senha').style.display = 'block'; valid = false; }
    if (!nomeUsuario) { document.getElementById('err-nomeUsuario').style.display = 'block'; valid = false; }
    if (!isCNPJValid(cnpj)) { document.getElementById('err-cnpj').style.display = 'block'; valid = false; }

    if (!valid) return;

    createUserWithEmailAndPassword(auth, email, senha)
        .then(userCredential => {
            const user = userCredential.user;
            localStorage.setItem('currentUserUID', user.uid);
            localStorage.setItem('currentUserTipo', 'brecho');
            return writeUserDataBrecho(user.uid, nomeFantasia, email, telefone, senha, nomeUsuario, cnpj);
        })
        .then(() => window.location.href = 'ci_endereco.html')
        .catch(err => {
            alert('Erro: ' + err.message);
            console.error(err);
        });
});
