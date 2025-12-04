import { database } from "../../firebase_connection/firebaseConfig.js";
import {
	ref,
	get,
	update,
	remove,
	push
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

/* ===============================
   ELEMENTOS
================================ */
const formPerfil = document.querySelector("#form-perfil");
const formEndereco = document.querySelector("#form-endereco");
const formAnuncio = document.querySelector("#form-anuncio");

const btnCriarAnuncio = document.querySelector("#btn-criar-anuncio");
const btnExcluirConta = document.querySelector("#btn-excluir-conta");

const inputFoto = document.querySelector("#fotoPerfil");
const previewFoto = document.querySelector("#previewFoto");

const camposUsuario = {
	nomeCompleto: document.querySelector('[name="nomeCompleto"]'),
	nomeDeUsuario: document.querySelector('[name="nomeDeUsuario"]'),
	email: document.querySelector('[name="email"]'),
	cpf: document.querySelector('[name="cpf"]'),
	cnpj: document.querySelector('[name="cnpj"]'),
	telefone: document.querySelector('[name="telefone"]')
};

const camposEndereco = {
	cep: document.querySelector('[name="cep"]'),
	estado: document.querySelector('[name="estado"]'),
	cidade: document.querySelector('[name="cidade"]'),
	bairro: document.querySelector('[name="bairro"]'),
	complemento: document.querySelector('[name="complemento"]')
};

const camposAnuncio = {
	breveDescricao: document.querySelector('[name="breveDescricao"]'),
	detalhes: document.querySelector('[name="detalhes"]')
};

/* ===============================
   VARIÁVEIS
================================ */
const uid = localStorage.getItem("currentUserUID");

let tipoUsuario = "";
let caminhoUsuario = "";
let dadosUsuario = {};
let dadosEndereco = {};
let enderecoId = "";

let anuncioId = null;

/* ===============================
   SEGURANÇA
================================ */
if (!uid) {
	alert("Usuário não autenticado");
	location.href = "../login.html";
}

/* ===============================
   DETECTAR USUÁRIO
================================ */
async function detectarUsuario() {
	const possibilidades = [
		{ tipo: "pessoaFisica", path: `usuarios/pessoaFisica/${uid}` },
		{ tipo: "brecho", path: `usuarios/pessoaJuridica/brechos/${uid}` },
		{ tipo: "instituicao", path: `usuarios/pessoaJuridica/instituicoes/${uid}` }
	];

	for (const item of possibilidades) {
		const snap = await get(ref(database, item.path));
		if (snap.exists()) {
			tipoUsuario = item.tipo;
			caminhoUsuario = item.path;
			dadosUsuario = snap.val();
			enderecoId = dadosUsuario.endereco || "";

			configurarFormulario();
			preencherUsuario();
			carregarEndereco();
			configurarFoto();
			configurarCriarAnuncio();

			if (tipoUsuario === "instituicao") {
				carregarAnuncio();
			}

			return;
		}
	}

	alert("Usuário não encontrado");
}

/* ===============================
   FORM DINÂMICO
================================ */
function configurarFormulario() {
	document.querySelector("#campo-cpf").style.display = "none";
	document.querySelector("#campo-cnpj").style.display = "none";
	formAnuncio.style.display = "none";

	if (tipoUsuario === "pessoaFisica") {
		document.querySelector("#campo-cpf").style.display = "flex";
	}

	if (tipoUsuario === "instituicao" || tipoUsuario === "brecho") {
		document.querySelector("#campo-cnpj").style.display = "flex";
	}

	if (tipoUsuario === "instituicao") {
		formAnuncio.style.display = "flex";
	}
}

/* ===============================
   USUÁRIO
================================ */
function preencherUsuario() {
	Object.keys(camposUsuario).forEach(chave => {
		camposUsuario[chave].value = dadosUsuario[chave] || "";
	});

	if (dadosUsuario.fotoBase64) {
		previewFoto.src = `data:image/jpeg;base64,${dadosUsuario.fotoBase64}`;
	}
}

/* ===============================
   ENDEREÇO
================================ */
async function carregarEndereco() {
	if (!enderecoId) return;

	const snap = await get(ref(database, `enderecos/${enderecoId}`));
	if (!snap.exists()) return;

	dadosEndereco = snap.val();

	Object.keys(camposEndereco).forEach(chave => {
		camposEndereco[chave].value = dadosEndereco[chave] || "";
	});

	// Atualiza cabeçalho do perfil
	document.querySelector(".perfil-info h3").textContent = dadosUsuario.nomeCompleto || "Meu Perfil";
	document.querySelector(".perfil-info .username").textContent = "@" + (dadosUsuario.nomeDeUsuario || "nomeDeUsuario");
}

/* ===============================
   FOTO PERFIL
================================ */
function configurarFoto() {
	inputFoto.addEventListener("change", () => {
		const file = inputFoto.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			previewFoto.src = reader.result;
			dadosUsuario.fotoBase64 = reader.result.split(",")[1];
		};
		reader.readAsDataURL(file);
	});
}

