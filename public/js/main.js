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
// Variables
let offset = 0;
const url = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`;
let pokemonsArr = [];
// Functions
const fetchPokemonsList = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch pokemons list from url
        const pokemonsListResponse = yield fetch(url);
        const pokemonsListData = yield pokemonsListResponse.json();
        console.log(pokemonsListData);
        const pokemonsList = yield pokemonsListData.results;
        console.log(pokemonsList);
        // Fetch every listed pokemon's data by it's url
        const fetchPokemon = pokemonsList.map((pokemon) => __awaiter(void 0, void 0, void 0, function* () {
            const pokemonResponse = yield fetch(pokemon.url);
            const pokemonData = yield pokemonResponse.json();
            // Destructuring pokemonData to extract the info we'll need
            const { id, name, sprites, types } = pokemonData;
            // Matching GBA sprite url
            const spriteUrl = sprites.versions["generation-i"].yellow["front_default"];
            return { id, name, spriteUrl, types };
        }));
        // Returning every pokemonData as a promise
        const listedPokemons = yield Promise.all(fetchPokemon);
        console.log(listedPokemons);
        addPokemon(listedPokemons);
        console.log(pokemonsArr);
    }
    catch (error) {
        console.log("error trying to fetch pokemon list", error);
    }
});
const addPokemon = (list) => {
    list.forEach(pokemon => {
        pokemonsArr.push(pokemon);
    });
};
// Main
fetchPokemonsList();
