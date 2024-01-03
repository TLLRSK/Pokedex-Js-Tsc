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
const pokedexArticle = document.querySelector(".js-pokedex__article");
const pokedexList = document.querySelector(".js-pokedex__list");
const pokedexSearchInput = document.querySelector(".js-pokedex__search-input");
const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit");
const buttonShowMoreContainer = document.querySelector(".pokedex__button--show-more");
const buttonShowMore = document.querySelector(".js-btn--show-more");
const pokemonStatsView = document.querySelector(".js-pokedex__pokemon-stats");
const pokemonTypeCheckbox = document.querySelectorAll(".js-btn--type-filter");
const pokemonTypeSubmit = document.querySelector(".js-pokedex__pokemon-type-submit");
// Select show stats buttons
const SelectshowDetailsButton = () => {
    return document.querySelectorAll(".js-btn--show-stats");
};
// Pokemon stats template builders
// types
const buildTypesTemplate = (typesArr) => {
    const singleTypeTemplate = (type) => {
        return `<p class="pokemon-type--${type}">${type}</p>`;
    };
    return typesArr.map(type => singleTypeTemplate(type)).join('');
};
// abilities
const buildAbilitiesTemplate = (pokemonAbilitiesArr) => {
    const singleAbilityTemplate = (ability) => {
        return `<p class="pokemon-ability">${ability}</p>`;
    };
    return pokemonAbilitiesArr.map(ability => singleAbilityTemplate(ability)).join('');
};
// stats
const buildStatsTemplate = (statsArr) => {
    const singleStatTemplate = (stat) => {
        const { name, value } = stat;
        return `
            <div class="pokemon-stat">
                <p class="pokemon-stat--name">${name}</p>
                <p class="pokemon-stat--value">${value}</p>
            </div>
        `;
    };
    return statsArr.map((stat) => singleStatTemplate(stat)).join('');
};
// TEMPLATES
const pokemonCardTemplate = (pokemon) => {
    return `
        <li data-id=${pokemon.id} class="pokedex__list-item">
            <img src="${pokemon.sprites}" alt="${pokemon.name}">
            <p class="pokemon-number">#${pokemon.id}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">${buildTypesTemplate(pokemon.types)}</div>
            <button class="btn--show-stats js-btn--show-stats">show stats</button>
        </li>
    `;
};
const pokemonDetailsTemplate = (pokemonStats) => {
    const { id, name, sprites, height, types, abilities, stats } = pokemonStats;
    return `
        <img src="${sprites}" alt="${name}">
        <div class="pokemon-id">
            <p>#${id}</p>
            <p>${name}</p>
        </div>
        <div class="pokemon-height">Height: ${height}</div>
        <div class="pokemon-types">
            <p>Type:</p>
            <div class="pokemon-types-row">${buildTypesTemplate(types)}</div>
        </div>
        <div class="pokemon-stats">
            <p>Stats:</p>
            <div>
                ${buildStatsTemplate(stats)}
            </div>
        </div>
        <div class="pokemon-abilities">
            ${buildAbilitiesTemplate(abilities)}
        </div>
    `;
};
// VARIABLES
let offset = 0;
let pokedexArr = [];
const pokemonsMaxNumber = 151;
// FUNCTIONS
// URL Management
const pokedexUrl = () => {
    const maxPokemonNumber = 151;
    const add = 12;
    let currenPokemonNumber = add;
    let offset = 0;
    let url = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=0`;
    const getUrl = () => {
        return url;
    };
    const resetUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=0`;
        return getUrl();
    };
    const getSinglePokemonUrl = (id) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl();
    };
    const getAllPokemonUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
        return getUrl();
    };
    const updateOffset = () => {
        if (currenPokemonNumber + add < maxPokemonNumber) {
            offset += add;
            currenPokemonNumber += add;
            url = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=${offset}`;
        }
        else {
            url = `https://pokeapi.co/api/v2/pokemon?limit=1&offset=${currenPokemonNumber}`;
            buttonShowMoreContainer.remove();
        }
    };
    return { getUrl, resetUrl, updateOffset, getSinglePokemonUrl, getAllPokemonUrl };
};
// fetching
const fetchPokemonsList = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch pokemons list from url
        // const url = APIurl.getUrl();
        const response = yield fetch(url);
        const data = yield response.json();
        const pokemonsList = data.results;
        // Fetch every listed pokemon's data by it's own url
        const pokemonPromises = pokemonsList.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
            return fetchPokemon(pokemon.url);
        }));
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
// Fetching single pokemon
const fetchPokemon = (pokemonUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(pokemonUrl);
    const data = yield response.json();
    // Destructuring pokemonData to extract the info we'll need
    let { id, name, sprites, height, types, abilities, stats } = data;
    // Customizing properties
    // sprites
    sprites = sprites.versions["generation-i"].yellow["front_default"];
    // types
    types = yield Promise.all(types.map((prop) => prop.type.name));
    // abilities
    abilities = yield Promise.all(abilities.map((prop) => prop.ability.name));
    //stats
    stats = yield Promise.all(stats.map((prop) => ({ name: prop.stat.name, value: prop.base_stat })));
    //url
    const url = APIurl.getSinglePokemonUrl(id);
    // result
    return { id, name, sprites, height, types, abilities, stats, url };
});
//building pokedex list
// Adding pokemons to pokedexArr
const addPokemon = (arr) => __awaiter(void 0, void 0, void 0, function* () {
    pokedexArr = [];
    arr.forEach(pokemon => {
        pokedexArr.push(pokemon);
    });
    console.log(pokedexArr);
});
// Building pokedex list html
const buildPokemonsList = (arr) => __awaiter(void 0, void 0, void 0, function* () {
    pokedexList.innerHTML = ``;
    arr.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
        pokedexList.innerHTML += pokemonCardTemplate(pokemon);
    }));
    updateShowDetailsAddEventListeners();
});
const buildSearchPokemonsList = (arr) => {
    // create paragraph
    const paragraph = document.createElement("p");
    paragraph.classList.add("pokedex__search-results-number");
    // select
    const searchResultsNumber = document.querySelector(".pokedex__search-results-number");
    // check if there's a selected paragraph and paint it or not
    if (searchResultsNumber) {
        paragraph.textContent = `${arr.length} results founded`;
    }
    else {
        paragraph.textContent = `${arr.length} results founded`;
        pokedexArticle.insertBefore(paragraph, pokedexArticle.firstChild);
    }
    // remove show more button
    buttonShowMoreContainer.remove();
    buildPokemonsList(arr);
};
const buildTypePokemonsList = (arr) => {
    return '';
};
// Building pokedex on start
const startPokedex = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = APIurl.resetUrl();
        const pokemonList = yield fetchPokemonsList(url);
        addEventListeners();
        yield addPokemon(pokemonList);
        return yield buildPokemonsList(pokedexArr);
    }
    catch (error) {
        throw error;
    }
});
// updating pokedex list
const updatePokedexList = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = APIurl.getUrl();
    const newPokemonList = yield fetchPokemonsList(url);
    return addPokemon(newPokemonList);
});
const showMorePokemons = () => __awaiter(void 0, void 0, void 0, function* () {
    APIurl.updateOffset();
    yield updatePokedexList();
    return buildPokemonsList(pokedexArr);
});
// Get single pokemon stats
const fetchPokemonStats = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const target = event.target;
    const id = target.parentElement.dataset.id;
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    return yield fetchPokemon(url);
});
const buildPokemonStats = (event) => __awaiter(void 0, void 0, void 0, function* () {
    pokemonStatsView.innerHTML = "";
    const pokemonStats = yield fetchPokemonStats(event);
    return pokemonStatsView.innerHTML += yield pokemonDetailsTemplate(pokemonStats);
});
// Searching pokemons
const searchPokemons = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const filterName = pokedexSearchInput.value;
    const allPokemonUrl = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonsMaxNumber}&offset=0`;
    const fetchSearchedPokemon = (url) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(allPokemonUrl);
            const data = yield response.json();
            const filteredPokemonPromises = yield data.results.filter((pokemon) => pokemon.name.includes(filterName));
            const filteredPokemonArr = yield filteredPokemonPromises.map((pokemon) => {
                return fetchPokemon(pokemon.url);
            });
            return yield Promise.all(filteredPokemonArr);
        }
        catch (error) {
            throw error;
        }
    });
    const list = yield fetchSearchedPokemon(allPokemonUrl);
    return buildSearchPokemonsList(list);
});
// Check search input value
const inputHasValue = () => {
    pokedexSearchInput.value !== ''
        ? pokedexSearchSubmit.removeAttribute("disabled")
        : pokedexSearchSubmit.setAttribute("disabled", "");
};
// Add all pokemon to pokedexarr
let typesArr = [];
const addAllPokemon = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = APIurl.getAllPokemonUrl();
    return yield fetchPokemonsList(url);
});
// POKEMON TYPE FILTER
// Updating typesarr
const updateTypesArr = (target) => {
    if (!typesArr.includes(target.name)) {
        typesArr.push(target.name);
    }
    else {
        typesArr.splice(typesArr.indexOf(target.name), 1);
    }
    console.log(typesArr);
};
// Submitting typesarr
const submitTypesArr = (e) => {
    e.preventDefault();
    filterPokedexArr(typesArr);
};
// Filtering new arr
const filterPokedexArr = (typesArr) => __awaiter(void 0, void 0, void 0, function* () {
    const url = yield APIurl.getAllPokemonUrl();
    const pokedexArr = yield fetchPokemonsList(url);
    const filteredArr = pokedexArr.filter(pokemon => pokemon.types.some((type) => typesArr.includes(type)));
    typesArr.length > 0
        ? buildPokemonsList(filteredArr)
        : startPokedex();
});
// Set addeventlisteners
const addEventListeners = () => {
    // Search input & submit
    pokedexSearchInput.addEventListener("input", inputHasValue);
    pokedexSearchSubmit.addEventListener("click", searchPokemons);
    // Pokemon type checkbox
    pokemonTypeCheckbox.forEach(e => { e.addEventListener("click", (e) => updateTypesArr(e.target)); });
    // Pokemon type submit
    pokemonTypeSubmit.addEventListener("click", submitTypesArr);
    // Show more btn
    buttonShowMore.addEventListener("click", showMorePokemons);
    // Show stats btn
};
const updateShowDetailsAddEventListeners = () => {
    const showDetailsButton = SelectshowDetailsButton();
    showDetailsButton.forEach(el => { el.addEventListener("click", buildPokemonStats); });
};
// MAIN
// Starting app
window.onload = startPokedex;
const APIurl = pokedexUrl();
