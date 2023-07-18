import fetch from 'node-fetch';

const apiURL = 'https://beta.pokeapi.co/graphql/v1beta';
const pageLimit = 50;

// Play with the filters here, should let you replicate the functionality that would be on the frontend
let filters = {
  page: 1,
  order: {id: "asc"},
  type: 'dragon'
}

// call getAllPokemon with the filters provided
getAllPokemon(filters).then(pokemen => console.log(pokemen))

// call getPokemon with a pokemon species id
getPokemon(1).then(pokemon => console.log(pokemon))

// Filters will contain our paging data (set limit and offset), order by, and potential type filter
async function getAllPokemon(filters) {
  // The base graphQL query we're gonna run
  const query = `
  query getAllPokemon($limit: Int, $offset: Int, $where: pokemon_v2_pokemonspeciesname_bool_exp, $orderBy: [pokemon_v2_pokemonspeciesname_order_by!]) {
    getAllPokemon: pokemon_v2_pokemonspeciesname(limit: $limit, offset: $offset, where: $where, order_by: $orderBy) {
      name
      id: pokemon_species_id
      specy: pokemon_v2_pokemonspecy {
        pokemen: pokemon_v2_pokemons(where: {is_default: {_eq: true}}) {
          types: pokemon_v2_pokemontypes {
            type: pokemon_v2_type {
              typenames: pokemon_v2_typenames(where: {language_id: {_eq: 9}}) {
                name
              }
            }
          }
        }
      }
    }
  }`;

  let where = {
    language_id: {_eq: 9},
    pokemon_v2_pokemonspecy: {
      pokemon_v2_pokemons: {
        is_default: {_eq: true}
      }
    }
  };

  // if we have a "type" filter selected, add that to our where variable
  if (filters.type !== '') {
    where.pokemon_v2_pokemonspecy.pokemon_v2_pokemons.pokemon_v2_pokemontypes = {pokemon_v2_type: {name: {_eq: filters.type}}}
  }
  
  let variables = {
    limit: pageLimit,
    offset: pageLimit * (filters.page - 1),
    orderBy: filters.order,
    where: where
  };
  
  let data = await fetch(apiURL, {
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
  pokemen = pokemen.data;

  // flatten the "types" array out a bit, we can just '.toLowerCase()' for css class names later
  pokemen.getAllPokemon.forEach((pokemon) => {
    // the API insisting that I want pokemen because of different forms is mildly annoying, making me need to put [0] in :(
    pokemon.types = pokemon.specy.pokemen[0].types.map((val) => val.type.typenames[0].name);
    delete pokemon.specy;
  });
  return pokemen.getAllPokemon;
}

// get data about a specific pokemon by species_id
async function getPokemon(id) {
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
              statnames: pokemon_v2_statnames(where: {language_id: {_eq: 9}}) {
                statname: name
              }
            }
          }
          types: pokemon_v2_pokemontypes {
            type: pokemon_v2_type {
              typenames: pokemon_v2_typenames(where: {language_id: {_eq: 9}}) {
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
      language_id: {_eq: 9},
      pokemon_species_id: {_eq: id}
    }
  };
  
  let data = await fetch(apiURL, {
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
  pokemon.specy.pokemen[0].stats.forEach((statVal) => pokemon.stats.push({statname: statVal.stat.statnames[0].statname, base_stat: statVal.base_stat}));
  pokemon.types = pokemon.specy.pokemen[0].types.map((val) => val.type.typenames[0].name);
  delete pokemon.specy;

  // console.log(data.getPokemon[0].specy.pokemen[0].stats);
  return pokemon;
}