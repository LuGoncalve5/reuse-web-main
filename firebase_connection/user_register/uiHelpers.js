// uiHelpers.js

export function exibirErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    campo.classList.add('is-invalid');
    if (feedback) feedback.textContent = mensagem;
}


export function limparErro(campoId) {
    const campo = document.getElementById(campoId);
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    campo.classList.remove('is-invalid');
    if (feedback) feedback.textContent = '';
}

export function limparTodosErros(campoIds) {
	campoIds.forEach(id => {
		const campo = document.getElementById(id);
		campo.addEventListener('input', () => limparErro(id));
	});
}