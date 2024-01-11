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
// FACTORY FUNCTIONS
// URL Management
const PokedexUrl = () => {
    const maxPokemonNumber = 151;
    let url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
    const getUrl = () => {
        return url;
    };
    const getSinglePokemonUrl = (id) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl();
    };
    const getAllPokemonUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
        return getUrl();
    };
    return { getSinglePokemonUrl, getAllPokemonUrl };
};
// Pokedex Arr management
const Pokedex = () => {
    // Main data
    const APIurl = PokedexUrl();
    let pokedexArr = [];
    let tempArr = [];
    let typesArr = [];
    // HTML
    const header = document.querySelector(".js-header");
    const pokedexBlank = document.querySelector(".js-pokedex__blank");
    const pokedexResults = document.querySelector(".js-pokedex__results");
    const pokedexList = document.querySelector(".js-pokedex__list");
    const pokedexSearchInput = document.querySelector(".js-pokedex__search-input");
    const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit");
    const showHeaderFilterButton = document.querySelector(".js-header__show-filter-btn");
    const headerFilter = document.querySelector(".js-header__filter");
    const resetFilterButton = document.querySelector(".js-types__reset-filter");
    const pokemonTypeCheckbox = document.querySelectorAll(".js-btn--type-filter");
    const pokemonTypeSubmit = document.querySelector(".js-pokedex__pokemon-type-submit");
    const buttonShowMore = document.querySelector(".js-btn--show-next");
    const pokemonDetailsCard = document.querySelector(".js-pokedex__pokemon-details-card");
    const closePokemonDetailsCardBtn = document.querySelector(".js-pokedex__pokemon-details-card");
    // Pokemon stats template builders
    // types
    const buildTypesTemplate = (typesArr) => {
        const singleTypeTemplate = (type) => {
            return `<p class="pokemon-type pokemon-type--${type}">${type}</p>`;
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
        <li data-id=${pokemon.id} class="pokedex__grid-item">
            <button class="pokemon-card js-btn--show-details">
                <div class="pokemon-sprite">
                    <img src="${pokemon.sprites}" alt="${pokemon.name}">
                </div>
                <p class="pokemon-number">#${pokemon.id}</p>
                <p class="pokemon-name">${pokemon.name}</p>
                <div class="pokemon-types">${buildTypesTemplate(pokemon.types)}</div>
            </button>
        </li>
    `;
    };
    const pokemonDetailsTemplate = (pokemonStats) => {
        const { id, name, sprites, height, types, abilities, stats } = pokemonStats;
        return `
        <div class="pokemon-close-btn">
            <button class="btn--close-pokemon-details js-btn--close-pokemon-details">close x</button>
        </div>
        <div class="pokemon-main-info">
            <div class="pokemon-sprite">
                <img src="${sprites}" alt="${name}">
            </div>
            <p>#${id}</p>
            <h2>${name}</h2>
            <div class="pokemon-types">
                ${buildTypesTemplate(types)}
            </div>
            <div class="pokemon-height"><p>Height: ${height}</p></div>
        </div>
       
        <did class="pokemon-details-info">
            <div class="pokemon-stats">
                <h3>Stats</h3>
                <div>
                    ${buildStatsTemplate(stats)}
                </div>
            </div>
            <div class="pokemon-abilities">
                <h3>Abilities</h3>
                ${buildAbilitiesTemplate(abilities)}
            </div>
        </didv>
    `;
    };
    // List management
    const itemsPerPage = 12;
    let currentItems = 0;
    const resetCurrentItems = () => {
        currentItems = 0;
    };
    // Initializing pokedex
    const initializePokedex = () => __awaiter(void 0, void 0, void 0, function* () {
        const arr = yield getAllPokemonArr();
        pokedexArr = arr;
        tempArr = arr;
        buildPokedexList(pokedexArr);
        addEventListeners();
    });
    // Get all pokemon array
    const getAllPokemonArr = () => __awaiter(void 0, void 0, void 0, function* () {
        const url = yield APIurl.getAllPokemonUrl();
        return yield fetchPokedexList(url);
    });
    // Building pokedex list html
    const fetchPokedexList = (url) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Fetch pokemons list from url
            const response = yield fetch(url);
            const data = yield response.json();
            const pokemonsList = data.results;
            // Fetch every listed pokemon's data by it's own url
            const pokemonPromises = pokemonsList.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
                return fetchSinglePokemon(pokemon.url);
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
    // Fetching single pokemon data
    const fetchSinglePokemon = (pokemonUrl) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield fetch(pokemonUrl);
        const data = yield response.json();
        // Destructuring pokemonData to extract the info we'll need
        let { id, name, sprites, height, types, abilities, stats } = data;
        // Customizing properties
        // Sprites
        sprites = sprites.versions["generation-i"].yellow["front_default"];
        // Types
        types = yield Promise.all(types.map((prop) => prop.type.name));
        // Abilities
        abilities = yield Promise.all(abilities.map((prop) => prop.ability.name));
        // Stats
        stats = yield Promise.all(stats.map((prop) => ({ name: prop.stat.name, value: prop.base_stat })));
        // Url
        const url = APIurl.getSinglePokemonUrl(id);
        // Result
        return { id, name, sprites, height, types, abilities, stats, url };
    });
    // Build pokedex list with the first itemsPerPage pokemons
    const buildPokedexList = (arr) => __awaiter(void 0, void 0, void 0, function* () {
        pokedexResults.innerHTML = `Showing ${tempArr.length} results`;
        const slicedArr = getNextPokemons(arr);
        slicedArr.map((pokemon) => {
            pokedexList.innerHTML += pokemonCardTemplate(pokemon);
        });
        currentItems > tempArr.length ? buttonShowMore.remove() : null;
        updateShowDetailsAddEventListeners();
    });
    const resetPokedexList = () => {
        pokedexList.innerHTML = ``;
    };
    // Getting next itemsPerPage pokemons from tempArray
    const getNextPokemons = (arr) => {
        const start = currentItems;
        const end = start + itemsPerPage;
        currentItems += itemsPerPage;
        return arr.slice(start, end);
    };
    // SEARCH
    const searchPokemon = (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const filteredArr = yield pokedexArr.filter(pokemon => pokemon.name.includes(pokedexSearchInput.value));
        tempArr = yield filteredArr;
        resetCurrentItems();
        resetPokedexList();
        buildPokedexList(tempArr);
    });
    // POKEMON STATS
    // Fetch single pokemon stats
    const fetchPokemonDetails = (event) => __awaiter(void 0, void 0, void 0, function* () {
        const target = event.target;
        const id = target.parentElement.dataset.id;
        const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return yield fetchSinglePokemon(url);
    });
    // Building details html
    const buildPokemonDetails = (event) => __awaiter(void 0, void 0, void 0, function* () {
        pokemonDetailsCard.innerHTML = "";
        const pokemonStats = yield fetchPokemonDetails(event);
        pokemonDetailsCard.classList.remove("hidden");
        pokemonDetailsCard.innerHTML += yield pokemonDetailsTemplate(pokemonStats);
        showBlank(1);
    });
    // Close pokemon details
    const closePokemonDetails = () => {
        pokemonDetailsCard.classList.add("hidden");
        closeBlank();
    };
    // TYPE FILTER
    // Updating typesarr
    const updateTypesArr = (target) => {
        !typesArr.includes(target.name)
            ? typesArr.push(target.name)
            : typesArr.splice(typesArr.indexOf(target.name), 1);
        console.log(typesArr);
    };
    // Submitting typesarr
    const submitTypesArr = (e) => {
        e.preventDefault();
        filterPokedexArr(typesArr);
        closeFilterList();
    };
    // Filtering new arr
    const filterPokedexArr = (typesArr) => __awaiter(void 0, void 0, void 0, function* () {
        const filteredArr = yield tempArr.filter(pokemon => pokemon.types.some((type) => typesArr.includes(type)));
        tempArr = yield filteredArr;
        console.log(tempArr);
        resetCurrentItems();
        resetPokedexList();
        buildPokedexList(tempArr);
    });
    // Check search input has value
    const inputHasValue = () => {
        console.log(pokedexSearchInput.value);
        pokedexSearchInput.value !== ''
            ? pokedexSearchSubmit.removeAttribute("disabled")
            : pokedexSearchSubmit.setAttribute("disabled", "");
    };
    // Show Filter list
    const showFilterList = () => {
        if (headerFilter.classList.contains("hidden")) {
            headerFilter.classList.remove("hidden");
            showBlank(0);
        }
        else {
            closeFilterList();
        }
    };
    // Close Filter list
    const closeFilterList = () => {
        headerFilter.classList.add("hidden");
        setTimeout(() => {
            closeBlank();
        }, 10);
    };
    // Reset Filter
    const resetFilter = () => {
        pokemonTypeCheckbox.forEach((checkbox) => {
            checkbox.checked = false;
        });
    };
    // BLANK DIV
    // Show and close Blank Div
    const showBlank = (index) => {
        if (pokedexBlank.classList.contains("hidden")) {
            pokedexBlank.classList.remove("hidden");
            pokedexBlank.style.zIndex = `${index}`;
        }
    };
    const closeBlank = () => {
        pokedexBlank.classList.add("hidden");
    };
    // ADDEVENTLISTENERS
    // Select show single pokemon stats buttons
    const SelectshowDetailsButton = () => {
        return document.querySelectorAll(".js-btn--show-details");
    };
    const addEventListeners = () => {
        // Check if header is mouseout
        header.addEventListener("mouseleave", closeFilterList);
        // Search input & submit
        pokedexSearchInput.addEventListener("input", inputHasValue);
        pokedexSearchSubmit.addEventListener("click", searchPokemon);
        // Pokemon type checkbox
        pokemonTypeCheckbox.forEach(e => { e.addEventListener("click", (e) => updateTypesArr(e.target)); });
        // Pokemon type submit
        pokemonTypeSubmit.addEventListener("click", submitTypesArr);
        // Show filter list
        showHeaderFilterButton.addEventListener("click", showFilterList);
        resetFilterButton.addEventListener("click", resetFilter);
        // Show more pokemon
        buttonShowMore.addEventListener("click", () => buildPokedexList(tempArr));
        // Close pokemon details
        closePokemonDetailsCardBtn.addEventListener("click", closePokemonDetails);
    };
    const updateShowDetailsAddEventListeners = () => {
        const showPokemonDetailsButton = SelectshowDetailsButton();
        showPokemonDetailsButton.forEach(el => { el.addEventListener("click", buildPokemonDetails); });
    };
    return { initializePokedex };
};
// MAIN
// Starting app
const pokedex = Pokedex();
window.onload = () => pokedex.initializePokedex();
