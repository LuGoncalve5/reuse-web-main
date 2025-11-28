// 🔥 REGISTRO FOTO - FIREBASE CONNECTION (final seguro)
import { database } from '../firebaseConfig.js';
import { ref, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('formFoto');
    const inputFoto = document.getElementById('foto');
    const preview = document.getElementById('previewFoto');

    let fotoBase64 = null; // Base64 puro (sem prefixo)

    // 🔹 Converte arquivo → Base64
    function converterParaBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject("Erro ao converter imagem.");
            reader.readAsDataURL(file);
        });
    }

    // 🔹 Input change → preview + Base64 puro
    inputFoto.addEventListener('change', async () => {
        const file = inputFoto.files[0];

        if (!file) {
            fotoBase64 = null;
            preview.src = "../../img/default-profile.png";
            console.warn("Nenhum arquivo selecionado.");
            return;
        }

        // Só aceitar imagens
        if (!file.type.startsWith("image/")) {
            alert("Arquivo inválido. Selecione uma imagem.");
            inputFoto.value = "";
            return;
        }

        try {
            const base64Completo = await converterParaBase64(file);

            // Remove prefixo (data:image/xxx;base64,)
            fotoBase64 = base64Completo.split(",")[1];

            // Preview precisa do prefixo
            preview.src = base64Completo;

            console.log("📸 Base64 gerado com sucesso. Tamanho:", fotoBase64.length);

        } catch (err) {
            console.error("Erro ao converter imagem:", err);
            alert("Erro ao carregar a imagem.");
            fotoBase64 = null;
            preview.src = "../../img/default-profile.png";
        }
    });

    // 🔹 Enviar ao Firebase
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!fotoBase64) {
            alert("Selecione uma foto antes de continuar.");
            return;
        }

        const uid = localStorage.getItem('currentUserUID');
        const tipoUsuario = localStorage.getItem('currentUserTipo');

        if (!uid || !tipoUsuario) {
            console.error("UID ou tipoUsuario inválido:", uid, tipoUsuario);
            alert("Erro interno: usuário não encontrado.");
            return;
        }

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
                alert("Tipo de usuário inválido.");
                return;
        }

        try {
            // ✅ Atualiza apenas se tudo estiver correto
            console.log("Salvando foto para UID:", uid, "Tipo:", tipoUsuario);
            console.log("Tamanho Base64:", fotoBase64.length);

            await update(usuarioRef, { fotoBase64: fotoBase64 });

            alert("Foto salva com sucesso!");
            window.location.href = "../closet/closet.html";

        } catch (err) {
            console.error("🔥 Erro ao salvar no Firebase:", err);
            alert("Erro ao salvar foto.");
        }
    });

});