// validacoes.js
// Módulo ES: máscaras e validações reutilizáveis.
// Coloque este arquivo na mesma pasta que registerComum.js
export function aplicarMascaras() {
    // garante que Inputmask existe
    if (!window.Inputmask) {
        console.warn('Inputmask não encontrado. Verifique se incluiu o CDN antes de carregar os módulos.');
        return;
    }

    // Telefone: (99) 99999-9999 (aceita 4 ou 5 dígitos no meio)
    Inputmask({
        mask: '(99) 99999-9999',
        placeholder: '_',
        showMaskOnHover: false,
        showMaskOnFocus: true
    }).mask(document.querySelectorAll('input[id="telefone"]'));

    // CPF: 999.999.999-99
    Inputmask({
        mask: '999.999.999-99',
        placeholder: '_',
        showMaskOnHover: false,
        showMaskOnFocus: true
    }).mask(document.querySelectorAll('input[id="cpf"]'));

    // CEP: 99999-999 (usado se houver formulário de CEP)
    Inputmask({
        mask: '99999-999',
        placeholder: '_',
        showMaskOnHover: false,
        showMaskOnFocus: true
    }).mask(document.querySelectorAll('input[id="cep"]'));

    // CNPJ (caso use em outros formulários): 99.999.999/9999-99
    Inputmask({
        mask: '99.999.999/9999-99',
        placeholder: '_',
        showMaskOnHover: false,
        showMaskOnFocus: true
    }).mask(document.querySelectorAll('input[id="cnpj"]'));
}

/* ======= VALIDAÇÕES ======= */

/* CPF: valida com algoritmo de dígitos verificadores */
export function validarCPF(cpfRaw) {
    if (!cpfRaw) return false;
    const cpf = cpfRaw.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // mesmo dígito repetido

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

/* CNPJ: valida com algoritmo de dígitos verificadores */
export function validarCNPJ(cnpjRaw) {
    if (!cnpjRaw) return false;
    const cnpj = cnpjRaw.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const calc = (cnpjArr, size) => {
        const pesos = size === 12
            ? [5,4,3,2,9,8,7,6,5,4,3,2]
            : [6,5,4,3,2,9,8,7,6,5,4,3,2];
        let soma = 0;
        for (let i = 0; i < pesos.length; i++) soma += parseInt(cnpjArr[i]) * pesos[i];
        let resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const nums = cnpj.split('').map(d => parseInt(d));
    const d1 = calc(nums, 12);
    if (d1 !== nums[12]) return false;
    const d2 = calc(nums, 13);
    if (d2 !== nums[13]) return false;
    return true;
}

/* Telefone: checa padrão (99) 99999-9999 ou (99) 9999-9999 */
export function validarTelefone(telRaw) {
    if (!telRaw) return false;
    const tel = telRaw.replace(/\D/g, '');
    // considera DDD + 8 ou 9 dígitos
    if (tel.length < 10 || tel.length > 11) return false;
    // opcional: checar se DDD é válido (lista mínima)
    const ddd = tel.slice(0,2);
    const dddsValidos = [
        '11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38',
        '41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'
    ];
    if (!dddsValidos.includes(ddd)) return false;
    return true;
}

/* Validação básica de email (regex simples) */
export function validarEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
