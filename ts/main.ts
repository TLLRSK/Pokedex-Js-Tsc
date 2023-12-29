// HTML
const pokedexArticle = document.querySelector(".js-pokedex__article") as HTMLElement;
const pokedexList = document.querySelector(".js-pokedex__list") as HTMLElement;
const pokedexSearchInput = document.querySelector(".js-pokedex__search-input") as HTMLInputElement | null;
const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit")  as HTMLElement;
const buttonShowMoreContainer = document.querySelector(".pokedex__button--show-more") as HTMLElement;
const buttonShowMore = document.querySelector(".js-btn--show-more") as HTMLElement;
const pokemonStatsView = document.querySelector(".js-pokedex__pokemon-stats") as HTMLElement;

// TEMPLATES
const pokemonTemplate = (pokemon: IPokemonData) => {
    return `
        <li data-id=${pokemon.id} class="pokedex__list-item">
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <p class="pokemon-number">#${pokemon.id}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">${buildTypesTemplate(pokemon.types)}</div>
            <button class="btn--show-stats js-btn--show-stats">show stats</button>
        </li>
    `
}

// VARIABLES
let offset: number = 0;
let APIurl: string = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=0`;
let pokemonsArr: IPokemonData[] = [];
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
    spriteUrl: IPokemonSpriteUrl,
    abilities: IPokemonAbility[],
    height: number,
    stats: IPokemonStat[],
    types: IPokemonType[],
    url: string
}
// separated interfaces
interface IPokemonSpriteUrl {
    versions: {
        "generation-i": {
            yellow: {
                "front_default": string;
            };
        };
    };
}
interface IPokemonType {
    type: {
        name: string
    }
}
interface IPokemonAbility {
    ability: {
        name: string
    } 
}
interface IPokemonStat {
    "base_stat": number,
    stat: {
        name: string
    }
}

// FUNCTIONS

// URL Management
const pokedexUrl = () => {
    let offset = 0;
    let url = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=0`;

    const getUrl = () => {
        return url;
    }
    const updateOffset = () => {
        offset += 10;
        url = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonsMaxNumber}&offset=${offset}`;
        return getUrl();
    }
    const getTypeUrl = (type: string) => {
        const types: any = {
            normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5,
            rock: 6, bug: 7, ghost: 8, fire: 10, water: 11,
            grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16,
        }
        return `https://pokeapi.co/api/v2/type/${types.type}`;
    }
    const getSinglePokemonUrl = (id: string) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl()
    }
    return { getUrl, updateOffset, getTypeUrl, getSinglePokemonUrl}
}

// fetching
const fetchPokemonsList = async() => {
    try {
        // Fetch pokemons list from url
        
        const response: Response = await fetch(APIurl);
        const data: IPokemonsListData = await response.json();
        const pokemonsList: IPokemonsList[] = await data.results;

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
    const {id, name, sprites, height, types, abilities, stats } = data;

    // Customizing urls
    const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
    const url = newAPIUrl.getSinglePokemonUrl(id)

    return { id, name, spriteUrl, height, types, abilities, stats, url };
}

//building pokedex list
//1. updating pokemon arr
const addPokemon = async (list: IPokemonData[]) => {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon);
    });
}
//2. building pokedex list html
const buildPokedexList = async (arr: IPokemonData[]) => {
    pokedexList!.innerHTML = '';
    arr.map(async (pokemon) => {
        pokedexList!.innerHTML += pokemonTemplate(pokemon);
    })
    addEventListeners();
}
const buildSearchPokedexList = (arr: IPokemonData[]) => {
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
    buildPokedexList(arr);
}
//3. building pokedex on start
const startPokedex = async () => {
    try {
        const pokemonList = await fetchPokemonsList()!;
        await addPokemon(pokemonList);
        return await buildPokedexList(pokemonsArr);
    } catch (error) {
        throw error;
    }
};

// updating pokedex list
const updateUrl = () => {
    offset += 10;
    APIurl =`https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
}

const updatePokedexList = async() => {
    updateUrl();
    const newPokemonList = await fetchPokemonsList();
    return addPokemon(newPokemonList);
}

const showMorePokemons = async () => {
    await updatePokedexList();
    return buildPokedexList(pokemonsArr);
}

// Get single pokemon stats
const fetchPokemonStats = async (event: Event) => {
    const target = event.target as HTMLElement;
    const id: string = target.parentElement!.dataset.id!;
    const url: string = `https://pokeapi.co/api/v2/pokemon/${id}/`
    return await fetchPokemon(url);
};

const pokemonStatsTemplate = (pokemonStats: IPokemonData) => {
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
    `
}
const buildPokemonStats = async (event: Event) => {
    pokemonStatsView!.innerHTML = "";
    const pokemonStats = await fetchPokemonStats(event)
    return pokemonStatsView!.innerHTML += await pokemonStatsTemplate(pokemonStats)
}

// Pokemon stats template builders
// types
const buildTypesTemplate = (pokemonTypesArr: IPokemonType[]) => {
    const singleTypeTemplate = (typeObj: IPokemonType) => {
        const typeName = typeObj.type.name;
        return `<p class="pokemon-type--${typeName}">${typeName}</p>`
    }
    return pokemonTypesArr
        .map(type => singleTypeTemplate(type))
        .join('');
}
// abilities
const buildAbilitiesTemplate = (pokemonAbilitiesArr: IPokemonAbility[]) => {
    const singleAbilityTemplate = (abilityOjb: IPokemonAbility) => {
        const abilityName = abilityOjb.ability.name;
        return `<p class="pokemon-ability">${abilityName}</p>`
    }
    return pokemonAbilitiesArr
        .map(ability => singleAbilityTemplate(ability))
        .join('');
}
// stats
const buildStatsTemplate = (pokemonStatsArr: IPokemonStat[]) => {
    const singleStatTemplate = (statOjb: IPokemonStat) => {
        const statName = statOjb.stat.name;
        const statValue = statOjb.base_stat;
        return `
            <div class="pokemon-stat">
                <p class="pokemon-stat--name">${statName}</p>
                <p class="pokemon-stat--value">${statValue}</p>
            </div>
        `
    }
    return pokemonStatsArr
        .map(stat => singleStatTemplate(stat))
        .join('')
}

// Search form
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
    return buildSearchPokedexList(list);
}

// Select show stats buttons
const SelectShowStatsButtons = () => {
    return document.querySelectorAll<HTMLElement>(".js-btn--show-stats");
}
// Check search input value
const inputHasValue = () => {
    pokedexSearchInput!.value !== '' 
    ? pokedexSearchSubmit.removeAttribute("disabled")
    : pokedexSearchSubmit.setAttribute("disabled", "");
}

// Set addeventlisteners
const addEventListeners = () => {
    // Search input & submit
    pokedexSearchInput!.addEventListener("input", inputHasValue);
    pokedexSearchSubmit!.addEventListener("click", searchPokemons);
    // Show more btn
    buttonShowMore!.addEventListener("click", showMorePokemons);
    // Show stats btn
    const showStatsButtons = SelectShowStatsButtons();
    showStatsButtons.forEach(el => {el.addEventListener("click", buildPokemonStats)});
};

// MAIN
// Starting app
window.onload = startPokedex;
const newAPIUrl = pokedexUrl();
console.log(newAPIUrl)