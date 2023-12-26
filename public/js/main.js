"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// HTML
const pokedexList = document.querySelector(".js-pokedex__list");
const buttonShowMore = document.querySelector(".js-btn--show-more");
const pokemonTemplate = (pokemon) => {
    return `
        <li class="pokedex__list-item">
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <p>${pokemon.id}</p>
            <p>${pokemon.name}</p>
        </li>
    `;
};
// Variables
let offset = 0;
let url = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
let pokemonsArr = [];
// Functions
const fetchPokemonsList = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch pokemons list from url
        const pokemonsListResponse = yield fetch(url);
        const pokemonsListData = yield pokemonsListResponse.json();
        const pokemonsList = yield pokemonsListData.results;
        // Fetch every listed pokemon's data by it's url
        const fetchPokemon = pokemonsList.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
            const pokemonResponse = yield fetch(pokemon.url);
            const pokemonData = yield pokemonResponse.json();
            // Destructuring pokemonData to extract the info we'll need
            const { id, name, sprites, types } = pokemonData;
            // Matching GBA sprite url
            const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
            return { id, name, spriteUrl, types };
        }));
        // Returning every pokemonData as a promise
        const listedPokemons = yield Promise.all(fetchPokemon);
        // For TSC: Must RETURN a value
        return listedPokemons;
    }
    catch (error) {
        // For TSC: Must RETURN an error instead of log it into console
        throw error;
    }
});
const addPokemon = (list) => __awaiter(void 0, void 0, void 0, function* () {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon);
    });
});
const buildPokedexList = (arr) => __awaiter(void 0, void 0, void 0, function* () {
    pokedexList.innerHTML = '';
    arr.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
        pokedexList.innerHTML += pokemonTemplate(pokemon);
    }));
});
const startPokedex = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pokemonList = yield fetchPokemonsList();
        yield addPokemon(pokemonList);
        yield buildPokedexList(pokemonsArr);
    }
    catch (error) {
        console.error("Error en la aplicación:", error);
    }
});
const showMorePokemons = () => __awaiter(void 0, void 0, void 0, function* () {
    yield updatePokedexList();
    return buildPokedexList(pokemonsArr);
});
const updateUrl = () => {
    offset += 10;
    url = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
};
const updatePokedexList = () => __awaiter(void 0, void 0, void 0, function* () {
    updateUrl();
    const newPokemonList = yield fetchPokemonsList();
    return addPokemon(newPokemonList);
});
// Main
// Starting app
window.onload = startPokedex;
// Setting button show more event listener
buttonShowMore.addEventListener('click', showMorePokemons);
