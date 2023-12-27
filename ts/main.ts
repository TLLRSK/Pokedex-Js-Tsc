// HTML
const pokedexList = document.querySelector<HTMLElement>(".js-pokedex__list");
const pokedexSearchInput = document.querySelector<HTMLElement>(".js-pokedex__search-input")
const pokedexSearchSubmit = document.querySelector<HTMLElement>(".js-pokedex__search-submit")
const buttonShowMore = document.querySelector<HTMLElement>(".js-btn--show-more");
const pokemonStatsView = document.querySelector<HTMLElement>(".js-pokedex__pokemon-stats");

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
let APIurl: string = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
let pokemonsArr: IPokemonData[] = [];

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
// fetching
const fetchPokemonsList = async() => {
    try {
        // Fetch pokemons list from url
        const response: Response = await fetch(APIurl);
        const data: IPokemonsListData = await response.json();
        const pokemonsList: IPokemonsList[] = await data.results;

        // Fetch every listed pokemon's data by it's url
        const pokemonPromises = mapPokemonPromises(pokemonsList);
        
        // Returning every pokemonData as a promise
        const listedPokemons = await Promise.all(pokemonPromises)
        // For TSC: Must RETURN a value
        return listedPokemons;

    } catch(error) {
        // For TSC: Must RETURN an error instead of log it into console
        throw error;
    }
}

const mapPokemonPromises = (list: IPokemonsList[]) => {
    return list.map(async(pokemon: IPokemonsList) => {
        return fetchPokemon(pokemon.url);
    })
}

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
const fetchPokemon = async (pokemonUrl: string) => {
    const response = await fetch(pokemonUrl)
    const data = await response.json();

    // Destructuring pokemonData to extract the info we'll need
    const {id, name, sprites, height, types, abilities, stats } = data;

    // Customizing urls
    const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`

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
        <div class="pokemon-types">
            ${buildTypesTemplate(types)}
        </div>
        <div class="pokemon-stats">
            ${buildStatsTemplate(stats)}
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
const searchPokemon = async (event: Event) => {
    event.preventDefault();
    console.log(event.target!)
    
    const url: string = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0"

    const fetchAllPokemonsList = async (url: string) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const allPokemonsList = await data.results;
            return allPokemonsList;
        } catch(error) {
            throw error;
        }
    }
    // Testing
    const allPokemonsList = await fetchAllPokemonsList(url)
    const testArr = allPokemonsList.filter(pokemon => pokemon.name.includes("saur"))
    console.log(testArr)
}

// Select show stats buttons
const SelectShowStatsButtons = () => {
    return document.querySelectorAll<HTMLElement>(".js-btn--show-stats");
}

// Set addeventlisteners
const addEventListeners = () => {
    // Search input
    pokedexSearchSubmit!.addEventListener("click", searchPokemon)
    // Show more btn
    buttonShowMore!.addEventListener("click", showMorePokemons);
    // Show stats btn
    const showStatsButtons = SelectShowStatsButtons();
    showStatsButtons.forEach(el => {el.addEventListener("click", buildPokemonStats)});
};

// MAIN
// Starting app
window.onload = startPokedex;