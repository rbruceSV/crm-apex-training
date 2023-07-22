import styles from './pokestatstable.module.css'
import { Pokemon } from '@/lib/types'
export default function PokeStatsTable ({ pokemon }: {pokemon: Pokemon}) {
  let pokeHeight: {feet: number, inches:number} = {feet: 0, inches: 0};
  pokeHeight.feet = Math.floor(pokemon.height!);
  pokeHeight.inches = pokemon.height! % 12;
  return (
    <>
      <section className={`${styles.statTable} ${styles.flexRow}`}>
        <div>
          <table>
            <tbody>
            <tr>
              <td>Height</td>
              <td className='bold'>{pokeHeight.feet}&apos; {pokeHeight.inches}&quot;</td>
            </tr>
            <tr>
              <td>Weight</td>
              <td className='bold'>{pokemon.weight!} lbs</td>
            </tr></tbody>
          </table>
        </div>
        <div>
          <table><tbody>
            {pokemon.stats!.map((statblock) => (
              <tr key={statblock.statname}>
                <td>{statblock.statname}</td>
                <td className='bold'>{statblock.base_stat}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}