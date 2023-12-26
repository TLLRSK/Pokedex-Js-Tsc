// HTML
const pokedexList = document.querySelector<HTMLElement>(".js-pokedex__list");
const buttonShowMore = document.querySelector<HTMLElement>(".js-btn--show-more");

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
let url: string = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
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
const fetchPokemonsList = async(): Promise<IPokemonData[]> => {
    try {
        // Fetch pokemons list from url
        const pokemonsListResponse: Response = await fetch(url);
        const pokemonsListData: IPokemonsListData = await pokemonsListResponse.json();
        const pokemonsList: IPokemonsList[] = await pokemonsListData.results;
 
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
        // For TSC: Must RETURN a value
        return listedPokemons;

    } catch(error) {
        // For TSC: Must RETURN an error instead of log it into console
        throw error;
    }
}

const addPokemon = async (list: IPokemonData[]) => {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon);
    });
}

const buildPokedexList = async (arr: IPokemonData[]) => {
    pokedexList!.innerHTML = '';
    arr.map(async (pokemon) => {
        pokedexList!.innerHTML += pokemonTemplate(pokemon);
    })
}

const startPokedex = async () => {
    try {
        const pokemonList = await fetchPokemonsList()!;
        await addPokemon(pokemonList);
        await buildPokedexList(pokemonsArr);
    } catch (error) {
        console.error("Error en la aplicación:", error);
    }
};

const showMorePokemons = async () => {
    await updatePokedexList();
    return buildPokedexList(pokemonsArr);
}

const updateUrl = () => {
    offset += 10;
    url =`https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
}

const updatePokedexList = async() => {
    updateUrl();
    const newPokemonList = await fetchPokemonsList();
    return addPokemon(newPokemonList);
}

// Main

// Starting app
window.onload = startPokedex;

// Setting button show more event listener
buttonShowMore!.addEventListener('click', showMorePokemons);