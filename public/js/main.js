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
let pokemonsArr = [];
const pokemonsMaxNumber = 151;
// FUNCTIONS
// URL Management
const pokedexUrl = () => {
    const maxPokemonNumber = 151;
    const add = 10;
    let currenPokemonNumber = add;
    let offset = 0;
    let url = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=0`;
    const getUrl = () => {
        return url;
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
    const getTypeUrl = (type) => {
        const types = {
            normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5,
            rock: 6, bug: 7, ghost: 8, fire: 10, water: 11,
            grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16,
        };
        return `https://pokeapi.co/api/v2/type/${types.type}`;
    };
    const getSinglePokemonUrl = (id) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl();
    };
    return { getUrl, updateOffset, getTypeUrl, getSinglePokemonUrl };
};
// fetching
const fetchPokemonsList = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch pokemons list from url
        const url = APIurl.getUrl();
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
    const { id, name, sprites, height, types, abilities, stats } = data;
    // Customizing urls
    const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
    const url = APIurl.getSinglePokemonUrl(id);
    return { id, name, spriteUrl, height, types, abilities, stats, url };
});
//building pokedex list
//1. updating pokemon arr
const addPokemon = (arr) => __awaiter(void 0, void 0, void 0, function* () {
    arr.forEach(pokemon => {
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
const buildSearchPokedexList = (arr) => {
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
    buildPokedexList(arr);
};
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
const updatePokedexList = () => __awaiter(void 0, void 0, void 0, function* () {
    const newPokemonList = yield fetchPokemonsList();
    return addPokemon(newPokemonList);
});
const showMorePokemons = () => __awaiter(void 0, void 0, void 0, function* () {
    APIurl.updateOffset();
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
    return buildSearchPokedexList(list);
});
// Select show stats buttons
const SelectShowStatsButtons = () => {
    return document.querySelectorAll(".js-btn--show-stats");
};
// Check search input value
const inputHasValue = () => {
    pokedexSearchInput.value !== ''
        ? pokedexSearchSubmit.removeAttribute("disabled")
        : pokedexSearchSubmit.setAttribute("disabled", "");
};
// Set addeventlisteners
const addEventListeners = () => {
    // Search input & submit
    pokedexSearchInput.addEventListener("input", inputHasValue);
    pokedexSearchSubmit.addEventListener("click", searchPokemons);
    // Show more btn
    buttonShowMore.addEventListener("click", showMorePokemons);
    // Show stats btn
    const showStatsButtons = SelectShowStatsButtons();
    showStatsButtons.forEach(el => { el.addEventListener("click", buildPokemonStats); });
};
// MAIN
// Starting app
window.onload = startPokedex;
const APIurl = pokedexUrl();
