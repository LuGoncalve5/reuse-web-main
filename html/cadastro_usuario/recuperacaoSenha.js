import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { auth } from '../../firebase_connection/firebaseConfig.js';

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("formEmail");

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = document.getElementById("email").value.trim();
		console.log("Tentando enviar redefinição para:", email);

		if (!email) {
			alert("Por favor, preencha o campo de e-mail!");
			return;
		}

		try {
			await sendPasswordResetEmail(auth, email);
			alert("Link de redefinição enviado (se o e-mail estiver cadastrado). Verifique sua caixa de entrada ou spam!");
			form.reset();
		} catch (error) {
			console.error("Erro ao enviar redefinição:", error.code, error.message);
			alert("Erro ao enviar o e-mail de redefinição de senha. Verifique o e-mail e tente novamente.");
		}
	});
});
