// REGISTE ENDEREÇO USUÁRIO - FIREBASE CONNECTION
import { database } from '../firebaseConfig.js';
import { ref, push, set, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { aplicarMascaras, validarCEP, buscarEnderecoPorCEP, preencherCamposEndereco } from './validacoes.js';
import { exibirErro, limparErro } from './uiHelpers.js';

document.addEventListener('DOMContentLoaded', () => {
    aplicarMascaras();

    const form = document.getElementById('formEndereco');
    const cepInput = document.getElementById('cep');

    // Busca automática de endereço ao sair do campo CEP
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.trim();
        limparErro('cep');

        if (!cep) return;

        const valido = await validarCEP(cep);
        if (!valido) {
            exibirErro('cep', 'CEP inválido ou inexistente.');
            return;
        }

        const dados = await buscarEnderecoPorCEP(cep);
        if (dados) {
            preencherCamposEndereco(dados);
        } else {
            exibirErro('cep', 'CEP não encontrado.');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const uid = localStorage.getItem('currentUserUID');
        const tipoUsuario = localStorage.getItem('currentUserTipo');

        const cep = document.getElementById('cep').value.trim();
        const rua = document.getElementById('rua').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        const cidade = document.getElementById('cidade').value.trim();
        const estado = document.getElementById('estado').value.trim();
        const complemento = document.getElementById('complemento').value.trim();

        const campos = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
        let valido = true;

        // Limpar erros antigos
        campos.forEach(campo => limparErro(campo));

        if (!uid || !tipoUsuario) {
            exibirErro('cep', 'Erro interno: usuário não encontrado.');
            return;
        }

        // Validação obrigatória
        campos.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                exibirErro(id, 'Campo obrigatório.');
                valido = false;
            }
        });


        // Validação do CEP
        if (cep && !(await validarCEP(cep))) {
            exibirErro('cep', 'CEP inválido ou inexistente.');
            valido = false;
        }

        if (!valido) return;

        try {
            // Salva endereço no Realtime Database
            const enderecosRef = ref(database, 'enderecos');
            const novoEnderecoRef = push(enderecosRef);
            const enderecoId = novoEnderecoRef.key;

            await set(novoEnderecoRef, {
                cep,
                rua,
                numero,
                bairro,
                cidade,
                estado,
                complemento
            });


            // Vincula o endereço ao usuário correto
            let usuarioRef;
            switch (tipoUsuario) {
                case 'pessoaFisica':
                    usuarioRef = ref(database, `usuarios/pessoaFisica/${uid}`);
                    break;
                case 'instituicao':
                    usuarioRef = ref(database, `usuarios/pessoaJuridica/instituicoes/${uid}`);
                    break;
                case 'brecho':
                    usuarioRef = ref(database, `usuarios/pessoaJuridica/brechos/${uid}`);
                    break;
                default:
                    exibirErro(cep, 'Tipo de usuário desconhecido.');
                    return;
            }

            await update(usuarioRef, { enderecos: { enderecoPrincipal: enderecoId } });

            // Confirmação e reset do formulário
            form.reset();
            alert('Endereço salvo com sucesso! Você será redirecionado para o closet.');
            setTimeout(() => window.location.href = '../closet/closet.html', 1500);

        } catch (err) {
            console.error(err);
            exibirErro(cep, 'Erro ao salvar endereço. Tente novamente.');
        }
    });
});
