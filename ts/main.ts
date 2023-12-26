// HTML
const pokedexList = document.querySelector(".js-pokedex__list");

const pokemonTemplate = (pokemon: IPokemonData) => {
    return `
        <li class="pokedex__list-item">
            <img src="${pokemon.spriteUrl}" alt="${pokemon.name}">
            <p>${pokemon.id}</p>
            <p>${pokemon.name}</p>
        </li>
    `
}

// Variables
let offset: number = 0;
const url: string = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
let pokemonsArr: IPokemonData[] = [];

// Interfaces
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
    id: number,
    name: string,
    spriteUrl: string,
    types: Object[]
}

// Functions
const fetchPokemonsList = async() => {
    try {
        // Fetch pokemons list from url
        const pokemonsListResponse: Response = await fetch(url);
        const pokemonsListData: IPokemonsListData = await pokemonsListResponse.json();
        const pokemonsList: IPokemonsList[] = await pokemonsListData.results;
        console.log(pokemonsList);
        // Fetch every listed pokemon's data by it's url
        const fetchPokemon = pokemonsList.map(async(pokemon) => {
            const pokemonResponse = await fetch(pokemon.url)
            const pokemonData = await pokemonResponse.json();
            // Destructuring pokemonData to extract the info we'll need
            const {id, name, sprites, types} = pokemonData;
            // Matching GBA sprite url
            const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
            return { id, name, spriteUrl, types };
        })
        // Returning every pokemonData as a promise
        const listedPokemons = await Promise.all(fetchPokemon)
        addPokemon(listedPokemons);
        console.log(pokemonsArr)
    } catch(error) {
        console.log("error trying to fetch pokemon list", error)
    }
    buildPokedexList(pokemonsArr);
}

const addPokemon = (list: IPokemonData[]) => {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon)   
    })
}

const buildPokedexList = (arr: IPokemonData[]) => {
    arr.map(async (pokemon) => {
        return pokedexList!.innerHTML += pokemonTemplate(pokemon);
    })
}

// Main
fetchPokemonsList();
