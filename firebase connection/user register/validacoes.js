// validacoes.js
// Máscaras e validações reutilizáveis

function aplicarPlaceholderMascara(input, mascaraExemplo) {
    if (!input.value.trim()) {
        input.value = mascaraExemplo;
        input.classList.add('mascara-placeholder');
        input.addEventListener('focus', () => {
            if (input.classList.contains('mascara-placeholder')) {
                input.value = '';
                input.classList.remove('mascara-placeholder');
            }
        });
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                input.value = mascaraExemplo;
                input.classList.add('mascara-placeholder');
            }
        });
    }
}

function aplicarMascaras() {
    if (!window.Inputmask) {
        console.error('❌ Falha ao carregar Inputmask — verifique o CDN.');
        return;
    }

    // Telefone
    const telInputs = document.querySelectorAll('input[id="telefone"]');
    Inputmask({
        mask: ['(99) 9999-9999', '(99) 99999-9999'],
        placeholder: ' ',
        showMaskOnHover: true,
        showMaskOnFocus: true
    }).mask(telInputs);
    telInputs.forEach(el => aplicarPlaceholderMascara(el, '(  ) _____-____'));

    // CPF
    const cpfInputs = document.querySelectorAll('input[id="cpf"]');
    Inputmask({
        mask: '999.999.999-99',
        placeholder: ' ',
        showMaskOnHover: true,
        showMaskOnFocus: true
    }).mask(cpfInputs);
    cpfInputs.forEach(el => aplicarPlaceholderMascara(el, '___.___.___-__'));
}

// VALIDAÇÕES
function validarCPF(cpfRaw) {
    if (!cpfRaw) return false;
    const cpf = cpfRaw.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    return resto === parseInt(cpf[10]);
}

function validarTelefone(telRaw) {
    if (!telRaw) return false;
    const tel = telRaw.replace(/\D/g, '');
    if (tel.length < 10 || tel.length > 11) return false;
    const ddd = tel.slice(0, 2);
    const dddsValidos = [
        '11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38',
        '41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'
    ];
    return dddsValidos.includes(ddd);
}

function validarEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Torna funções acessíveis globalmente
window.aplicarMascaras = aplicarMascaras;
window.validarCPF = validarCPF;
window.validarTelefone = validarTelefone;
window.validarEmail = validarEmail;
