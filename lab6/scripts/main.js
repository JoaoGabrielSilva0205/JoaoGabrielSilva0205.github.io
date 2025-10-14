import { produtos } from './produtos.js';

const titulo= document.createElement('h1');
titulo.textContent = 'Viva JavaScript!';
const body = document.querySelector('body');
body.append(titulo)