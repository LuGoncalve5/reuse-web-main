import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, set, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDfYcoijl5D_0EJk4pO1SjPFjeOnzzrsTM",
    authDomain: "reuse-1512f.firebaseapp.com",
    projectId: "reuse-1512f",
    storageBucket: "reuse-1512f.firebasestorage.app",
    messagingSenderId: "296992709188",
    appId: "1:296992709188:web:d1135e3a8beee9ac1f7a11"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.getElementById('cep').addEventListener('blur', async () => {
    const cep = document.getElementById('cep').value.replace(/\D/g,'');
    if (cep.length === 8) {
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                document.getElementById('rua').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            }
        } catch(e) { console.error(e); alert('Erro ao buscar CEP'); }
    }
});

document.getElementById('formEndereco').addEventListener('submit', async (e) => {
    e.preventDefault();

    const uid = localStorage.getItem('currentUserUID');
    const tipoUsuario = localStorage.getItem('currentUserTipo');

    if (!uid || !tipoUsuario) {
        alert('Erro: dados do usuário não encontrados.');
        return;
    }

    const enderecoData = {
        cep: document.getElementById('cep').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        complemento: document.getElementById('complemento').value
    };

    try {
        const enderecosRef = ref(database,'enderecos');
        const novoEnderecoRef = push(enderecosRef);
        const enderecoId = novoEnderecoRef.key;
        await set(novoEnderecoRef, enderecoData);

        let usuarioRef;
        switch(tipoUsuario) {
            case 'pessoaFisica':
                usuarioRef = ref(database, `usuarios/pessoaFisica/${uid}`);
                break;
            case 'instituicao':
                usuarioRef = ref(database, `usuarios/pessoaJuridica/instituicoes/${uid}`);
                break;
            case 'brecho':
                usuarioRef = ref(database, `usuarios/pessoaJuridica/brechos/${uid}`);
                break;
            default: throw new Error('Tipo desconhecido');
        }

        await update(usuarioRef, { enderecos: { enderecoPrincipal: enderecoId } });
        localStorage.removeItem('currentUserUID');
        localStorage.removeItem('currentUserTipo');
        alert('Cadastro concluído com sucesso!');
        window.location.href = '../closet/closet.html';
    } catch(err) {
        console.error(err);
        alert('Erro ao salvar endereço.');
    }
});