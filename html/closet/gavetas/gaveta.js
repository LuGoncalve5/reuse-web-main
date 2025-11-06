// === GAVETA.JS ===
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', async () => {
	console.log("gaveta.js carregado");

	// Recupera parâmetros da URL
	const urlParams = new URLSearchParams(window.location.search);
	const gavetaId = urlParams.get('idGaveta');
	const usuarioId = urlParams.get('idUsuario');
	const tipo = urlParams.get('tipo');

	if (!gavetaId || !usuarioId || !tipo) {
		alert('Informações insuficientes. Voltando ao closet...');
		window.location.href = '../closet.html';
		return;
	}

	try {
		// Busca gaveta no Firebase
		const gavetaRef = ref(database, `gavetas/${gavetaId}`);
		const snapshot = await get(gavetaRef);

		if (!snapshot.exists()) {
			alert('Gaveta não encontrada.');
			window.location.href = '../closet.html';
			return;
		}

		const dadosGaveta = snapshot.val();
		console.log("Dados da gaveta:", dadosGaveta);

		// Atualiza título
		document.title = dadosGaveta.nomeGaveta || "Minha Gaveta";
		document.querySelector('.topbar-container h1').textContent = dadosGaveta.nomeGaveta || "Minha Gaveta";

		// Carrega peças
		const container = document.getElementById('pecas-container');
		container.innerHTML = ''; // limpa antes

		if (dadosGaveta.listaPecas) {
			for (const idPeca in dadosGaveta.listaPecas) {
				const pecaRef = ref(database, `pecas/${idPeca}`);
				const pecaSnap = await get(pecaRef);
				if (pecaSnap.exists()) {
					const peca = pecaSnap.val();

					const div = document.createElement('div');
					div.classList.add('roupa');
					div.innerHTML = `
						<img src="${peca.imagem || '../../../img/placeholder.png'}" alt="${peca.titulo || 'Peça'}" />
					`;

					// redireciona pra página da peça individual
					div.addEventListener('click', () => {
						window.location.href = `roupas/roupa.html?idPeca=${peca.idPeca}&idUsuario=${usuarioId}&tipo=${tipo}`;
					});

					container.appendChild(div);
				}
			}
		} else {
			container.innerHTML = `<p style="color: white;">Nenhuma peça cadastrada ainda.</p>`;
		}

		// Botão de adicionar nova peça
		document.getElementById('btn-nova-peca').addEventListener('click', () => {
			window.location.href = `../../cadastro closet/cadastro roupa/cr_cpf.html?idGaveta=${gavetaId}&idUsuario=${usuarioId}&tipo=${tipo}`;
		});

	} catch (error) {
		console.error("Erro ao carregar gaveta:", error);
		alert('Erro ao carregar a gaveta. Tente novamente.');
		window.location.href = '../closet.html';
	}
});
