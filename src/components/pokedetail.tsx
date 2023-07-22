import styles from './pokedetail.module.css'
import { Pokemon } from '@/lib/types'
import Image from 'next/image'
import PokeStatsTable from './pokestatstable'

export default function PokeDetail ({ pokemon }: {pokemon: Pokemon}) {
  return (
    <>
      <div className={`${styles.flexRow} ${styles.splitem}`}>
        <section>
          <div className={`mainHeader`}><span>{pokemon.name}</span></div>
          <div className={styles.flexRow}>
            {pokemon.types.map((typename) => (
              <div key={typename.toLowerCase()} className={`${styles.poketype} ${styles[typename.toLowerCase()]}`}>{typename}</div>
            ))}
          </div>
          <div className={styles.pokenum}>#{pokemon.id.toString().padStart(4, '0')}</div>
        </section>
        <Image alt={pokemon.name}
              width={215}
              height={215}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}/>
      </div>
      <div>
        <PokeStatsTable pokemon={pokemon} />
      </div>
    </>
  )
}