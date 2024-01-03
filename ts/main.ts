// HTML
const pokedexArticle = document.querySelector(".js-pokedex__article") as HTMLElement;
const pokedexList = document.querySelector(".js-pokedex__list") as HTMLElement;
const pokedexSearchInput = document.querySelector(".js-pokedex__search-input") as HTMLInputElement | null;
const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit")  as HTMLElement;
const buttonShowMoreContainer = document.querySelector(".pokedex__button--show-more") as HTMLElement;
const buttonShowMore = document.querySelector(".js-btn--show-more") as HTMLElement;
const pokemonStatsView = document.querySelector(".js-pokedex__pokemon-stats") as HTMLElement;
const pokemonTypeCheckbox = document.querySelectorAll(".js-btn--type-filter");
const pokemonTypeSubmit = document.querySelector(".js-pokedex__pokemon-type-submit") as HTMLInputElement;
// Select show stats buttons
const SelectshowDetailsButton = () => {
    return document.querySelectorAll<HTMLElement>(".js-btn--show-stats");
}
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
const pokedexUrl = () => {
    const maxPokemonNumber: number = 151;
    const add: number = 12;
    let currenPokemonNumber: number = add;
    let offset: number = 0;
    let url: string = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=0`;

    const getUrl = () => {
        return url;
    }
    const resetUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=0`;
        return getUrl();
    }
    const getSinglePokemonUrl = (id: string) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl()
    }
    const getAllPokemonUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
        return getUrl()
    }
    const updateOffset = () => {
        if (currenPokemonNumber + add < maxPokemonNumber) {
            offset += add;
            currenPokemonNumber += add;
            url = `https://pokeapi.co/api/v2/pokemon?limit=${add}&offset=${offset}`;
        } else {
            url = `https://pokeapi.co/api/v2/pokemon?limit=1&offset=${currenPokemonNumber}`;
            buttonShowMoreContainer.remove();
        }
    }
    return { getUrl, resetUrl, updateOffset, getSinglePokemonUrl, getAllPokemonUrl }
}

