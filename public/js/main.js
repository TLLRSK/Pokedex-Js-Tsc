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
const pokedexSearchInput = document.querySelector(".js-pokedex__search-input");
const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit");
const buttonShowMore = document.querySelector(".js-btn--show-more");
const pokemonStatsView = document.querySelector(".js-pokedex__pokemon-stats");
// TEMPLATES
const pokemonTemplate = (pokemon) => {
    return `
        <li data-id=${pokemon.id} class="pokedex__list-item">
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <p class="pokemon-number">#${pokemon.id}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">${buildTypesTemplate(pokemon.types)}</div>
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
        const response = yield fetch(APIurl);
        const data = yield response.json();
        const pokemonsList = yield data.results;
        // Fetch every listed pokemon's data by it's url
        const pokemonPromises = mapPokemonPromises(pokemonsList);
        // Returning every pokemonData as a promise
        const listedPokemons = yield Promise.all(pokemonPromises);
        // For TSC: Must RETURN a value
        return listedPokemons;
    }
    catch (error) {
        // For TSC: Must RETURN an error instead of log it into console
        throw error;
    }
});
const mapPokemonPromises = (list) => {
    return list.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
        return fetchPokemon(pokemon.url);
    }));
};
// const fetchPokemon = async (pokemon: IPokemonsList) => {
//     const response = await fetch(pokemon.url)
//     const data = await response.json();
//     // Destructuring pokemonData to extract the info we'll need
//     const {id, name, sprites, height, types, abilities, stats } = data;
//     // Customizing urls
//     const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
//     const url = `https://pokeapi.co/api/v2/pokemon/${id}/`
//     return { id, name, spriteUrl, height, types, abilities, stats, url };
// }
const fetchPokemon = (pokemonUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(pokemonUrl);
    const data = yield response.json();
    // Destructuring pokemonData to extract the info we'll need
    const { id, name, sprites, height, types, abilities, stats } = data;
    // Customizing urls
    const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    return { id, name, spriteUrl, height, types, abilities, stats, url };
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
const fetchPokemonStats = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const target = event.target;
    const id = target.parentElement.dataset.id;
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    return yield fetchPokemon(url);
});
const pokemonStatsTemplate = (pokemonStats) => {
    const { id, name, spriteUrl, height, types, abilities, stats } = pokemonStats;
    return `
        <img src="${spriteUrl}" alt="${name}">
        <div class="pokemon-id">
            <p>#${id}</p>
            <p>${name}</p>
        </div>
        <div class="pokemon-types">
            ${buildTypesTemplate(types)}
        </div>
        <div class="pokemon-stats">
            ${buildStatsTemplate(stats)}
        </div>
        <div class="pokemon-abilities">
            ${buildAbilitiesTemplate(abilities)}
        </div>
    `;
};
const buildPokemonStats = (event) => __awaiter(void 0, void 0, void 0, function* () {
    pokemonStatsView.innerHTML = "";
    const pokemonStats = yield fetchPokemonStats(event);
    return pokemonStatsView.innerHTML += yield pokemonStatsTemplate(pokemonStats);
});
// Pokemon stats template builders
// types
const buildTypesTemplate = (pokemonTypesArr) => {
    const singleTypeTemplate = (typeObj) => {
        const typeName = typeObj.type.name;
        return `<p class="pokemon-type--${typeName}">${typeName}</p>`;
    };
    return pokemonTypesArr
        .map(type => singleTypeTemplate(type))
        .join('');
};
// abilities
const buildAbilitiesTemplate = (pokemonAbilitiesArr) => {
    const singleAbilityTemplate = (abilityOjb) => {
        const abilityName = abilityOjb.ability.name;
        return `<p class="pokemon-ability">${abilityName}</p>`;
    };
    return pokemonAbilitiesArr
        .map(ability => singleAbilityTemplate(ability))
        .join('');
};
// stats
const buildStatsTemplate = (pokemonStatsArr) => {
    const singleStatTemplate = (statOjb) => {
        const statName = statOjb.stat.name;
        const statValue = statOjb.base_stat;
        return `
            <div class="pokemon-stat">
                <p class="pokemon-stat--name">${statName}</p>
                <p class="pokemon-stat--value">${statValue}</p>
            </div>
        `;
    };
    return pokemonStatsArr
        .map(stat => singleStatTemplate(stat))
        .join('');
};
// Search form
const searchPokemon = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    console.log(event.target);
    const url = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";
    const fetchAllPokemonsList = (url) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(url);
            const data = yield response.json();
            const allPokemonsList = yield data.results;
            return allPokemonsList;
        }
        catch (error) {
            throw error;
        }
    });
    // Testing
    const allPokemonsList = yield fetchAllPokemonsList(url);
    const testArr = allPokemonsList.filter(pokemon => pokemon.name.includes("saur"));
    console.log(testArr);
});
// Select show stats buttons
const SelectShowStatsButtons = () => {
    return document.querySelectorAll(".js-btn--show-stats");
};
// Set addeventlisteners
const addEventListeners = () => {
    // Search input
    pokedexSearchSubmit.addEventListener("click", searchPokemon);
    // Show more btn
    buttonShowMore.addEventListener("click", showMorePokemons);
    // Show stats btn
    const showStatsButtons = SelectShowStatsButtons();
    showStatsButtons.forEach(el => { el.addEventListener("click", buildPokemonStats); });
};
// MAIN
// Starting app
window.onload = startPokedex;
