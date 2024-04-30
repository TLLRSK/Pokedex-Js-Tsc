var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import PokedexUrl from "./pokedexUrl.js";
const Pokedex = () => {
    // Main data
    const APIurl = PokedexUrl();
    let pokedexArr = [];
    let tempArr = [];
    let typesArr = [];
    let loadingList = false;
    // HTML
    const header = document.querySelector(".js-header");
    const pokedexLoading = document.querySelector(".js-pokedex__loading");
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
        console.log(statsArr)
        // const singleStatTemplate = (stat) => {
        //     const { name, value } = stat;
        //     return `
        //         <li class="pokemon-stat">
        //             <p class="pokemon-stat--name">${name}</p>
        //             <p class="pokemon-stat--value">${value}</p>
        //         </li>
        //     `;
        // };
        // return statsArr.map((stat) => singleStatTemplate(stat)).join('');
        return `
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">HP</p>
                    <p class="pokemon-stat--value">${statsArr[0].value}</p>
                </li>
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">ATK</p>
                    <p class="pokemon-stat--value">${statsArr[1].value}</p>
                </li>
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">DEF</p>
                    <p class="pokemon-stat--value">${statsArr[2].value}</p>
                </li>
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">SATK</p>
                    <p class="pokemon-stat--value">${statsArr[3].value}</p>
                </li>
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">SDEF</p>
                    <p class="pokemon-stat--value">${statsArr[4].value}</p>
                </li>
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">SPD</p>
                    <p class="pokemon-stat--value">${statsArr[5].value}</p>
                </li>
                `
    };
    // TEMPLATES
    const pokemonCardTemplate = (pokemon) => {
        const { id, sprites, name, types } = pokemon;
        return `
            <li data-id=${id} class="pokemon-card hover-shadow">
                <img class="pokemon-sprite" src="${sprites}" alt="${name}">
                <div class="pokemon-data">
                    <div class="pokemon-data-row">
                        <p class="pokemon-name">${name}</p>
                        <p class="pokemon-number">#${id}</p>
                    </div>
                    <div class="pokemon-types">${buildTypesTemplate(types)}</div>
                </div>
                <button class="btn--show-details js-btn--show-details"/>
            </li>
        `;
    };
    const pokemonDetailsTemplate = (pokemonStats) => {
        const { id, name, sprites, types, abilities, stats } = pokemonStats;
        return `
            <div class="pokemon-close-btn">
                <button class="btn--close-pokemon-details js-btn--close-pokemon-details">Close</button>
            </div>

            <div class="pokemon-info">
                <div class="pokemon-main-info">
                    <img src="${sprites}" class="pokemon-sprite--details" alt="${name}">
                    <div class="pokemon-data-row">
                        <h2 class="pokemon-name">${name}</h2>
                        <p class="pokemon-number">#${id}</p>
                    </div>
                    <div class="pokemon-types">
                        ${buildTypesTemplate(types)}
                    </div>
                </div>
            
                <did class="pokemon-details-info">
                    <div class="pokemon-detail">
                        <h3 class="pokemon-detail-title">Stats</h3>
                        <ul class="pokemon-detail-list">
                            ${buildStatsTemplate(stats)}
                        </ul>
                    </div>
                    <div class="pokemon-detail">
                        <h3 class="pokemon-detail-title">Abilities</h3>
                        <ul class=""pokemon-detail-list>
                            ${buildAbilitiesTemplate(abilities)}
                        </ul>
                    </div>
                </didv>
            </div>
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
            showLoadingPage();
            const pokemonPromises = pokemonsList.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
                return fetchSinglePokemon(pokemon.url);
            }));
            // Returning every pokemonData as a promise
            const listedPokemons = yield Promise.all(pokemonPromises);
            return listedPokemons;
        }
        catch (error) {
            throw error;
        }
    });
    // Fetching single pokemon data
    const fetchSinglePokemon = (pokemonUrl) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield fetch(pokemonUrl);
        const data = yield response.json();
        // Destructuring pokemonData to extract the info we'll need
        let { id, name, sprites, types, abilities, stats } = data;
        // Sprites
        sprites = sprites.other.dream_world.front_default;
        // Types
        types = yield Promise.all(types.map((prop) => prop.type.name));
        // Abilities
        abilities = yield Promise.all(abilities.map((prop) => prop.ability.name));
        // Stats
        stats = yield Promise.all(stats.map((prop) => ({ name: prop.stat.name, value: prop.base_stat })));
        // Url
        const url = APIurl.getSinglePokemonUrl(id);
        // Result
        return { id, name, sprites, types, abilities, stats, url };
    });
    // Build pokedex list with the first itemsPerPage pokemons
    const buildPokedexList = (arr) => __awaiter(void 0, void 0, void 0, function* () {
        closeLoadingPage();
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
    const getPokemonDetails = (event) => __awaiter(void 0, void 0, void 0, function* () {
        const pokemonStats = yield fetchPokemonDetails(event);
        console.log(pokemonStats);
    });
    // Close pokemon details
    const closePokemonDetails = () => {
        pokemonDetailsCard.classList.add("hidden");
        closeBlank();
    };
    // SINGLE POKEMON PAGE
    // FILTER
    // Updating typesarr
    const updateTypesArr = (target) => {
        !typesArr.includes(target.name)
            ? typesArr.push(target.name)
            : typesArr.splice(typesArr.indexOf(target.name), 1);
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
        resetCurrentItems();
        resetPokedexList();
        buildPokedexList(tempArr);
    });
    // Check search input has value
    const inputHasValue = () => {
        pokedexSearchInput.value !== ''
            ? pokedexSearchSubmit.removeAttribute("disabled")
            : pokedexSearchSubmit.setAttribute("disabled", "");
    };
    // Show Filter list
    const showFilterList = () => {
        if (headerFilter.classList.contains("hidden--filter")) {
            headerFilter.classList.remove("hidden--filter");
            showBlank(0);
        }
        else {
            closeFilterList();
        }
    };
    // Close Filter list
    const closeFilterList = () => {
        headerFilter.classList.add("hidden--filter");
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
    const showBlank = (index) => {
        if (pokedexBlank.classList.contains("hidden")) {
            pokedexBlank.classList.remove("hidden");
            pokedexBlank.style.zIndex = `${index}`;
        }
    };
    const closeBlank = () => {
        pokedexBlank.classList.add("hidden");
    };
    // LOADING PAGE
    const showLoadingPage = () => {
        loadingList = true;
        pokedexLoading.style.display = "block";
    };
    const closeLoadingPage = () => {
        if (loadingList) {
            pokedexLoading.style.display = "none";
            loadingList = false;
        }
    };
    // SCROLL
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
        pokedexBlank.addEventListener("click", closePokemonDetails);
    };
    const updateShowDetailsAddEventListeners = () => {
        const showPokemonDetailsButton = SelectshowDetailsButton();
        showPokemonDetailsButton.forEach(el => { el.addEventListener("click", buildPokemonDetails); });
    };
    // const updateShowDetailsAddEventListeners = () => {
    //     const showPokemonDetailsButton = SelectshowDetailsButton();
    //     showPokemonDetailsButton.forEach(el => {el.addEventListener("click", function(e) {
    //             e.preventDefault();
    //             getPokemonDetails(e);
    //         })
    //     })
    // }
    return { initializePokedex };
};
export default Pokedex;
