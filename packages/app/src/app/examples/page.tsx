import { CardList } from '@/components/CardList'
import { EXAMPLE_ITEMS } from './examples'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function ExamplesPage() {
  return (
    <>
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to TokenSweeper
        </Link>
        <h2 className='text-2xl mb-2'>Examples</h2>
        <p className='text-slate-300'>
          The following examples demonstrate various Web3 functionalities and help you bootstrap development.
        </p>
      </div>

      <CardList items={EXAMPLE_ITEMS} />
    </>
  )
} 