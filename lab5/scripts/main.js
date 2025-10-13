const p = document.querySelector('#passa');

function trocaFrase(){
    p.textContent = "1. Obrigado por passares!";
}
function mantemFrase(){
    p.textContent = "1. Passa por aqui!";
}
p.onmouseover = trocaFrase;
p.addEventListener('mouseout', mantemFrase);

function pintar(cor) {
    const pinta = document.querySelector("#pinta");
    pinta.style.color = cor;
}

const inputColorir = document.querySelector("#escreve input");
const cores = ['red','blue','green'];
let interador = 0;


function colorir(){
    inputColorir.style.background = cores[interador];
    interador = ++interador % cores.length;
}
inputColorir.onkeyup = colorir;

// 4 muda a cor de fundo de forma simples
const campoCor = document.querySelector("#campo-cor");
const btnCor = document.querySelector("#btn-cor");

// 5 conta quando aperto o botao 
btnCor.addEventListener("click", () => {
  document.body.style.background = campoCor.value;
});
let contagem = 0;
const elementoContagem = document.querySelector("#contador span")
function contar(){
    elementoContagem.textContent = ++contagem;
}
document.querySelector("#contador button").onclick = contar

const formNome = document.querySelector('#nome-form');
const nomeInput = document.querySelector('#nome-form #nome');
const idadeInput = document.querySelector('#nome-form #idade');
const lblSaudacao = document.querySelector('#saudacao');

formNome.onsubmit = (e) => {
  e.preventDefault(); // não recarrega a página
  const nome = nomeInput.value.trim();
  const idade = idadeInput.value.trim();
  lblSaudacao.textContent = `Olá, o ${nome} tem ${idade}!`;
};

// caso nao escrevam nada e tentem submeter
    if (!nome || !idade) {
        lblSaudacao.textContent = "Preencha o nome e a idade.";
        return;
    }
    // mostra só depois de clicar em Submit
    lblSaudacao.textContent = `Olá, o ${nome} tem ${idade}!`;


let autoCount = 0;
const autoSpan = document.querySelector("#autoCount");
setInterval(() => {
    autoSpan.textContent = ++autoCount;
}, 1000);