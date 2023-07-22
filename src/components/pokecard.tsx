import styles from './pokecard.module.css'
import { Pokemon } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

export default function PokeCard ({ pokemon }: {pokemon: Pokemon}) {
  return (
    <>
      <Link href={`/pokemon/${pokemon.id}`}>
      <div className={styles.cardContainer}>
        <div className={styles.cardInfo}>
          <span className={styles.name}>{pokemon.name}</span>
          <div className={styles.flexRow}>
            <div className={styles.flexColumn}>
              {pokemon.types.map((typename) => (
                <div key={typename.toLowerCase()} className={`${styles.poketype} ${styles[typename.toLowerCase()]}`}>{typename}</div>
              ))}
              <div className={styles.pokenum}>#{pokemon.id.toString().padStart(4, '0')}</div>
            </div>
            <Image alt={pokemon.name}
            width={90}
            height={90}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}/>
          </div>
        </div>
      </div></Link>
    </>
  )
}