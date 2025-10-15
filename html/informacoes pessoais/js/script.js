// Seleciona os botões
const botoes = document.querySelectorAll('.btn');

// Adiciona a classe "ativo" no botão clicado
botoes.forEach(btn => {
  btn.addEventListener('click', () => {
    botoes.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
  });
});