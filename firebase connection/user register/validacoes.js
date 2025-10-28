// validacoes.js
console.log("✅ validacoes.js carregado");

/* ==========================================================
   🔹 MÁSCARAS (sem Inputmask — 100% JS puro)
   ========================================================== */
export function aplicarMascaras() {
    console.log("🎭 Aplicando máscaras...");

    const cpf = document.getElementById('cpf');
    const cnpj = document.getElementById('cnpj');
    const telefone = document.getElementById('telefone');
    const cep = document.getElementById('cep');

    if (cpf) {
        cpf.addEventListener('input', () => {
            let v = cpf.value.replace(/\D/g, '');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            cpf.value = v.slice(0, 14);
        });
    }

    if (cnpj) {
        cnpj.addEventListener('input', () => {
            let v = cnpj.value.replace(/\D/g, '');
            v = v.replace(/^(\d{2})(\d)/, '$1.$2');
            v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
            v = v.replace(/(\d{4})(\d)/, '$1-$2');
            cnpj.value = v.slice(0, 18);
        });
    }

    if (telefone) {
        telefone.addEventListener('input', () => {
            let v = telefone.value.replace(/\D/g, '');
            v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
            v = v.replace(/(\d{5})(\d)/, '$1-$2');
            telefone.value = v.slice(0, 15);
        });
    }

    if (cep) {
        cep.addEventListener('input', () => {
            let v = cep.value.replace(/\D/g, '');
            v = v.replace(/(\d{5})(\d)/, '$1-$2');
            cep.value = v.slice(0, 9);
        });
    }
}

/* ==========================================================
   🔹 VALIDAÇÕES
   ========================================================== */

// CPF válido
export function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

// CNPJ válido
export function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado == digitos.charAt(1);
}

// Telefone válido
export function validarTelefone(telRaw) {
	if (!telRaw) return false;
	const tel = telRaw.replace(/\D/g, '');

	// deve ter 10 ou 11 dígitos (ex: 27999998888)
	if (tel.length < 10 || tel.length > 11) return false;

	const ddd = parseInt(tel.slice(0, 2));
	if (isNaN(ddd) || ddd < 11 || ddd > 99) return false; // DDD brasileiro válido

	// número não pode ter todos os dígitos iguais
	if (/^(\d)\1+$/.test(tel)) return false;

	// se tiver 11 dígitos, o terceiro deve ser 9 (celulares)
	if (tel.length === 11 && tel[2] !== '9') return false;

	return true;
}


// E-mail válido e existente (checa domínio)
export async function validarEmail(email) {
    const padrao = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!padrao.test(email)) return false;

    const dominio = email.split('@')[1];
    try {
        const res = await fetch(`https://dns.google/resolve?name=${dominio}&type=MX`);
        const data = await res.json();
        return data && data.Answer && data.Answer.length > 0;
    } catch (e) {
        console.warn('⚠️ Falha ao verificar domínio do e-mail:', e);
        return true; // se offline, considera válido
    }
}

// Data válida (não futura, nem impossível)
export function validarData(dataStr) {
    if (!dataStr) return false;
    const data = new Date(dataStr);
    const hoje = new Date();

    if (isNaN(data.getTime())) return false; // inválida
    if (data > hoje) return false; // futura

    const partes = dataStr.split('-');
    const ano = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const dia = parseInt(partes[2]);

    const valida = new Date(ano, mes, dia);
    return valida.getFullYear() === ano && valida.getMonth() === mes && valida.getDate() === dia;
}

// Nome de usuário único no Firebase
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

export async function validarUsuarioUnico(usuario) {
    const db = getDatabase();
    const snapshotFisica = await get(child(ref(db), 'usuarios/pessoaFisica'));
    const snapshotJuridica = await get(child(ref(db), 'usuarios/pessoaJuridica'));

    const jaExiste = (snap) => {
        if (!snap.exists()) return false;
        return Object.values(snap.val()).some(u => u.nomeDeUsuario?.toLowerCase() === usuario.toLowerCase());
    };

    return !(jaExiste(snapshotFisica) || jaExiste(snapshotJuridica));
}

export function validarNomeUsuario(username) {
	if (!username) return false;
	// não permite espaços e exige apenas letras, números, "_" ou "."
	const regex = /^[a-zA-Z0-9._]+$/;
	return regex.test(username) && username.length >= 3;
}