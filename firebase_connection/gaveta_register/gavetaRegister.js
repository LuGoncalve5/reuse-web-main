import { database } from '../../firebase_connection/firebaseConfig.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
  const nomeGavetaInput = document.getElementById('nomeGaveta');
  const btnPrivado = document.getElementById('btnPrivado');
  const btnPublico = document.getElementById('btnPublico');
  const btnCriarGaveta = document.getElementById('btnCriarGaveta');
  const fotoGaveta = document.getElementById('fotoGaveta');
  const previewFoto = document.getElementById('previewFoto');
  const fileName = document.getElementById('fileName');

  let isPrivado = true;

  // Alterna seleção de privacidade
  btnPrivado.addEventListener('click', (e) => {
    e.preventDefault();
    isPrivado = true;
    btnPrivado.classList.add('active');
    btnPublico.classList.remove('active');
  });

  btnPublico.addEventListener('click', (e) => {
    e.preventDefault();
    isPrivado = false;
    btnPublico.classList.add('active');
    btnPrivado.classList.remove('active');
  });

  // Preview da foto e mostrar nome do arquivo
  fotoGaveta.addEventListener('change', () => {
    const file = fotoGaveta.files[0];
    if (file) {
      fileName.textContent = file.name;
      const reader = new FileReader();
      reader.onload = function (e) {
        previewFoto.src = e.target.result;
        previewFoto.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      fileName.textContent = 'Nenhum arquivo selecionado';
      previewFoto.style.display = 'none';
      previewFoto.src = '';
    }
  });

  // Criar gaveta
  btnCriarGaveta.addEventListener('click', async (e) => {
    e.preventDefault();

    const nomeGaveta = nomeGavetaInput.value.trim();
    if (!nomeGaveta) {
      alert('Por favor, insira um nome para a gaveta.');
      return;
    }

    const uid = localStorage.getItem('currentUserUID');
    const tipoUsuario = localStorage.getItem('currentUserTipo');

    if (!uid || !tipoUsuario) {
      alert('Erro interno: usuário não encontrado. Tente abrir novamente.');
      window.location.href = '../../login.html';
      return;
    }

    try {
      let fotoBase64 = '';
      if (fotoGaveta.files.length > 0) {
        const file = fotoGaveta.files[0];
        fotoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
      }

      const gavetasRef = ref(database, 'gavetas');
      const novaGavetaRef = push(gavetasRef);
      const gavetaId = novaGavetaRef.key;

      await set(novaGavetaRef, {
        nome: nomeGaveta,
        privado: isPrivado,
        dataCriacao: new Date().toISOString(),
        ownerUid: uid,
        fotoBase64: fotoBase64,
      });

      alert('Gaveta criada com sucesso!');
      setTimeout(() => {
        window.location.href = `../../closet/gaveta/gaveta.html?id=${gavetaId}`;
      }, 1000);

    } catch (err) {
      console.error('Erro ao criar gaveta:', err);
      alert('Erro ao criar gaveta. Tente novamente.');
    }
  });
});
