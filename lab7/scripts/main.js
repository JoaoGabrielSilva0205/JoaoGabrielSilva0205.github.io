/* --- Config API --- */
const API_BASE = 'https://deisishop.pythonanywhere.com';

async function apiGet(path) {
  const url = `${API_BASE}/${path.replace(/^\/+/,'')}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function apiPost(path, data) {
  const url = `${API_BASE}/${path.replace(/^\/+/, '')}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });

  // tenta ler JSON ou texto de erro para diagnosticar
  let payloadTexto = '';
  try { payloadTexto = await res.clone().text(); } catch {}

  if (!res.ok) {
    throw new Error(`POST ${url} -> ${res.status} ${res.statusText}\n${payloadTexto}`);
  }

  try { return await res.json(); }
  catch { return {}; }
}

/* --- Estado --- */
let estado = {
  filtro: 'todas',
  ordenar: 'preco', // preco | preco-asc | preco-desc
  pesquisa: '',
  produtos: [],
  categorias: []
};

/* --- Inicialização do localStorage --- */
if (!localStorage.getItem('produtos-selecionados')) {
  localStorage.setItem('produtos-selecionados', JSON.stringify([]));
}

/* --- Ao carregar a página --- */
document.addEventListener('DOMContentLoaded', () => {
  // filtros
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
  document.getElementById('chk-deisi').addEventListener('change', () => {
    bloquearCupaoSeEstudante();
    atualizarResumoFinal();
  });
  document.getElementById('input-cupao').addEventListener('input', atualizarResumoFinal);
  
  // so permite letras e acentos na parte do nome   
  const inputNome = document.getElementById('input-nome');
  if (inputNome) {
    inputNome.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    });
  }

  // arranque
  carregarDadosIniciais();
});

/* ---------------- CARREGAMENTO API ---------------- */
async function carregarDadosIniciais() {
  try {
    // Carregar categorias e produtos em paralelo
    const [categorias, produtos] = await Promise.all([
      apiGet('categories/'),
      apiGet('products/')
    ]);

    estado.categorias = Array.isArray(categorias) ? categorias : [];
    estado.produtos = Array.isArray(produtos) ? produtos : [];

    popularSelectCategorias(estado.categorias);
    renderLista();
    atualizaCesto();
    bloquearCupaoSeEstudante();
    atualizarResumoFinal();
  } catch (err) {
    console.error(err);
    // fallback visual simples
    const ulProdutos = document.getElementById('lista-produtos');
    ulProdutos.textContent = '';
    const li = document.createElement('li');
    li.innerHTML = `<p style="color:#b91c1c"><strong>Não foi possível carregar os produtos.</strong> Verifica a ligação e tenta novamente.</p>`;
    ulProdutos.append(li);
  }
}

function popularSelectCategorias(categorias) {
  const sel = document.getElementById('filtro-categoria');
  // limpa opções atuais exceto a primeira (“todas”)
  sel.innerHTML = '';
  const optTodas = document.createElement('option');
  optTodas.value = 'todas';
  optTodas.textContent = 'Todas as categorias';
  sel.append(optTodas);

  (categorias || []).forEach(cat => {
    const o = document.createElement('option');
    o.value = cat;
    o.textContent = cat;
    sel.append(o);
  });
}

/* ---------------- LISTA DE PRODUTOS ---------------- */
function renderLista() {
  // filtrar
  let lista = (estado.produtos || []).filter(p => {
    const okCat = estado.filtro === 'todas' || p.category === estado.filtro;
    const q = estado.pesquisa.trim();
    const okSearch = !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return okCat && okSearch;
  });

  // ordenar
  if (estado.ordenar === 'preco-asc') {
    lista.sort((a,b) => a.price - b.price);
  } else if (estado.ordenar === 'preco-desc') {
    lista.sort((a,b) => b.price - a.price);
  } // "preco": mantém ordem da API

  carregarProdutos(lista);
}

function carregarProdutos(lista) {
  const ulProdutos = document.getElementById('lista-produtos');
  ulProdutos.textContent = '';

  (lista || []).forEach((produto) => {
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
  pDesc.textContent = produto.description || '';

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

function bloquearCupaoSeEstudante() {
  const chk = document.getElementById('chk-deisi');
  const input = document.getElementById('input-cupao');

  // nunca desativar
  input.disabled = false;

  input.placeholder = 'Introduza o cupão ';
}

function atualizarResumoFinal() {
  const totalCesto = obterTotalCestoEmCents();
  document.getElementById('total-final').textContent = formatarEuro(fromCents(totalCesto));
  document.getElementById('resultado-final').hidden = (fromCents(totalCesto) === 0);
}

async function finalizarCompra() {
  const totalCesto = obterTotalCestoEmCents();
  if (totalCesto === 0) return;

  const estudante = document.getElementById('chk-deisi').checked;
  const cupao = document.getElementById('input-cupao').value.trim();
  const nomeInput = document.getElementById('input-nome');
  const nomeCliente = (nomeInput && nomeInput.value.trim()) ? nomeInput.value.trim() : '';

  // 1) forçar número e remover duplicados
  const lista = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
  const idsNumericos = lista
    .map(p => Number(p.id))
    .filter(n => Number.isFinite(n));          // só números válidos

  const products = Array.from(new Set(idsNumericos)); // sem repetição

  if (!products.length) {
    alert('Cesto vazio ou IDs inválidos.');
    return;
  }

  // 2) enviar sempre coupon e name como string (mesmo vazios)
  const payload = {
    products,
    student: Boolean(estudante),
    coupon: cupao || "",
    name: nomeCliente || ""
  };

  try {
    console.log('POST /buy/ payload:', payload);
    const resp = await apiPost('buy/', payload);

    if (resp && typeof resp.error === 'string' && resp.error.trim() !== '') {
      alert(resp.error);
      return;
    }

    document.getElementById('resultado-final').hidden = false;

    const nomeSpan = document.getElementById('nome-cliente');
    if (nomeSpan) nomeSpan.textContent = nomeCliente || '—';

    const totalNumber = Number.parseFloat(resp?.totalCost);
    const totalSpan = document.getElementById('total-final');
    totalSpan.textContent = Number.isFinite(totalNumber)
      ? formatarEuro(totalNumber)
      : `${resp?.totalCost ?? fromCents(totalCesto)} €`;

    document.getElementById('ref-pagamento').textContent = resp?.reference || '—';

    const msg = document.getElementById('mensagem-api');
    if (msg) {
      if (resp?.example) { msg.textContent = resp.example; msg.hidden = false; }
      else { msg.textContent = ''; msg.hidden = true; }
    }

  } catch (err) {
    console.warn('Falha na compra na API:', err);
    alert(`Compra falhou:\n${err.message}`);

    document.getElementById('resultado-final').hidden = false;
    const nomeSpan = document.getElementById('nome-cliente');
    if (nomeSpan) nomeSpan.textContent = nomeCliente || '—';
    document.getElementById('total-final').textContent = formatarEuro(fromCents(totalCesto));
    document.getElementById('ref-pagamento').textContent = '—';
    const msg = document.getElementById('mensagem-api');
    if (msg) { msg.textContent = ''; msg.hidden = true; }
  }
}
/* ---------------- Utilitários ---------------- */
function formatarEuro(valor) {
  return valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}
const toCents = (v) => Math.round(v * 100);
const fromCents = (c) => c / 100;
