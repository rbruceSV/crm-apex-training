import Head from 'next/head';
import { useState } from 'react';
import { getAllPokemon, getAllPokeIds, getAllPokeTypes } from '@/lib/pokeDynamic';
import { Pokemon, Order, PokemonTypes } from '@/lib/types';
import PokeCard from '@/components/pokecard';
import { Inter } from 'next/font/google'
import styles from '@/styles/Poke.module.css'

const inter = Inter({ subsets: ['latin'] });
const PAGE_LIMIT: number = 50;
const ORDER_ARR: Order[] = [{id: "asc"}, {id: "desc"}, {name: "asc"}, {name: "desc"}];
const ORDER_CONTROL: string[] = ["Pokedex ID (Ascending)", "Pokedex ID (Descending)", "Pokemon Name", "Pokemon Name (Reversed)"];

export default function Home({pokemenDef, pokeCount, pokeTypes}:{pokemenDef: Pokemon[], pokeCount:number, pokeTypes: PokemonTypes[]}) {
  const [pokemen, setPokemen] = useState(pokemenDef);
  const [offset, setOffset] = useState(0);
  const [typeVal, setTypeVal] = useState('');
  const [pokeTotal, setPokeTotal] = useState(pokeCount);
  const [order, setOrder] = useState(0);

  // Couldn't do this if the API wasn't public / confidential key, we'd have to do server side rendering?
  function goNextPokemon() {
    if (offset >= pokeTotal - PAGE_LIMIT) { return; }

    let newOffset:number = offset + PAGE_LIMIT;
    loadPokemon(newOffset, typeVal, order);
  }

  function goPrevPokemon() {
    if (offset === 0) { return; }

    let newOffset:number = offset - PAGE_LIMIT;
    if (newOffset < 0) {
      newOffset = 0
    }

    loadPokemon(newOffset, typeVal, order);
  }

  function updateFilter(type:string) {
    getAllPokeIds(type).then((ids) => {
      setOffset(0)
      setPokeTotal(ids.length);
      loadPokemon(0, type, order);
    });
  }

  function updateOrder(id:number) {
    setOffset(0)
    loadPokemon(0, typeVal, id);
  }

  function loadPokemon(offset:number, type:string, orderid:number) {
    getAllPokemon(offset, type, ORDER_ARR[orderid]).then((pokemen) => {
      setOffset(offset);
      setTypeVal(type);
      setOrder(orderid);
      setPokemen(pokemen);
    })
  }

  return (
    <>
      <Head>
        <title>Poked(ap)ex</title>
      </Head>
      <div className={styles.mainContain}>
        <main className={`${styles.main} ${inter.className}`}>
          <div className={styles.mainHeader}><span>Pokédex</span></div>
          <div className={styles.flexRow}>
            <div>
              {/* These should be custom components */}
              <label>Type</label>
              <select value={typeVal} onChange={(e) => {updateFilter(e.target.value);}}>
                <option value=''>Any</option>
                {pokeTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.display}</option>
                ))}
              </select>
            </div>
            <div>
              {/* But they aren't :(*/}
              <label>Sort By</label>
              <select value={order} onChange={(e) => {updateOrder(parseInt(e.target.value));}}>
                {ORDER_CONTROL.map((ordertype, index) => (
                  <option key={index} value={index}>{ordertype}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.gridContainer}>
            {pokemen.map((pokemon) => (<PokeCard key={pokemon.id} pokemon={pokemon} />))}
          </div>
          <div className={styles.buttonsContainer}>
            <button className={`${styles.button} arrow blue`} onClick={goPrevPokemon}>❮</button>
            <span>{offset}-{(offset + PAGE_LIMIT > pokeTotal) ? pokeTotal : offset + PAGE_LIMIT} of {pokeTotal}</span>
            <button className={`${styles.button} arrow blue`} onClick={goNextPokemon}>❯</button>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const pokemenDefault = await getAllPokemon();
  const pokeIds = await getAllPokeIds();
  const pokeTypes = await getAllPokeTypes();
  return {
    props: {
      pokemenDef: pokemenDefault,
      pokeCount: pokeIds.length,
      pokeTypes: pokeTypes
    },
  };
}