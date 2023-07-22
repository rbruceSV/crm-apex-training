import {Pokemon, RespTypes} from './types'

const PAGE_LIMIT: number = 50; // total of pokemon per page
const LANG_ID: number = 9; // English lang_id for pokeAPI
const API_URL: string = 'https://beta.pokeapi.co/graphql/v1beta'; // API to make graphql requests to

export async function getAllPokemon(page:number, type:string) {
  const offset: number = PAGE_LIMIT * (page - 1);
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
    orderBy: {id: "asc"},
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