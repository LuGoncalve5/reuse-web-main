// === GAVETA.JS ===
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { criarCardPeca } from '../../closet/insercao_pecas_gaveta/cardPeca.js';

document.addEventListener('DOMContentLoaded', async () => {
	console.log("gaveta.js carregado");

	// Recupera parâmetros da URL
	const urlParams = new URLSearchParams(window.location.search);
	const gavetaId = urlParams.get('idGaveta');
	const usuarioId = localStorage.getItem('currentUserUID');
	const tipo = localStorage.getItem('currentUserTipo');

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
		document.title = dadosGaveta.nome || "Minha Gaveta";
		document.querySelector('.topbar-container h3').textContent = dadosGaveta.nome || "Minha Gaveta";

		// Carrega peças
		const container = document.getElementById('pecas-container');
		container.innerHTML = ''; // limpa antes

		if (dadosGaveta.pecas) {
			for (const idPeca in dadosGaveta.pecas) {
				const pecaRef = ref(database, `pecas/${idPeca}`);
				const pecaSnap = await get(pecaRef);
				if (pecaSnap.exists()) {
					const peca = pecaSnap.val();

					const card = criarCardPeca(
						idPeca,                     // ID
						peca.titulo || "Sem título",
						peca.valor || "0,00",
						peca.finalidade || "venda",
						peca.imagem || "../../../img/placeholder.png"
					);

					container.appendChild(card);
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
