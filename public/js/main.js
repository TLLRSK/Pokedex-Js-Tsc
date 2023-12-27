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
        <li data-id=${pokemon.id} class="pokedex__list-item">
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <p class="pokemon-number">#${pokemon.id}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">${buildTypeTemplate(pokemon.types)}</div>
            <button class="btn--show-stats js-btn--show-stats">show stats</button>
        </li>
    `;
};
// VARIABLES
let offset = 0;
let APIurl = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
let pokemonsArr = [];
// FUNCTIONS
// fetching
const fetchPokemonsList = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch pokemons list from url
        const pokemonsListResponse = yield fetch(APIurl);
        const pokemonsListData = yield pokemonsListResponse.json();
        const pokemonsList = yield pokemonsListData.results;
        // Fetch every listed pokemon's data by it's url
        const fetchPokemon = pokemonsList.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield fetch(pokemon.url);
            const data = yield response.json();
            // Destructuring pokemonData to extract the info we'll need
            const { id, name, sprites, types } = data;
            // Matching GBA sprite url
            const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
            const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
            return { id, name, spriteUrl, types, url };
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
//building pokedex list
//1. updating pokemon arr
const addPokemon = (list) => __awaiter(void 0, void 0, void 0, function* () {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon);
    });
});
//2. building pokedex list html
const buildPokedexList = (arr) => __awaiter(void 0, void 0, void 0, function* () {
    pokedexList.innerHTML = '';
    arr.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
        pokedexList.innerHTML += pokemonTemplate(pokemon);
    }));
    addEventListeners();
});
//3. building pokedex on start
const startPokedex = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pokemonList = yield fetchPokemonsList();
        yield addPokemon(pokemonList);
        return yield buildPokedexList(pokemonsArr);
    }
    catch (error) {
        throw error;
    }
});
// building pokemon types template
const buildTypeTemplate = (pokemonTypes) => {
    const singleTypeTemplate = (typeObj) => {
        const typeName = typeObj.type.name;
        return `<p class="pokemon-type--${typeName}">${typeName}</p>`;
    };
    return pokemonTypes
        .map(type => singleTypeTemplate(type))
        .join('');
};
// updating pokedex list
const updateUrl = () => {
    offset += 10;
    APIurl = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
};
const updatePokedexList = () => __awaiter(void 0, void 0, void 0, function* () {
    updateUrl();
    const newPokemonList = yield fetchPokemonsList();
    return addPokemon(newPokemonList);
});
const showMorePokemons = () => __awaiter(void 0, void 0, void 0, function* () {
    yield updatePokedexList();
    return buildPokedexList(pokemonsArr);
});
// Get single pokemon stats
const getPokemonStats = (event) => {
    const target = event.target;
    const id = target.parentElement.dataset.id;
    console.log(`ID del Pokémon: ${id}`);
    const fetchPokemonStats = () => __awaiter(void 0, void 0, void 0, function* () {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        try {
            const response = yield fetch(url);
            const data = yield response.json();
            // console.log(data)
            const { id, name, height, abilities, types, stats } = data;
            console.log({ id, name, height, abilities, types, stats });
            return { id, name, height, abilities, types, stats };
        }
        catch (error) {
            throw error;
        }
    });
    fetchPokemonStats();
};
// Select show stats buttons
const SelectShowStatsButtons = () => {
    return document.querySelectorAll(".js-btn--show-stats");
};
// Set addeventlisteners
const addEventListeners = () => {
    // Show more btn
    buttonShowMore.addEventListener("click", showMorePokemons);
    // Show stats btn
    const showStatsButtons = SelectShowStatsButtons();
    showStatsButtons.forEach(el => { el.addEventListener("click", getPokemonStats); });
};
// MAIN
// Starting app
window.onload = startPokedex;
