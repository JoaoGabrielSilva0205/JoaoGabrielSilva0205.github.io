let contador = 0;

// Função para pintar o texto
function pintar(cor) {
    const area2 = document.querySelector("#area2 span");
    area2.style.color = cor;
}

// Mostrar texto digitado
function mostrarTexto() {
    const campo = document.getElementById("campoTexto");
    const saida = document.getElementById("textoMostrado");
    saida.textContent = campo.value;
}

// Mudar cor do fundo
function mudarCor(event) {
    event.preventDefault();
    const cor = document.getElementById("corEscolhida").value;
    document.body.style.backgroundColor = cor;
}

// Contador
function contar() {
    contador++;
    document.getElementById("contador").textContent = contador;
}

// -------- EVENTOS DE RATO --------

// 1. mouseover → muda a mensagem para "Você conseguiu, parabéns!!!"
document.getElementById("area1").addEventListener("mouseover", function() {
    this.textContent = "1. Você conseguiu, parabéns!!!";
});

// 2. mouseout → volta ao texto original
document.getElementById("area1").addEventListener("mouseout", function() {
    this.textContent = "1. Passa por aqui!";
});

// 3. mousemove → mostra posição do rato (agora no nº6, em baixo)
document.getElementById("posicaoRato").addEventListener("mousemove", function(e) {
    this.textContent = "6. Posição do rato: X=" + e.offsetX + " Y=" + e.offsetY;
});
