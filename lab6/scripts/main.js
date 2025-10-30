import { produtos } from './produtos.js';

/* --- Inicialização do localStorage --- */
if (!localStorage.getItem('produtos-selecionados')) {
  localStorage.setItem('produtos-selecionados', JSON.stringify([]));
}

/* --- Ao carregar a página --- */
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos(produtos);
  atualizaCesto();
});

/* --- Função que renderiza os produtos da loja --- */
function carregarProdutos(lista) {
  const ulProdutos = document.getElementById('lista-produtos');
  ulProdutos.textContent = '';

  lista.forEach((produto) => {
    const li = document.createElement('li');
    const artigo = criarProduto(produto);
    li.append(artigo);
    ulProdutos.append(li);
  });
}

/* --- Cria o artigo de um produto (na loja) --- */
function criarProduto(produto) {
  const artigo = document.createElement('article');
  artigo.className = 'card';
  artigo.setAttribute('data-id', produto.id);

  // header
  const header = document.createElement('header');
  const titulo = document.createElement('h3');
  titulo.textContent = produto.title;
  header.append(titulo);

  // imagem
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image;
  img.alt = produto.title;
  img.width = 180;
  const figcaption = document.createElement('figcaption');
  figcaption.textContent = produto.category;
  figure.append(img, figcaption);

  // descrição
  const pDesc = document.createElement('p');
  pDesc.className = 'descricao';
  pDesc.textContent = produto.description;

  // preço
  const pPreco = document.createElement('p');
  pPreco.className = 'preco';
  pPreco.innerHTML = `<strong>${formatarEuro(produto.price)}</strong>`;

  // botão
  const footer = document.createElement('footer');
  const botao = document.createElement('button');
  botao.textContent = '+ Adicionar ao cesto';
  botao.className = 'btn';
  botao.addEventListener('click', () => {
    adicionarAoCesto(produto);
    document.getElementById('cesto').scrollIntoView({ behavior: 'smooth' });
  });
  footer.append(botao);

  artigo.append(header, figure, pDesc, pPreco, footer);
  return artigo;
}

/* --- Adiciona ao cesto e guarda no localStorage --- */
function adicionarAoCesto(produto) {
  const lista = JSON.parse(localStorage.getItem('produtos-selecionados'));
  const existente = lista.find((p) => p.id === produto.id);

  if (existente) {
    existente.qtd += 1;
  } else {
    lista.push({ ...produto, qtd: 1 });
  }

  localStorage.setItem('produtos-selecionados', JSON.stringify(lista));
  atualizaCesto();
}

/* --- Atualiza o cesto no DOM --- */
function atualizaCesto() {
  const listaCesto = document.getElementById('cesto-itens');
  const totalEl = document.getElementById('cesto-total');
  listaCesto.textContent = '';

  const lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  let total = 0;

  if (lista.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = '<p class="cesto-vazio">O cesto está vazio.</p>';
    listaCesto.append(li);
  } else {
    lista.forEach((produto) => {
      const artigo = criaProdutoCesto(produto);
      const li = document.createElement('li');
      li.append(artigo);
      listaCesto.append(li);
      total += produto.price * produto.qtd;
    });
  }

  totalEl.textContent = formatarEuro(total);
}

/* --- Cria o artigo de um produto dentro do cesto --- */
function criaProdutoCesto(produto) {
  const artigo = document.createElement('article');
  artigo.className = 'cart-item';

  const img = document.createElement('img');
  img.src = produto.image;
  img.alt = produto.title;
  img.width = 110;

  const info = document.createElement('section');
  info.className = 'cart-info';

  const titulo = document.createElement('h4');
  titulo.textContent = produto.title;

  const precoLinha = document.createElement('p');
  const subtotal = produto.price * produto.qtd;
  precoLinha.innerHTML =
    `Preço: <strong>${formatarEuro(produto.price)}</strong> · ` +
    `Qtd: <strong>${produto.qtd}</strong> · ` +
    `Total: <strong>${formatarEuro(subtotal)}</strong>`;

  info.append(titulo, precoLinha);

  const botoes = document.createElement('footer');
  botoes.className = 'cart-actions';

  const btnRemover = document.createElement('button');
  btnRemover.textContent = 'Remover';
  btnRemover.className = 'btn btn-outline';
  btnRemover.addEventListener('click', () => removerDoCesto(produto.id));

  botoes.append(btnRemover);
  artigo.append(img, info, botoes);
  return artigo;
}

/* --- Remove um produto do cesto e do localStorage --- */
function removerDoCesto(id) {
  let lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  lista = lista.filter((p) => p.id !== id);
  localStorage.setItem('produtos-selecionados', JSON.stringify(lista));
  atualizaCesto();
}

/* --- Utilitário --- */
function formatarEuro(valor) {
  return valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}
