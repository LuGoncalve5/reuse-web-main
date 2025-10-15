// ==========================
// 📌 Funções genéricas
// ==========================
function toggleError(messageId, condition) {
    const message = document.getElementById(messageId);
    if (message) {
        message.classList.toggle('d-none', condition);
    }
}

// ==========================
// 📌 Máscaras
// ==========================
export function aplicarMascaraTelefone(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
        input.value = v;
    });
}

export function aplicarMascaraCPF(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = v;
    });
}

export function aplicarMascaraCNPJ(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
        input.value = v;
    });
}

// ==========================
// 📌 Validações de campos
// ==========================
export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validarTelefone(telefone) {
    const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return regex.test(telefone);
}

export function validarCPF(cpf) {
    const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return regex.test(cpf);
}

export function validarCNPJ(cnpj) {
    const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return regex.test(cnpj);
}

export function validarNomeCompleto(nome) {
    return nome.trim().split(/\s+/).length >= 2;
}

export function validarData(data) {
    return data && data.trim() !== '';
}

// ==========================
// 📌 Validações completas por formulário
// ==========================
export function validarFormularioComum(form) {
    form.addEventListener('submit', (e) => {
        let valido = true;

        const nome = form.querySelector('#nome');
        const email = form.querySelector('#email');
        const telefone = form.querySelector('#telefone');
        const cpf = form.querySelector('#cpf');
        const nascimento = form.querySelector('#nascimento');

        // Nome
        toggleError('nomeError', validarNomeCompleto(nome.value));
        if (!validarNomeCompleto(nome.value)) valido = false;

        // Email
        toggleError('emailError', validarEmail(email.value));
        if (!validarEmail(email.value)) valido = false;

        // Telefone
        toggleError('telefoneError', validarTelefone(telefone.value));
        if (!validarTelefone(telefone.value)) valido = false;

        // CPF
        toggleError('cpfError', validarCPF(cpf.value));
        if (!validarCPF(cpf.value)) valido = false;

        // Data
        toggleError('nascimentoError', validarData(nascimento.value));
        if (!validarData(nascimento.value)) valido = false;

        if (!valido) e.preventDefault();
    });
}

export function validarFormularioInstituicao(form) {
    form.addEventListener('submit', (e) => {
        let valido = true;

        const nomeFantasia = form.querySelector('#nomeFantasia');
        const email = form.querySelector('#email');
        const telefone = form.querySelector('#telefone');
        const cnpj = form.querySelector('#cnpj');

        toggleError('nomeFantasiaError', nomeFantasia.value.trim().length >= 3);
        if (nomeFantasia.value.trim().length < 3) valido = false;

        toggleError('emailError', validarEmail(email.value));
        if (!validarEmail(email.value)) valido = false;

        toggleError('telefoneError', validarTelefone(telefone.value));
        if (!validarTelefone(telefone.value)) valido = false;

        toggleError('cnpjError', validarCNPJ(cnpj.value));
        if (!validarCNPJ(cnpj.value)) valido = false;

        if (!valido) e.preventDefault();
    });
}

export function validarFormularioLoja(form) {
    // Loja é igual à instituição aqui, mas pode mudar depois
    validarFormularioInstituicao(form);
}
