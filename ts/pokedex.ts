import PokedexUrl from "./pokedexUrl.js";

const Pokedex = () => {
    // Main data
    const APIurl = PokedexUrl();
    let pokedexArr: IPokemonData[] = [];
    let tempArr: IPokemonData[] = [];
    let typesArr: string[] = [];
    let loadingList: boolean = false;

    // HTML
    const header = document.querySelector(".js-header") as HTMLElement;
    const pokedexLoading = document.querySelector(".js-pokedex__loading") as HTMLElement;
    const pokedexBlank = document.querySelector(".js-pokedex__blank") as HTMLElement;
    const pokedexResults = document.querySelector(".js-pokedex__results") as HTMLElement;
    const pokedexList = document.querySelector(".js-pokedex__list") as HTMLElement;
    const pokedexSearchInput = document.querySelector(".js-pokedex__search-input") as HTMLInputElement | null;
    const pokedexSearchSubmit = document.querySelector(".js-pokedex__search-submit")  as HTMLElement;
    const showHeaderFilterButton = document.querySelector(".js-header__show-filter-btn") as HTMLElement;
    const headerFilter = document.querySelector(".js-header__filter") as HTMLElement;
    const resetFilterButton = document.querySelector(".js-types__reset-filter") as HTMLElement;
    const pokemonTypeCheckbox = document.querySelectorAll(".js-btn--type-filter") as NodeListOf<HTMLInputElement>;
    const pokemonTypeSubmit = document.querySelector(".js-pokedex__pokemon-type-submit") as HTMLInputElement;
    const buttonShowMore = document.querySelector(".js-btn--show-next") as HTMLElement;
    const pokemonDetailsCard = document.querySelector(".js-pokedex__pokemon-details-card") as HTMLElement;
    const closePokemonDetailsCardBtn = document.querySelector(".js-pokedex__pokemon-details-card") as HTMLElement;

    // Pokemon stats template builders

    // types
    const buildTypesTemplate = (typesArr: string[]) => {
        const singleTypeTemplate = (type: string) => {
            return `<p class="pokemon-type pokemon-type--${type}">${type}</p>`
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
                <li class="pokemon-stat">
                    <p class="pokemon-stat--name">${name}</p>
                    <p class="pokemon-stat--value">${value}</p>
                </li>
            `
        }
        return statsArr.map((stat: IPokemonStat) => singleStatTemplate(stat)).join('')
    }

    // TEMPLATES
    const pokemonCardTemplate = (pokemon: IPokemonData) => {
        const {id, sprites, name, types} = pokemon;
        
        return `
            <li data-id=${id} class="pokemon-card hover-shadow">
                <img class="pokemon-sprite" src="${sprites}" alt="${name}">
                <div class="pokemon-data">
                    <div class="pokemon-data-row">
                        <p class="pokemon-name">${name}</p>
                        <p class="pokemon-number">#${id}</p>
                    </div>
                    <div class="pokemon-types">${buildTypesTemplate(types)}</div>
                </div>
                <button class="btn--show-details js-btn--show-details"/>
            </li>
        `
    }
    const pokemonDetailsTemplate = (pokemonStats: IPokemonData) => {
        const { id, name, sprites, types, abilities, stats } = pokemonStats;
        return `
            <div class="pokemon-close-btn">
                <button class="btn--close-pokemon-details js-btn--close-pokemon-details">Close</button>
            </div>

            <div class="pokemon-info">
                <div class="pokemon-main-info">
                    <img src="${sprites}" class="pokemon-sprite--details" alt="${name}">
                    <div class="pokemon-data-row">
                        <h2 class="pokemon-name">${name}</h2>
                        <p class="pokemon-number">#${id}</p>
                    </div>
                    <div class="pokemon-types">
                        ${buildTypesTemplate(types)}
                    </div>
                </div>
            
                <did class="pokemon-details-info">
                    <div class="pokemon-detail">
                        <h3 class="pokemon-detail-title">Stats</h3>
                        <ul class="pokemon-detail-list">
                            ${buildStatsTemplate(stats)}
                        </ul>
                    </div>
                    <div class="pokemon-detail">
                        <h3 class="pokemon-detail-title">Abilities</h3>
                        <ul class=""pokemon-detail-list>
                            ${buildAbilitiesTemplate(abilities)}
                        </ul>
                    </div>
                </didv>
            </div>
        `
    }

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
    
    // List management
    const itemsPerPage = 12;
    let currentItems = 0;
    const resetCurrentItems = () => {
        currentItems = 0;
    }

    // Initializing pokedex
    const initializePokedex = async() => {
        const arr: IPokemonData[] = await getAllPokemonArr();
        pokedexArr = arr;
        tempArr = arr;
        buildPokedexList(pokedexArr)
        addEventListeners();
    }

     // Get all pokemon array
     const getAllPokemonArr = async() => {
        const url: string = await APIurl.getAllPokemonUrl();
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
            showLoadingPage();
            const pokemonPromises = pokemonsList.map(async(pokemon: IPokemonsList) => {
                return fetchSinglePokemon(pokemon.url);
            })
            // Returning every pokemonData as a promise
            const listedPokemons: IPokemonData[] = await Promise.all(pokemonPromises)
            return listedPokemons;
    
        } catch(error) {
            throw error;
        }
    }
    
    // Fetching single pokemon data
    const fetchSinglePokemon = async(pokemonUrl: string) => {
        const response = await fetch(pokemonUrl)
        const data = await response.json();
    
        // Destructuring pokemonData to extract the info we'll need
        let {id, name, sprites, types, abilities, stats } = data;

        // Sprites
        sprites = sprites.other.dream_world.front_default;

        // Types
        types = await Promise.all(types.map((prop: any) => prop.type.name))

        // Abilities
        abilities = await Promise.all(abilities.map((prop: any) => prop.ability.name))

        // Stats
        stats = await Promise.all(stats.map((prop: any) => ({name: prop.stat.name, value: prop.base_stat})))

        // Url
        const url: string = APIurl.getSinglePokemonUrl(id)

        // Result
        return { id, name, sprites, types, abilities, stats, url };
    }

    // Build pokedex list with the first itemsPerPage pokemons
    const buildPokedexList = async(arr: IPokemonData[]) => {
        closeLoadingPage();
        pokedexResults.innerHTML = `Showing ${tempArr.length} results`
        const slicedArr: IPokemonData[] = getNextPokemons(arr)
        slicedArr.map((pokemon: IPokemonData) => {
            pokedexList!.innerHTML += pokemonCardTemplate(pokemon);
        })
        currentItems > tempArr.length ? buttonShowMore.remove() : null;
        updateShowDetailsAddEventListeners();
    }

    const resetPokedexList = () => {
        pokedexList.innerHTML = ``;
    }

    // Getting next itemsPerPage pokemons from tempArray
    const getNextPokemons = (arr: IPokemonData[]) => {
        const start: number = currentItems;
        const end: number = start + itemsPerPage;
        currentItems += itemsPerPage;
        return arr.slice(start, end);
    }

    // SEARCH
    const searchPokemon = async (event: Event) => {
        event.preventDefault();
        const filteredArr: IPokemonData[] = await pokedexArr.filter(pokemon => pokemon.name.includes(pokedexSearchInput!.value as string))
        tempArr = await filteredArr;
        resetCurrentItems();
        resetPokedexList();
        buildPokedexList(tempArr);
    }
 
    // POKEMON STATS

    // Fetch single pokemon stats
    const fetchPokemonDetails = async (event: Event) => {
        const target = event.target as HTMLElement;
        const id: string = target.parentElement!.dataset.id!;
        const url: string = `https://pokeapi.co/api/v2/pokemon/${id}/`
        return await fetchSinglePokemon(url);
    };

    // Building details html
    const buildPokemonDetails = async (event: Event) => {
        pokemonDetailsCard!.innerHTML = "";
        const pokemonStats = await fetchPokemonDetails(event)
        pokemonDetailsCard.classList.remove("hidden")
        pokemonDetailsCard.innerHTML += await pokemonDetailsTemplate(pokemonStats)
        showBlank(1);
    }
    const getPokemonDetails = async (event: Event) => {
        const pokemonStats = await fetchPokemonDetails(event)
        console.log(pokemonStats);
    }

    // Close pokemon details
    const closePokemonDetails = () => {
        pokemonDetailsCard.classList.add("hidden");
        closeBlank();
    }

    // FILTER

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
        closeFilterList();
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
        pokedexSearchInput!.value !== '' 
        ? pokedexSearchSubmit.removeAttribute("disabled")
        : pokedexSearchSubmit.setAttribute("disabled", "");
    }

    // Show Filter list
    const showFilterList = () => {
        if (headerFilter.classList.contains("hidden--filter") ) {
            headerFilter.classList.remove("hidden--filter");
            showBlank(0);
        } else {
            closeFilterList();
        }
    }
    // Close Filter list
    const closeFilterList = () => {
        headerFilter.classList.add("hidden--filter");
        setTimeout(() => {
            closeBlank();
        },10)
    }
    // Reset Filter
    const resetFilter = () => {
        pokemonTypeCheckbox.forEach((checkbox: HTMLInputElement) => {
            checkbox.checked = false
        })
    }

    // BLANK DIV
    const showBlank = (index: number) => {
        if (pokedexBlank.classList.contains("hidden")) {
            pokedexBlank.classList.remove("hidden")
            pokedexBlank.style.zIndex = `${index}`
        }
    }
    const closeBlank = () => {
            pokedexBlank.classList.add("hidden"); 
    }

    // LOADING PAGE
    const showLoadingPage = () => {
        loadingList = true;
        pokedexLoading.style.display = "block";
    }
    const closeLoadingPage = () => {
        if (loadingList) {
            pokedexLoading.style.display = "none";
            loadingList = false;
        }
    }

    // ADDEVENTLISTENERS

    // Select show single pokemon stats buttons
    const SelectshowDetailsButton = () => {
        return document.querySelectorAll<HTMLElement>(".js-btn--show-details");
    }

    const addEventListeners = () => {

        // Check if header is mouseout
        header!.addEventListener("mouseleave", closeFilterList);

        // Search input & submit
        pokedexSearchInput!.addEventListener("input", inputHasValue);
        pokedexSearchSubmit!.addEventListener("click", searchPokemon);

        // Pokemon type checkbox
        pokemonTypeCheckbox!.forEach(e => {e.addEventListener("click", (e: Event) => updateTypesArr(e.target as HTMLInputElement))})

        // Pokemon type submit
        pokemonTypeSubmit!.addEventListener("click", submitTypesArr);

        // Show filter list
        showHeaderFilterButton!.addEventListener("click", showFilterList);
        resetFilterButton!.addEventListener("click", resetFilter);

        // Show more pokemon
        buttonShowMore!.addEventListener("click", () => buildPokedexList(tempArr) );
        // Close pokemon details

        closePokemonDetailsCardBtn!.addEventListener("click", closePokemonDetails);
        pokedexBlank!.addEventListener("click", closePokemonDetails);
    };

    const updateShowDetailsAddEventListeners = () => {
        const showPokemonDetailsButton = SelectshowDetailsButton();
        showPokemonDetailsButton.forEach(el => {el.addEventListener("click", buildPokemonDetails)});
    }

    return {initializePokedex}
}

export default Pokedex;