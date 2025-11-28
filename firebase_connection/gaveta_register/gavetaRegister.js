// REGISTE GAVETA USUÁRIO - FIREBASE CONNECTION
import { database } from '../../firebase_connection/firebaseConfig.js';
import { ref, push, set, update, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formGaveta');
    const nomeGavetaInput = document.getElementById('nomeGaveta');
    const btnPrivado = document.getElementById('btnPrivado');
    const btnPublico = document.getElementById('btnPublico');
    const btnCriarGaveta = document.getElementById('btnCriarGaveta');
    let isPrivado = true;

    // Alterna seleção de privacidade
    btnPrivado.addEventListener('click', (e) => {
        e.preventDefault();
        isPrivado = true;
        btnPrivado.classList.add('active');
        btnPublico.classList.remove('active');
    });

    btnPublico.addEventListener('click', (e) => {
        e.preventDefault();
        isPrivado = false;
        btnPublico.classList.add('active');
        btnPrivado.classList.remove('active');
    });

    // Envio do formulário
    btnCriarGaveta.addEventListener('click', async (e) => {
        e.preventDefault();

        const nomeGaveta = nomeGavetaInput.value.trim();
        if (!nomeGaveta) {
            alert('Por favor, insira um nome para a gaveta.');
            return;
        }

        // Recupera dados do usuário
        const uid = localStorage.getItem('currentUserUID');
        const tipoUsuario = localStorage.getItem('currentUserTipo');

        if (!uid || !tipoUsuario) {
            alert('Erro interno: usuário não encontrado. Tente abrir novamente.');
            window.location.href = '../../login.html';
            return;
        }

        try {
            // Cria a gaveta em /gavetas
            const gavetasRef = ref(database, 'gavetas');
            const novaGavetaRef = push(gavetasRef);
            const gavetaId = novaGavetaRef.key;

            await set(novaGavetaRef, {
                nome: nomeGaveta,
                privado: isPrivado,
                dataCriacao: new Date().toISOString(),
                ownerUid: uid
            });
            
            alert('Gaveta criada com sucesso!');

            // Redireciona, se desejar
            setTimeout(() => {
                window.location.href = `../../closet/gaveta/gaveta.html?id=${gavetaId}`;
            }, 1000);

        } catch (err) {
            console.error('Erro ao criar gaveta:', err);
            alert('Erro ao criar gaveta. Tente novamente.');
        }
    });
});
