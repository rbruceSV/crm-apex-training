export interface RespStatVal {
  base_stat: number;
  stat: {
    statnames: {
      statname: string;
    }[]
  }
}

export interface RespTypes {
  type: {
    typenames: {
      name: string;
    }[]
  }
}

export interface AllTypes {
  type: {
    name: string;
    displaynames: {
      displayname: string;
    }[]
  }
}

export interface PokeStats {
  statname: string;
  base_stat: number;
}

export interface Specy {
	pokemen: {
		types: RespTypes[];
		stats?: RespStatVal;
		height?: number;
		weight?: number;
	}[]
}

// We can use optional members here and use this for both "getAllPokemon" and "getPokemon"
export interface Pokemon {
  name: string;
  id: number;
  types: string[];
  height?: number;
  weight?: number;
  stats?: PokeStats[];
  specy?: Specy; 
}

export interface IndexQuery {
  page?: number;
  type?: string;
}

export interface Order {
  id?: 'asc' | 'desc';
  name?: 'asc' | 'desc';
}

export interface PokemonTypes {
  value: string;
  display: string;
}