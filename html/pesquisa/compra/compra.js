// compra.js
import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get, push } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// ====================================
// PEGAR idPeca DA URL
// ====================================
const params = new URLSearchParams(window.location.search);
const idPeca = params.get('idPeca');

if (!idPeca) {
	alert("Peça não identificada.");
	history.back();
}

// ====================================
// ELEMENTOS DA TELA
// ====================================
const nomePeca = document.querySelector('.nome-peça');
const precoPeca = document.querySelector('.preco');
const descricaoPeca = document.querySelector('.info');
const imagemPeca = document.querySelector('.img-produto');
const nomeVendedor = document.querySelector('.nome-vendedor');

const ruaInput = document.querySelector('input[name="rua"]');
const numeroInput = document.querySelector('input[name="numero"]');
const cidadeInput = document.querySelector('input[name="cidade"]');
const estadoInput = document.querySelector('input[name="estado"]');
const complementoInput = document.querySelector('input[name="complemento"]');

const btnConfirmar = document.querySelector('.confirm');

let dadosDaPeca = null;

// ====================================
// BUSCAR DADOS DA PEÇA
// ====================================
async function carregarPeca() {
	const pecaRef = ref(database, `pecas/${idPeca}`);
	const snapshot = await get(pecaRef);

	if (!snapshot.exists()) {
		alert("Peça não encontrada.");
		history.back();
		return;
	}

	const peca = snapshot.val();
	dadosDaPeca = peca;

	nomePeca.textContent = peca.titulo;
	precoPeca.textContent = `R$ ${peca.preco}`;
	descricaoPeca.textContent = peca.descricao;

	if (peca.fotoBase64) {
		imagemPeca.src = `data:image/jpeg;base64,${peca.fotoBase64}`;
	}

	carregarVendedor(peca.ownerUid);
}

// ====================================
// BUSCAR NOME DO VENDEDOR
// ====================================
async function carregarVendedor(ownerUid) {
	const usuariosRef = ref(database, 'usuarios');
	const snapshot = await get(usuariosRef);
	if (!snapshot.exists()) return;

	const usuarios = snapshot.val();
	let nome = 'Usuário';

	if (usuarios.pessoaFisica && usuarios.pessoaFisica[ownerUid]) {
		nome = usuarios.pessoaFisica[ownerUid].nomeCompleto;
	}

	if (usuarios.pessoaJuridica) {
		const { brechos, instituicoes } = usuarios.pessoaJuridica;

		if (brechos && brechos[ownerUid]) {
			nome = brechos[ownerUid].nomeCompleto;
		}

		if (instituicoes && instituicoes[ownerUid]) {
			nome = instituicoes[ownerUid].nomeCompleto;
		}
	}

	nomeVendedor.childNodes[0].nodeValue = nome;
}

// ====================================
// CONFIRMAR COMPRA
// ====================================
btnConfirmar.addEventListener('click', async () => {

	const desejaComprar = confirm("Deseja realmente solicitar a compra desta peça?");
	if (!desejaComprar) return;

	const formaPagamento = document.querySelector('input[name="pag"]:checked')?.value;
	const formaEnvio = document.querySelector('input[name="env"]:checked')?.value;

	if (!formaPagamento || !formaEnvio) {
		alert("Selecione a forma de pagamento e envio.");
		return;
	}

	if (!ruaInput.value || !numeroInput.value || !cidadeInput.value || !estadoInput.value) {
		alert("Preencha o endereço corretamente.");
		return;
	}

	const enderecoCompleto = `
		${ruaInput.value}, nº ${numeroInput.value} -
		${cidadeInput.value}/${estadoInput.value}
		${complementoInput.value}
	`.trim();

	const compradorUID = localStorage.getItem('currentUserUID');

	if (!compradorUID) {
		alert("Usuário não autenticado.");
		return;
	}

	// ====================================
	// SALVAR NO FIREBASE
	// ====================================
	const compraRef = ref(database, 'transacoes/compra');

	await push(compraRef, {
		pecaUID: idPeca,
		compradorUID: compradorUID,
		vendedorUID: dadosDaPeca.ownerUid,
		dataDaTransacao: new Date().toISOString().slice(0, 19).replace('T', ' '),
		enderecoDestino: enderecoCompleto,
		formaEnvio: formaEnvio === 'correios' ? 'Correios' : formaEnvio,
		formaPagamento: formaPagamento.toUpperCase(),
		precoTotal: `R$ ${dadosDaPeca.preco}`
	});

});

// ====================================
// INIT
// ====================================
carregarPeca();
