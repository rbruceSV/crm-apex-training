import {Pokemon, RespTypes, RespStatVal, AllTypes, Order} from './types'

const PAGE_LIMIT: number = 50; // total of pokemon per page
const LANG_ID: number = 9; // English lang_id for pokeAPI
const API_URL: string = 'https://beta.pokeapi.co/graphql/v1beta'; // API to make graphql requests to

export async function getAllPokemon(offset: number = 0, type: string = "", order: Order = {id: "asc"} ): Promise<Pokemon[]> {
  const query: string = `
  query getAllPokemon($limit: Int, $offset: Int, $where: pokemon_v2_pokemonspeciesname_bool_exp, $orderBy: [pokemon_v2_pokemonspeciesname_order_by!]) {
    getAllPokemon: pokemon_v2_pokemonspeciesname(limit: $limit, offset: $offset, where: $where, order_by: $orderBy) {
      name
      id: pokemon_species_id
      specy: pokemon_v2_pokemonspecy {
        pokemen: pokemon_v2_pokemons(where: {is_default: {_eq: true}}) {
          types: pokemon_v2_pokemontypes {
            type: pokemon_v2_type {
              typenames: pokemon_v2_typenames(where: {language_id: {_eq: ${LANG_ID}}}) {
                name
              }
            }
          }
        }
      }
    }
  }`;

  let where: any = {
    language_id: {_eq: LANG_ID},
    pokemon_v2_pokemonspecy: {
      pokemon_v2_pokemons: {
        is_default: {_eq: true}
      }
    }
  };

  // if we have a "type" filter selected, add that to our where variable
  if (type !== '') {
    where.pokemon_v2_pokemonspecy.pokemon_v2_pokemons.pokemon_v2_pokemontypes = {pokemon_v2_type: {name: {_eq: type}}}
  }
  
  let variables = {
    limit: PAGE_LIMIT,
    offset: offset,
    orderBy: order,
    //orderBy: {[filters.order.orderBy]: filters.order.orderDir},
    where: where
  };
  
  let data = await fetch(API_URL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  })

  //plural of pokemon is pokemen?
  let pokemen = await data.json();
  // I hate including .data all over the place >:(
  pokemen = pokemen.data.getAllPokemon;

  // flatten the "types" array out a bit, we can just '.toLowerCase()' for css class names later
  pokemen.forEach((pokemon: Pokemon) => {
		if ('specy' in pokemon && pokemon.specy !== undefined) {
    	pokemon.types = pokemon.specy.pokemen[0].types.map((val:RespTypes) => val.type.typenames[0].name);
		}
    delete pokemon.specy;
  });
  return pokemen;

}
export async function getPokemon(id: number|string): Promise<Pokemon> {
  const query = `query getPokemon($where: pokemon_v2_pokemonspeciesname_bool_exp) {
    getPokemon: pokemon_v2_pokemonspeciesname(limit: 1, where: $where) {
      name
      id: pokemon_species_id
      specy: pokemon_v2_pokemonspecy {
        pokemen: pokemon_v2_pokemons(where: {is_default: {_eq: true}}) {
          height
          weight
          stats: pokemon_v2_pokemonstats {
            base_stat
            stat: pokemon_v2_stat {
              statnames: pokemon_v2_statnames(where: {language_id: {_eq: ${LANG_ID}}}) {
                statname: name
              }
            }
          }
          types: pokemon_v2_pokemontypes {
            type: pokemon_v2_type {
              typenames: pokemon_v2_typenames(where: {language_id: {_eq: ${LANG_ID}}}) {
                name
              }
            }
          }
        }
      }
    }
  }`;

  const variables = {
    where: {
      language_id: {_eq: LANG_ID},
      pokemon_species_id: {_eq: id}
    }
  };
  
  let data: Response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  })

  let pokemon = await data.json();
  pokemon = pokemon.data.getPokemon[0];
  pokemon.stats = [];
  pokemon.height = Math.round(pokemon.specy.pokemen[0].height * 3.937); // rounded to nearest inch. given in decimeters (1/10th of meter).
  pokemon.weight = Math.round((pokemon.specy.pokemen[0].weight / 4.536) * 10) / 10; // rounded to first decimal place in pounds. given in hectograms (1/10th of kilogram).
  pokemon.specy.pokemen[0].stats.forEach((statVal:RespStatVal) => pokemon.stats.push({statname: statVal.stat.statnames[0].statname, base_stat: statVal.base_stat}));
  pokemon.types = pokemon.specy.pokemen[0].types.map((val:RespTypes) => val.type.typenames[0].name);
  delete pokemon.specy;

  return pokemon;
}

/**
 * lets us get a count for paginating
 */
export async function getAllPokeIds(type: string = '') {
  const query:string =`query getAllIds($where: pokemon_v2_pokemon_bool_exp) {
    getAllIds: pokemon_v2_pokemon(where: $where) {
      id: pokemon_species_id
    }
  }`;

  let where:any = {
    is_default: {_eq: true}
  };

  if (type !== '') {
    where.pokemon_v2_pokemontypes = {pokemon_v2_type: {name: {_eq: type}}}
  }

  const variables = {
    where: where
  };
  
  
  let data: Response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  })


  let allIds = await data.json();
  return allIds.data.getAllIds;
}

/**
 * get the types for the type filter
 */
export async function getAllPokeTypes() {
  const query:string =`query {
    getPokemonTypes: pokemon_v2_pokemontype(distinct_on: type_id) {
      type: pokemon_v2_type {
        name
        displaynames: pokemon_v2_typenames(where: {language_id: {_eq: ${LANG_ID}}}) {
          displayname: name
        }
      }
    }
  }`;
  
  let data: Response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query
    })
  })

  let allTypes = await data.json();
  let types = allTypes.data.getPokemonTypes.map((type:AllTypes) => ({value: type.type.name, display: type.type.displaynames[0].displayname}));
  return types;
}