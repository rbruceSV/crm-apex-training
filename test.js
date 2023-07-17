import { request, gql }  from 'graphql-request'
const graphURI = 'https://beta.pokeapi.co/graphql/v1beta';
const pageLimit = 50;
const order = [
  {id: 1, name: "Pokemon ID (Asc)", order_by: {id: "asc"}},
  {id: 2, name: "Pokemon ID (Desc)", order_by: {id: "desc"}},
  {id: 3, name: "Pokemon Name (Asc)", order_by: {name: "asc"}},
  {id: 4, name: "Pokemon Name (Desc)", order_by: {name: "desc"}}
];

// I still have some trouble wrapping my head around async stuff and want to avoid too many callbacks, so I'm just pretending we're synchronous for now
const pokeCount = await getPokemonCount();
const pokeTypes = await getPokemonTypes();

// Play with the filters here, should let you replicate the functionality that would be on the frontend
let filters = {
  page: 1,
  orderid: 1,
  typeid: 2
}

if (filters.typeid > pokeTypes.length) {
  filters.typeid = 0;
}

// call getAllPokemon with the filters provided
getAllPokemon(filters).then(pokemen => console.log(pokemen))

// call getPokemon with a pokemon species id
// getPokemon(1).then(pokemon => console.log(pokemon))

// Filters will contain our paging data (set limit and offset), order by, and potential type filter (any = use id > 0)
async function getAllPokemon(filters) {
  // The base graphQL query we're gonna run, 
  const query = gql`
  query getAllPokemon($limit: Int, $offset: Int, $where: pokemon_v2_pokemonspeciesname_bool_exp,   $orderBy: [pokemon_v2_pokemonspeciesname_order_by!]) {
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
  if (filters.typeid > 0) {
    where.pokemon_v2_pokemonspecy.pokemon_v2_pokemons.pokemon_v2_pokemontypes = {pokemon_v2_type: {name: {_eq: pokeTypes.find((val) => val.id === filters.typeid).name}}}
  }
  
  let variables = {
    limit: pageLimit,
    offset: pageLimit * (filters.page - 1),
    orderBy: order.find((val) => val.id === filters.orderid).order_by,
    where: where
  };
  
  let data = await request(graphURI, query, variables);
  // console.log(data)
  // flatten the "types" array out a bit.
  data.getAllPokemon.forEach((pokemon) => {
    pokemon.types = pokemon.specy.pokemen[0].types.map((val) => val.type.typenames[0].name);
    delete pokemon.specy;
  });
  return data.getAllPokemon;
}

// get data about a specific pokemon by species_id
async function getPokemon(id) {
  const query = gql`query getPokemon($where: pokemon_v2_pokemonspeciesname_bool_exp) {
    getPokemon: pokemon_v2_pokemonspeciesname(where: $where) {
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

  const data = await request(graphURI, query, variables);
  let pokemon = data.getPokemon[0];
  pokemon.stats = [];
  pokemon.height = Math.round(data.getPokemon[0].specy.pokemen[0].height * 3.937); // rounded to nearest inch. given in decimeters (1/10th of meter).
  pokemon.weight = Math.round((data.getPokemon[0].specy.pokemen[0].weight / 4.536) * 10) / 10; // rounded to first decimal place in pounds. given in hectograms (1/10th of kilogram).
  pokemon.specy.pokemen[0].stats.forEach((statVal) => pokemon.stats.push({statname: statVal.stat.statnames[0].statname, base_stat: statVal.base_stat}));
  delete pokemon.specy;

  // console.log(data.getPokemon[0].specy.pokemen[0].stats);
  return pokemon;
}

// Get a total count so we can set up paging
async function getPokemonCount() {
  const query = gql`
  query {
    getPokemonCount: pokemon_v2_pokemon_aggregate(where: {is_default: {_eq: true}}) {
      aggregate {
        count
      }
    }
  }`;

  let data = await request(graphURI, query);
  return data.getPokemonCount.aggregate.count;
}

// Get all the types so we can set up filter, will need to adjust this a bit to get the show name for dropdown
async function getPokemonTypes() {
  const query = gql`
  query {
    getPokemonTypes: pokemon_v2_pokemontype(distinct_on: type_id) {
      type: pokemon_v2_type {
        name
        id
        displaynames: pokemon_v2_typenames(where: {language_id: {_eq: 9}}) {
          displayname: name
        }
      }
    }
  }`;
  
  let data = await request(graphURI, query);
  return data.getPokemonTypes.map((val) => ({name: val.type.name, id: val.type.id, display: val.type.displaynames[0].displayname}));
}