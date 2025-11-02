import { produtos } from './produtos.js';

/* --- Inicialização do localStorage --- */
if (!localStorage.getItem('produtos-selecionados')) {
  localStorage.setItem('produtos-selecionados', JSON.stringify([]));
}

/* --- Estado simples da listagem --- */
let estado = {
  filtro: 'todas',
  ordenar: 'preco', // preco | preco crescente | preco decrescente
  pesquisa: ''
};

/* --- Ao carregar a página --- */
document.addEventListener('DOMContentLoaded', () => {
  // liga eventos do filtrar
  document.getElementById('filtro-categoria').addEventListener('change', e => {
    estado.filtro = e.target.value;
    renderLista();
  });
  document.getElementById('ordenar-produtos').addEventListener('change', e => {
    estado.ordenar = e.target.value;
    renderLista();
  });
  document.getElementById('pesquisar').addEventListener('input', e => {
    estado.pesquisa = e.target.value.toLowerCase();
    renderLista();
  });

  // checkout
  document.getElementById('btn-comprar').addEventListener('click', finalizarCompra);
  document.getElementById('chk-deisi').addEventListener('change', atualizarResumoFinal);
  document.getElementById('input-cupao').addEventListener('input', atualizarResumoFinal);

  renderLista();
  atualizaCesto();
  atualizarResumoFinal(); // inicial
});

/* ---------------- LISTA DE PRODUTOS ---------------- */

function renderLista() {
  // filtrar
  let lista = produtos.filter(p => {
    const okCat = estado.filtro === 'todas' || p.category === estado.filtro;
    const q = estado.pesquisa.trim();
    const okSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return okCat && okSearch;
  });

  // ordenar
  if (estado.ordenar === 'preco-asc') {
    lista.sort((a,b) => a.price - b.price);
  } else if (estado.ordenar === 'preco-desc') {
    lista.sort((a,b) => b.price - a.price);
  } else {
    // "preco" (sem direção) -> mantém a ordem original do array
  }

  carregarProdutos(lista);
}

/* --- Renderizar produtos --- */
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

function criarProduto(produto) {
  const artigo = document.createElement('article');
  artigo.className = 'card';
  artigo.setAttribute('data-id', produto.id);

  const header = document.createElement('header');
  const titulo = document.createElement('h3');
  titulo.textContent = produto.title;
  header.append(titulo);

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image;
  img.alt = produto.title;
  img.width = 180;
  const figcaption = document.createElement('figcaption');
  figcaption.textContent = produto.category;
  figure.append(img, figcaption);

  const pDesc = document.createElement('p');
  pDesc.className = 'descricao';
  pDesc.textContent = produto.description;

  const pPreco = document.createElement('p');
  pPreco.className = 'preco';
  pPreco.innerHTML = `<strong>${formatarEuro(produto.price)}</strong>`;

  const footer = document.createElement('footer');
  const botao = document.createElement('button');
  botao.textContent = '+ Adicionar ao cesto';
  botao.className = 'btn';
  botao.addEventListener('click', () => {
    adicionarAoCesto(produto);
    atualizaCesto();
    atualizarResumoFinal();
    document.getElementById('cesto').scrollIntoView({ behavior: 'smooth' });
  });
  footer.append(botao);

  artigo.append(header, figure, pDesc, pPreco, footer);
  return artigo;
}

/* ---------------- CESTO ---------------- */

function adicionarAoCesto(produto) {
  const lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  const existente = lista.find((p) => p.id === produto.id);

  if (existente) existente.qtd += 1;
  else lista.push({ ...produto, qtd: 1 });

  localStorage.setItem('produtos-selecionados', JSON.stringify(lista));
}

function atualizaCesto() {
  const listaCesto = document.getElementById('cesto-itens');
  const totalEl = document.getElementById('cesto-total');
  listaCesto.textContent = '';

  const lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  let totalCents = 0;

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
      totalCents += toCents(produto.price) * produto.qtd;
    });
  }

  totalEl.textContent = formatarEuro(fromCents(totalCents));
}

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
  btnRemover.addEventListener('click', () => {
    removerDoCesto(produto.id);
    atualizarResumoFinal();
  });

  botoes.append(btnRemover);
  artigo.append(img, info, botoes);
  return artigo;
}

function removerDoCesto(id) {
  let lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  lista = lista.filter((p) => p.id !== id);
  localStorage.setItem('produtos-selecionados', JSON.stringify(lista));
  atualizaCesto();
}

/* ---------------- CHECKOUT / DESCONTOS ---------------- */

function obterTotalCestoEmCents() {
  const lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  return lista.reduce((acc, p) => acc + toCents(p.price) * p.qtd, 0);
}

// Regras simples de desconto:
// - Estudante DEISI: 25%
// - Cupão "DEISI10": -10% (acumula)
// Calculado sempre em cêntimos (evita erros decimais)
function calcularValorFinal(totalCents, estudante, cupao) {
  let valor = totalCents;
  if (estudante) valor = Math.round(valor * 0.75);
  if (cupao && cupao.toUpperCase() === 'DEISI10') {
    valor = Math.round(valor * 0.90);
  }
  return valor;
}

function atualizarResumoFinal() {
  const totalCesto = obterTotalCestoEmCents();
  const estudante = document.getElementById('chk-deisi').checked;
  const cupao = document.getElementById('input-cupao').value.trim();

  const finalCents = calcularValorFinal(totalCesto, estudante, cupao);
  document.getElementById('total-final').textContent = formatarEuro(fromCents(finalCents));

  const box = document.getElementById('resultado-final');
  box.hidden = (fromCents(totalCesto) === 0);
}

function finalizarCompra() {
  const totalCesto = obterTotalCestoEmCents();
  if (totalCesto === 0) return;

  const estudante = document.getElementById('chk-deisi').checked;
  const cupao = document.getElementById('input-cupao').value.trim();
  const finalCents = calcularValorFinal(totalCesto, estudante, cupao);

  // mostra total final
  document.getElementById('total-final').textContent = formatarEuro(fromCents(finalCents));
  document.getElementById('resultado-final').hidden = false;

  // gera referência simples: yymmdd-XXXX
  const hoje = new Date();
  const yymmdd =
    String(hoje.getFullYear()).slice(-2) +
    String(hoje.getMonth() + 1).padStart(2, '0') +
    String(hoje.getDate()).padStart(2, '0');
  const seq = Math.floor(Math.random() * 9000) + 1000;
  document.getElementById('ref-pagamento').textContent = `${yymmdd}-${seq}`;

  // (opcional) poderias limpar o cesto aqui:
  // localStorage.setItem('produtos-selecionados', JSON.stringify([]));
  // atualizaCesto(); atualizarResumoFinal();
}

/* ---------------- Utilitários ---------------- */
function formatarEuro(valor) {
  return valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}
const toCents = (v) => Math.round(v * 100);
const fromCents = (c) => c / 100;
