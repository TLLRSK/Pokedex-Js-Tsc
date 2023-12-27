// HTML
const pokedexList = document.querySelector<HTMLElement>(".js-pokedex__list");
const buttonShowMore = document.querySelector<HTMLElement>(".js-btn--show-more");

const pokemonTemplate = (pokemon: IPokemonData) => {

    return `
        <li data-id=${pokemon.id} class="pokedex__list-item">
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <p class="pokemon-number">#${pokemon.id}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">${buildTypeTemplate(pokemon.types)}</div>
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
    spriteUrl: {
        versions: {
            "generation-i": {
                yellow: {
                    "front_default": string;
                };
            };
        };
    };
    types: {
        type: {
            name: string;
        };
    }[];
}
interface IPokemonType {
    type: {
        name: string
    }
}

// FUNCTIONS
// fetching
const fetchPokemonsList = async() => {
    try {
        // Fetch pokemons list from url
        const pokemonsListResponse: Response = await fetch(APIurl);
        const pokemonsListData: IPokemonsListData = await pokemonsListResponse.json();
        const pokemonsList: IPokemonsList[] = await pokemonsListData.results;
 
        // Fetch every listed pokemon's data by it's url
        const fetchPokemon = pokemonsList.map(async(pokemon) => {
            const response = await fetch(pokemon.url)
            const data = await response.json();
            // Destructuring pokemonData to extract the info we'll need
            const {id, name, sprites, types} = data;
            // Matching GBA sprite url
            const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
            const url = `https://pokeapi.co/api/v2/pokemon/${id}/`
            return { id, name, spriteUrl, types, url };
        })
        // Returning every pokemonData as a promise
        const listedPokemons = await Promise.all(fetchPokemon)
        // For TSC: Must RETURN a value
        return listedPokemons;

    } catch(error) {
        // For TSC: Must RETURN an error instead of log it into console
        throw error;
    }
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

// building pokemon types template
const buildTypeTemplate = (pokemonTypes: IPokemonType[]) => {
    const singleTypeTemplate = (typeObj: IPokemonType) => {
        const typeName = typeObj.type.name;
        return `<p class="pokemon-type--${typeName}">${typeName}</p>`
    }
    return pokemonTypes
        .map(type => singleTypeTemplate(type))
        .join('');
}

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
const getPokemonStats = (event: Event) => {
    const target = event.target as HTMLElement;
    const id: string = target.parentElement!.dataset.id!;
    console.log(`ID del Pokémon: ${id}`);

    const fetchPokemonStats = async () => {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}/`
        try {
            const response = await fetch(url);
            const data = await response.json();
            // console.log(data)
            const {id, name, height, abilities, types, stats} = data;
            console.log({id, name, height, abilities, types, stats})
            return {id, name, height, abilities, types, stats};
        } catch(error) {
            throw error;
        }
    }
    fetchPokemonStats();
};
// Select show stats buttons
const SelectShowStatsButtons = () => {
    return document.querySelectorAll<HTMLElement>(".js-btn--show-stats");
}
// Set addeventlisteners
const addEventListeners = () => {
    // Show more btn
    buttonShowMore!.addEventListener("click", showMorePokemons);
    // Show stats btn
    const showStatsButtons = SelectShowStatsButtons();
    showStatsButtons.forEach(el => {el.addEventListener("click", getPokemonStats)});
};

// MAIN
// Starting app
window.onload = startPokedex;