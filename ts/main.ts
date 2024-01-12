import Pokedex from "./pokedex.js";
// Starting app
const pokedex = Pokedex();
window.onload = () => pokedex.initializePokedex();