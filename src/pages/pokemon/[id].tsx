import Head from 'next/head'
import PokeDetail from '../../components/pokedetail'
import Link from 'next/link';
import { Inter } from 'next/font/google'
import { getPokemon } from '@/lib/pokeDynamic';
import { Pokemon } from '@/lib/types';

const inter = Inter({ subsets: ['latin'] });
 
export default function PokemonDetail({pokemon}:{pokemon: Pokemon}) {
  return (
    <>
      <Head>
        <title>Poked(ap)ex</title>
      </Head>
      <div className='mainContain'>
        <main className={`main ${inter.className}`}>
          <Link href="/"><div><span className='arrow blue'>❮</span><span>Back</span></div></Link>
          <PokeDetail pokemon={pokemon}/>
          
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context:any) {
  const { id } = context.query;
  const pokemon = await getPokemon(id);
  return {
    props: {
      pokemon
    },
  };
}