// === closet.js ===
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { criarCardGaveta } from './cardGaveta.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("✅ closet.js carregado");

    const section = document.querySelector('section');
    const spinner = document.getElementById('spinner');

    const uid = localStorage.getItem('currentUserUID');
    const tipoUsuario = localStorage.getItem('currentUserTipo');

    if (!uid || !tipoUsuario) {
        alert('Erro interno: usuário não identificado.');
        return;
    }

    try {
        // Referência do usuário
        let usuarioRef;
        switch (tipoUsuario) {
            case 'pessoaFisica':
                usuarioRef = ref(database, `usuarios/pessoaFisica/${uid}`);
                break;
            case 'instituicao':
                usuarioRef = ref(database, `usuarios/pessoaJuridica/instituicoes/${uid}`);
                break;
            case 'brecho':
                usuarioRef = ref(database, `usuarios/pessoaJuridica/brechos/${uid}`);
                break;
            default:
                throw new Error('Tipo de usuário desconhecido.');
        }

        // Busca dados do usuário (com IDs de gavetas)
        const snapshotUsuario = await get(usuarioRef);
        if (!snapshotUsuario.exists()){
            console.log("Usuário não encontrado no banco de dados.");
            if (spinner) spinner.remove();
            return;
        }

        const dadosUsuario = snapshotUsuario.val();
        const gavetasUsuario = dadosUsuario.gavetas || {};

        // Se o usuário não tem gavetas ainda
        if (Object.keys(gavetasUsuario).length === 0) {
            console.log("Usuário ainda não tem gavetas personalizadas.");
            if (spinner) spinner.remove();
            return;
        }

        // Busca todas as gavetas do banco principal e filtra só as do usuário
        const gavetasRef = ref(database, 'gavetas');
        const snapshotGavetas = await get(gavetasRef);

        if (!snapshotGavetas.exists()) {
            console.log("Nenhuma gaveta encontrada no banco de dados.");
            if (spinner) spinner.remove();
            return;
        }

        const todasGavetas = snapshotGavetas.val();

        // Para cada gaveta do usuário, cria um card e insere no DOM
        Object.entries(todasGavetas).forEach(([gavetaId, gaveta]) => {
            if (gaveta.donoUID === uid) {
                const card = criarCardGaveta(
                    gavetaId, // agora passamos a key real da gaveta
                    gaveta.nomeGaveta,
                    0,
                    '../../img/banco de fotos/body.jpg'
                );
                section.appendChild(card);
            }
        });


    } catch (err) {
        console.error('❌ Erro ao carregar gavetas do closet:', err);
    } finally {
        if (spinner) {
            spinner.style.opacity = '0';
            spinner.style.transition = 'opacity 0.5s ease';
            setTimeout(() => spinner.remove(), 500);
        }
    }
});
