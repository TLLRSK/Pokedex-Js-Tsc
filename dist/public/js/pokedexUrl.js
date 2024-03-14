const PokedexUrl = () => {
    const maxPokemonNumber = 151;
    let url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
    const getUrl = () => {
        return url;
    };
    const getSinglePokemonUrl = (id) => {
        url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        return getUrl();
    };
    const getAllPokemonUrl = () => {
        url = `https://pokeapi.co/api/v2/pokemon?limit=${maxPokemonNumber}&offset=0`;
        return getUrl();
    };
    return { getSinglePokemonUrl, getAllPokemonUrl };
};
export default PokedexUrl;