/* ===============================
   SALVAR PERFIL
================================ */
formPerfil.addEventListener("submit", async (e) => {
	e.preventDefault();

	const atualizados = {};

	Object.keys(camposUsuario).forEach(chave => {
		const valor = camposUsuario[chave].value || "";
		if (valor !== (dadosUsuario[chave] || "")) {
			atualizados[chave] = valor;
		}
	});

	if (dadosUsuario.fotoBase64) {
		atualizados.fotoBase64 = dadosUsuario.fotoBase64;
	}

	if (!Object.keys(atualizados).length) {
		alert("Nenhuma alteração no perfil");
		return;
	}

	await update(ref(database, caminhoUsuario), atualizados);
	alert("Perfil atualizado!");
});

/* ===============================
   SALVAR ENDEREÇO
================================ */
formEndereco.addEventListener("submit", async (e) => {
	e.preventDefault();

	const atualizados = {};

	Object.keys(camposEndereco).forEach(chave => {
		const valor = camposEndereco[chave].value || "";
		if (valor !== (dadosEndereco[chave] || "")) {
			atualizados[chave] = valor;
		}
	});

	if (!Object.keys(atualizados).length) {
		alert("Nenhuma alteração no endereço");
		return;
	}

	await update(ref(database, `enderecos/${enderecoId}`), atualizados);
	alert("Endereço atualizado!");
});

/* ===============================
   ANÚNCIO
================================ */
async function carregarAnuncio() {
	const snap = await get(ref(database, "anuncios"));
	if (!snap.exists()) return;

	snap.forEach(child => {
		const anuncio = child.val();
		if (anuncio.idInstituicao === uid) {
			anuncioId = child.key;
			camposAnuncio.breveDescricao.value = anuncio.breveDescricao;
			camposAnuncio.detalhes.value = anuncio.detalhes;
		}
	});
}

formAnuncio.addEventListener("submit", async (e) => {
	e.preventDefault();

	const breveDescricao = camposAnuncio.breveDescricao.value.trim();
	const detalhes = camposAnuncio.detalhes.value.trim();

	if (!breveDescricao || !detalhes) {
		alert("Preencha os campos do anúncio");
		return;
	}

	const enderecoFormatado =
		`CEP: ${dadosEndereco.cep} Rua ${dadosEndereco.rua || ""} n° ${dadosEndereco.numero || ""}, ` +
		`${dadosEndereco.cidade} - ${dadosEndereco.estado}`;

	if (anuncioId) {
		await update(ref(database, `anuncios/${anuncioId}`), {
			breveDescricao,
			detalhes
		});
		alert("Anúncio atualizado!");
	} else {
		await push(ref(database, "anuncios"), {
			breveDescricao,
			detalhes,
			endereco: enderecoFormatado,
			idInstituicao: uid
		});
		alert("Anúncio criado!");
	}
});

/* ===============================
   EXCLUIR CONTA
================================ */
btnExcluirConta.addEventListener("click", async () => {
	const confirmar = confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível.");

	if (!confirmar) return;

	await remove(ref(database, caminhoUsuario));

	if (enderecoId) {
		await remove(ref(database, `enderecos/${enderecoId}`));
	}

	if (tipoUsuario === "instituicao") {
		const anunciosSnap = await get(ref(database, "anuncios"));
		if (anunciosSnap.exists()) {
			anunciosSnap.forEach(child => {
				if (child.val().idInstituicao === uid) {
					remove(ref(database, `anuncios/${child.key}`));
				}
			});
		}
	}

	localStorage.clear();
	alert("Conta excluída com sucesso.");
	location.href = "../cadastro_usuario/index.html";
});

/* ===============================
   CRIAR ANÚNCIO (ATALHO)
================================ */
function configurarCriarAnuncio() {
	if (tipoUsuario === "instituicao") {
		btnCriarAnuncio.style.display = "flex";
	} else {
		btnCriarAnuncio.style.display = "none";
	}
}

/* ===============================
   INIT
================================ */
detectarUsuario();

/* ===============================
   CRIAR ANUNCIO
================================ */
document.getElementById('btn-criar-anuncio').addEventListener('click', function() {
	// Redireciona para a página de criação de anúncio
	window.location.href = '../anuncio/anuncio.html?idInstituicao=' + uid;
});
