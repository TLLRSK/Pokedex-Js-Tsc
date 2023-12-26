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
        console.log(pokemonsListData);
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
        console.log(listedPokemons);
        addPokemon(listedPokemons);
        console.log(pokemonsArr)
    } catch(error) {
        console.log("error trying to fetch pokemon list", error)
    }
}

const addPokemon = (list: IPokemonData[]) => {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon)   
    })
}

// Main
fetchPokemonsList();
