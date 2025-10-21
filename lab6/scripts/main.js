import { produtos } from './produtos.js';


document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos(produtos);
});

/** Recebe a lista de produtos escreve cada produto na consola (objeto completo, depois id e title)
 * cria o <article> de cada produto e adiciona-o à secção #produtos */

function carregarProdutos(lista) {
  const secProdutos = document.getElementById('produtos');
  if (!secProdutos) {
    console.error('Elemento #produtos não encontrado no DOM.');
    return;
  }

  // Limpar antes de renderizar (útil em futuras atualizações)
  secProdutos.textContent = '';

  lista.forEach((produto) => {
    // imprime o objeto completo
    console.log(produto);
    //imprime campos específicos
    console.log('ID:', produto.id, 'Title:', produto.title);

    //cria e insere o <article>
    const artigo = criarProduto(produto);
    secProdutos.append(artigo);
  });
}

function criarProduto(produto) {
  const artigo = document.createElement('article');
  artigo.setAttribute('data-id', produto.id);

  // Header com título
  const header = document.createElement('header');
  const titulo = document.createElement('h3');
  titulo.textContent = produto.title;
  header.append(titulo);

  // Imagem com figure/figcaption
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image;
  img.alt = produto.title;
  img.width = 180;
  const figcaption = document.createElement('figcaption');
  figcaption.textContent = produto.category;
  figure.append(img, figcaption);

  // Descrição
  const paragrafoDesc = document.createElement('p');
  paragrafoDesc.className = 'descricao';
  paragrafoDesc.textContent = produto.description;

  // Preço
  const paragrafoPreco = document.createElement('p');
  paragrafoPreco.className = 'preco';
  const preco = document.createElement('strong');
  preco.textContent = `${produto.price.toFixed(2)} €`;
  paragrafoPreco.append(preco);

  // Footer com botão
  const footer = document.createElement('footer');
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = 'Adicionar ao cesto';
  botao.setAttribute('aria-label', `Adicionar ${produto.title} ao cesto`);
  botao.dataset.id = produto.id;
  footer.append(botao);

  // Montagem final do <article>
  artigo.append(header, figure, paragrafoDesc, paragrafoPreco, footer);

  return artigo;
}
