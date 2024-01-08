// HTML
const pokedexArticle = document.querySelector(".js-pokedex__article") as HTMLElement;
const pokedexResults = document.querySelector(".js-pokedex__results") as HTMLElement;
const pokedexList = document.querySelector(".js-pokedex__list") as HTMLElement;
const pokedexSearchInput = document.querySelector(".js-pokedex__search-input") as HTMLInputElement | null;
const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit")  as HTMLElement;
const buttonShowMoreContainer = document.querySelector(".pokedex__button--show-more") as HTMLElement;
const buttonShowMore = document.querySelector(".js-btn--show-next") as HTMLElement;
const pokemonStatsView = document.querySelector(".js-pokedex__pokemon-stats") as HTMLElement;
const pokemonTypeCheckbox = document.querySelectorAll(".js-btn--type-filter");
const pokemonTypeSubmit = document.querySelector(".js-pokedex__pokemon-type-submit") as HTMLInputElement;

// Pokemon stats template builders
// types
const buildTypesTemplate = (typesArr: string[]) => {
    const singleTypeTemplate = (type: string) => {
        return `<p class="pokemon-type--${type}">${type}</p>`
    }
    return typesArr.map(type => singleTypeTemplate(type)).join('');
}
// abilities
const buildAbilitiesTemplate = (pokemonAbilitiesArr: string[]) => {
    const singleAbilityTemplate = (ability: string) => {
        return `<p class="pokemon-ability">${ability}</p>`
    }
    return pokemonAbilitiesArr.map(ability => singleAbilityTemplate(ability)).join('');
}
// stats
const buildStatsTemplate = (statsArr: IPokemonStat[]) => {
    const singleStatTemplate = (stat: IPokemonStat) => {
        const {name, value} = stat;
        return `
            <div class="pokemon-stat">
                <p class="pokemon-stat--name">${name}</p>
                <p class="pokemon-stat--value">${value}</p>
            </div>
        `
    }
    return statsArr.map((stat: any) => singleStatTemplate(stat)).join('')
}
// TEMPLATES
const pokemonCardTemplate = (pokemon: IPokemonData) => {
    return `
        <li data-id=${pokemon.id} class="pokedex__list-item">
            <img src="${pokemon.sprites}" alt="${pokemon.name}">
            <p class="pokemon-number">#${pokemon.id}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">${buildTypesTemplate(pokemon.types)}</div>
            <button class="btn--show-stats js-btn--show-stats">show stats</button>
        </li>
    `
}
const pokemonDetailsTemplate = (pokemonStats: IPokemonData) => {
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
    `
}
// VARIABLES
let offset: number = 0;
let pokedexArr: IPokemonData[] = [];
const pokemonsMaxNumber: number = 151;

// INTERFACES
interface IPokemonsListData {
    count: number,
    next: string | null;
    previous: string | null;
    results: {
        name: string,
        url: string,
    }[]
}
interface IPokemonsList {
    name: string,
    url: string
}
interface IPokemonData {
    id: number;
    name: string;
    sprites: IPokemonsprites,
    abilities: string[],
    height: number,
    stats: IPokemonStat[],
    types: string[],
    url: string
}
// separated interfaces
interface IPokemonsprites {
    versions: {
        "generation-i": {
            yellow: {
                "front_default": string;
            };
        };
    };
}
interface IPokemonStat {
    name: string,
    value: number
}
// FUNCTIONS
// URL Management
const PokedexUrl = () => {
    const maxPokemonNumber: number = 151;
    let url: string = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;

    const getUrl = () => {
        return url;
    }
    const getSinglePokemonUrl = (id: string) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl()
    }
    const getAllPokemonUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
        return getUrl()
    }
    return { getSinglePokemonUrl, getAllPokemonUrl }
}
// Pokedex Arr management
const Pokedex = () => {
    // Main data
    const APIurl = PokedexUrl();
    let pokedexArr: IPokemonData[] = [];
    let tempArr: IPokemonData[] = [];
    let typesArr: string[] = [];
    
    // List management
    const itemsPerPage = 12;
    let currentItems = 0;
    const resetCurrentItems = () => {
        currentItems = 0;
    }

    // Initializing pokedex
    const initializePokedex = async() => {
        const arr = await getAllPokemonArr();
        pokedexArr = arr;
        tempArr = arr;
        buildPokedexList(pokedexArr)
        addEventListeners();
    }

     // Get all pokemon array
     const getAllPokemonArr = async() => {
        const url = await APIurl.getAllPokemonUrl();
        return await fetchPokedexList(url);
    }

    // Building pokedex list html
    const fetchPokedexList = async(url: string) => {
        try {
            // Fetch pokemons list from url
            const response: Response = await fetch(url);
            const data: IPokemonsListData = await response.json();
            const pokemonsList: IPokemonsList[] = data.results;
            // Fetch every listed pokemon's data by it's own url
            const pokemonPromises = pokemonsList.map(async(pokemon: any) => {
                return fetchSinglePokemon(pokemon.url);
            })
            // Returning every pokemonData as a promise
            const listedPokemons = await Promise.all(pokemonPromises)
            // For TSC: Must RETURN a value
            return listedPokemons;
    
        } catch(error) {
            // For TSC: Must RETURN an error instead of log it into console
            throw error;
        }
    }
    
    // Fetching single pokemon data
    const fetchSinglePokemon = async(pokemonUrl: string) => {
        const response = await fetch(pokemonUrl)
        const data = await response.json();

        // Destructuring pokemonData to extract the info we'll need
        let {id, name, sprites, height, types, abilities, stats } = data;

        // Customizing properties

        // Sprites
        sprites = sprites.versions["generation-i"].yellow["front_default"];

        // Types
        types = await Promise.all(types.map((prop: any) => prop.type.name))

        // Abilities
        abilities = await Promise.all(abilities.map((prop: any) => prop.ability.name))

        // Stats
        stats = await Promise.all(stats.map((prop: any) => ({name: prop.stat.name, value: prop.base_stat})))

        // Url
        const url = APIurl.getSinglePokemonUrl(id)

        // Result
        return { id, name, sprites, height, types, abilities, stats, url };
    }

    // Build pokedex list with the first itemsPerPage pokemons

    const buildPokedexList = async(arr: any[]) => {
        pokedexResults.innerHTML = `Showing ${tempArr.length} results`
        const slicedArr = getNextPokemons(arr)
        slicedArr.map((pokemon: any) => {
            pokedexList!.innerHTML += pokemonCardTemplate(pokemon);
        })
        currentItems > tempArr.length ? buttonShowMore.remove() : null;
        updateShowDetailsAddEventListeners();
    }

    const resetPokedexList = () => {
        pokedexList.innerHTML = ``;
    }

    // Getting next itemsPerPage pokemons from tempArray
    const getNextPokemons = (arr: any) => {
        const start = currentItems;
        const end = start + itemsPerPage;
        currentItems += itemsPerPage;
        return arr.slice(start, end);
    }

    // SEARCH
    const searchPokemon = async (event: Event) => {
        event.preventDefault();
        const filteredArr = await pokedexArr.filter(pokemon => pokemon.name.includes(pokedexSearchInput!.value as string))
        tempArr = await filteredArr;
        resetCurrentItems();
        resetPokedexList();
        buildPokedexList(tempArr);
    }
 
    // POKEMON STATS

    // Fetch single pokemon stats
    const fetchPokemonStats = async (event: Event) => {
        const target = event.target as HTMLElement;
        const id: string = target.parentElement!.dataset.id!;
        const url: string = `https://pokeapi.co/api/v2/pokemon/${id}/`
        return await fetchSinglePokemon(url);
    };
    // Building stats html
    const buildPokemonStats = async (event: Event) => {
        pokemonStatsView!.innerHTML = "";
        const pokemonStats = await fetchPokemonStats(event)
        return pokemonStatsView!.innerHTML += await pokemonDetailsTemplate(pokemonStats)
    }

    // TYPE FILTER

    // Updating typesarr
    const updateTypesArr = (target: HTMLInputElement) => {
        !typesArr.includes(target.name)
            ? typesArr.push(target.name)
            : typesArr.splice(typesArr.indexOf(target.name),1)
    }

    // Submitting typesarr
    const submitTypesArr = (e: Event) => {
        e.preventDefault();
        filterPokedexArr(typesArr);
    }

    // Filtering new arr
    const filterPokedexArr = async (typesArr: string[]) => {
        const filteredArr = await tempArr.filter(pokemon => pokemon.types.some((type: string) => typesArr.includes(type)))
        tempArr = await filteredArr;
        resetCurrentItems();
        resetPokedexList();
        buildPokedexList(tempArr)
    }
    
    // Check search input has value
    const inputHasValue = () => {
        console.log(pokedexSearchInput!.value)
        pokedexSearchInput!.value !== '' 
        ? pokedexSearchSubmit.removeAttribute("disabled")
        : pokedexSearchSubmit.setAttribute("disabled", "");
    }

    // ADDEVENTLISTENERS

    // Select show single pokemon stats buttons
    const SelectshowDetailsButton = () => {
        return document.querySelectorAll<HTMLElement>(".js-btn--show-stats");
    }

    const addEventListeners = () => {
        // Search input & submit
        pokedexSearchInput!.addEventListener("input", inputHasValue);
        pokedexSearchSubmit!.addEventListener("click", searchPokemon);
        // Pokemon type checkbox
        pokemonTypeCheckbox!.forEach(e => {e.addEventListener("click", (e: Event) => updateTypesArr(e.target as HTMLInputElement))})
        // Pokemon type submit
        pokemonTypeSubmit!.addEventListener("click", submitTypesArr);
        // Show more pokemon
        buttonShowMore!.addEventListener("click", () => buildPokedexList(tempArr) );
    };

    const updateShowDetailsAddEventListeners = () => {
        const showDetailsButton = SelectshowDetailsButton();
        showDetailsButton.forEach(el => {el.addEventListener("click", buildPokemonStats)});
    }

    return {initializePokedex}
}

// MAIN

// Starting app
const pokedex = Pokedex();
window.onload = () => pokedex.initializePokedex();