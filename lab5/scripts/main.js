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

let contagem = 0;
const elementoContagem = document.querySelector("#contador span")
function contar(){
    elementoContagem.textContent = ++contagem;
}
document.querySelector("#contador button").onclick = contar
