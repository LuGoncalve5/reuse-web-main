import { database } from "../../firebase_connection/firebaseConfig.js";
import {
	ref,
	get,
	push
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

/* ===============================
   PEGAR ID DA INSTITUIÇÃO DA URL
================================ */
const params = new URLSearchParams(window.location.search);
const idInstituicao = params.get("idInstituicao");

if (!idInstituicao) {
	alert("Instituição inválida.");
	history.back();
}

/* ===============================
   ELEMENTOS
================================ */
const form = document.querySelector("#form-anuncio");

/* ===============================
   SUBMIT
================================ */
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const breveDescricao =
		form.breveDescricao.value.trim();
	const detalhes =
		form.detalhes.value.trim();

	if (!breveDescricao || !detalhes) {
		alert("Preencha todos os campos.");
		return;
	}

	try {
		/* ===============================
		   BUSCAR INSTITUIÇÃO
		================================ */
		const instSnap = await get(
			ref(
				database,
				`usuarios/pessoaJuridica/instituicoes/${idInstituicao}`
			)
		);

		if (!instSnap.exists()) {
			alert("Instituição não encontrada.");
			return;
		}

		const instituicao = instSnap.val();

		if (!instituicao.endereco) {
			alert("Endereço não encontrado.");
			return;
		}

		/* ===============================
		   BUSCAR ENDEREÇO
		================================ */
		const enderecoSnap = await get(
			ref(database, `enderecos/${instituicao.endereco}`)
		);

		if (!enderecoSnap.exists()) {
			alert("Endereço inválido.");
			return;
		}

		const e = enderecoSnap.val();

		const enderecoFormatado =
			`CEP: ${e.cep}  ` +
			`Rua ${e.rua || ""} n° ${e.numero || ""}, ` +
			`${e.cidade} - ${e.estado}`;

		/* ===============================
		   SALVAR ANÚNCIO
		================================ */
		await push(ref(database, "anuncios"), {
			breveDescricao,
			detalhes,
			endereco: enderecoFormatado,
			idInstituicao
		});

		alert("Anúncio publicado com sucesso!");
		form.reset();
        window.location.href = "../informacoes pessoais/perfil.html";

	} catch (error) {
		console.error("Erro ao criar anúncio:", error);
		alert("Erro ao criar anúncio.");
	}
});