// fetching
const fetchPokemonsList = async(url: string) => {
    try {
        // Fetch pokemons list from url
        // const url = APIurl.getUrl();
        const response: Response = await fetch(url);
        const data: IPokemonsListData = await response.json();
        const pokemonsList: IPokemonsList[] = data.results;
        // Fetch every listed pokemon's data by it's own url
        const pokemonPromises = pokemonsList.map(async(pokemon: any) => {
            return fetchPokemon(pokemon.url);
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

// Fetching single pokemon
const fetchPokemon = async (pokemonUrl: string) => {
    const response = await fetch(pokemonUrl)
    const data = await response.json();

    // Destructuring pokemonData to extract the info we'll need
    let {id, name, sprites, height, types, abilities, stats } = data;

    // Customizing properties
    // sprites
    sprites = sprites.versions["generation-i"].yellow["front_default"];
    // types
    types = await Promise.all(types.map((prop: any) => prop.type.name))
    // abilities
    abilities = await Promise.all(abilities.map((prop: any) => prop.ability.name))
    //stats
    stats = await Promise.all(stats.map((prop: any) => ({name: prop.stat.name, value: prop.base_stat})))
    //url
    const url = APIurl.getSinglePokemonUrl(id)
    // result
    return { id, name, sprites, height, types, abilities, stats, url };
}

//building pokedex list
// Adding pokemons to pokedexArr
const addPokemon = async (arr: IPokemonData[]) => {
    pokedexArr = [];
    
    arr.forEach(pokemon => {
        pokedexArr.push(pokemon);
    });
    console.log(pokedexArr)
}

// Building pokedex list html
const buildPokemonsList = async (arr: IPokemonData[]) => {
    pokedexList.innerHTML = ``;
    arr.map(async (pokemon) => {
        pokedexList!.innerHTML += pokemonCardTemplate(pokemon);
    })
    updateShowDetailsAddEventListeners();
}
const buildSearchPokemonsList = (arr: IPokemonData[]) => {
    // create paragraph
    const paragraph = document.createElement("p");
    paragraph.classList.add("pokedex__search-results-number")
    // select
    const searchResultsNumber = document.querySelector(".pokedex__search-results-number")
    // check if there's a selected paragraph and paint it or not
    if (searchResultsNumber) {
        paragraph.textContent = `${arr.length} results founded`
    } else {
        paragraph.textContent = `${arr.length} results founded`
        pokedexArticle.insertBefore(paragraph, pokedexArticle.firstChild); 
    }
    // remove show more button
    buttonShowMoreContainer.remove();
    buildPokemonsList(arr);
}
const buildTypePokemonsList = (arr: string[]) => {
    return '';
}

// Building pokedex on start
const startPokedex = async () => {
    try {
        const url = APIurl.resetUrl();
        const pokemonList = await fetchPokemonsList(url)!;
        addEventListeners();
        await addPokemon(pokemonList);
        return await buildPokemonsList(pokedexArr);
    } catch (error) {
        throw error;
    }
};

// updating pokedex list
const updatePokedexList = async() => {
    const url = APIurl.getUrl()
    const newPokemonList = await fetchPokemonsList(url);
    return addPokemon(newPokemonList);
}

const showMorePokemons = async () => {
    APIurl.updateOffset();
    await updatePokedexList();
    return buildPokemonsList(pokedexArr);
}

// Get single pokemon stats
const fetchPokemonStats = async (event: Event) => {
    const target = event.target as HTMLElement;
    const id: string = target.parentElement!.dataset.id!;
    const url: string = `https://pokeapi.co/api/v2/pokemon/${id}/`
    return await fetchPokemon(url);
};

const buildPokemonStats = async (event: Event) => {
    pokemonStatsView!.innerHTML = "";
    const pokemonStats = await fetchPokemonStats(event)
    return pokemonStatsView!.innerHTML += await pokemonDetailsTemplate(pokemonStats)
}
// Searching pokemons
const searchPokemons = async (event: Event) => {
    event.preventDefault();

    const filterName: string = pokedexSearchInput!.value;
    const allPokemonUrl: string = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonsMaxNumber}&offset=0`

    const fetchSearchedPokemon = async (url: string) => {
        try {
            const response = await fetch(allPokemonUrl);
            const data = await response.json();
            const filteredPokemonPromises = await data.results.filter((pokemon: IPokemonData) => pokemon.name.includes(filterName))
            const filteredPokemonArr = await filteredPokemonPromises.map((pokemon: IPokemonData) => {
               return fetchPokemon(pokemon.url);
            })
            return await Promise.all(filteredPokemonArr);
        } catch(error) {
            throw error;
        }
    }
    const list = await fetchSearchedPokemon(allPokemonUrl)
    return buildSearchPokemonsList(list);
}

// Check search input value
const inputHasValue = () => {
    pokedexSearchInput!.value !== '' 
    ? pokedexSearchSubmit.removeAttribute("disabled")
    : pokedexSearchSubmit.setAttribute("disabled", "");
}
// Add all pokemon to pokedexarr
let typesArr: string[] = [];
const addAllPokemon = async () => {
    const url = APIurl.getAllPokemonUrl();
    return await fetchPokemonsList(url);
}

// POKEMON TYPE FILTER
// Updating typesarr
const updateTypesArr = (target: HTMLInputElement) => {
    if (!typesArr.includes(target.name)) {
        typesArr.push(target.name)
    } else {
        typesArr.splice(typesArr.indexOf(target.name),1)
    }
    console.log(typesArr)
}
// Submitting typesarr
const submitTypesArr = (e: Event) => {
    e.preventDefault();
    filterPokedexArr(typesArr);
}
// Filtering new arr
const filterPokedexArr = async (typesArr: string[]) => {
    const url = await APIurl.getAllPokemonUrl()
    const pokedexArr = await fetchPokemonsList(url);
    const filteredArr = pokedexArr.filter(pokemon => pokemon.types.some((type: string) => typesArr.includes(type)))
    typesArr.length > 0
        ? buildPokemonsList(filteredArr)
        : startPokedex();
}

// Set addeventlisteners
const addEventListeners = () => {
    // Search input & submit
    pokedexSearchInput!.addEventListener("input", inputHasValue);
    pokedexSearchSubmit!.addEventListener("click", searchPokemons);
    // Pokemon type checkbox
    pokemonTypeCheckbox!.forEach(e => {e.addEventListener("click", (e: Event) => updateTypesArr(e.target as HTMLInputElement))})
    // Pokemon type submit
    pokemonTypeSubmit!.addEventListener("click", submitTypesArr);
    // Show more btn
    buttonShowMore!.addEventListener("click", showMorePokemons);
    // Show stats btn
};

const updateShowDetailsAddEventListeners = () => {
    const showDetailsButton = SelectshowDetailsButton();
    showDetailsButton.forEach(el => {el.addEventListener("click", buildPokemonStats)});
}

// MAIN
// Starting app
window.onload = startPokedex;
const APIurl = pokedexUrl();