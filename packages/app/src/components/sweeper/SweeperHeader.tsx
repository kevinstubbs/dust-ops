import { BoltIcon } from '@heroicons/react/24/outline'
// import Link from 'next/link'

interface SweeperHeaderProps {
  walletConnected: boolean
  address?: `0x${string}`
}

export function SweeperHeader({ walletConnected, address }: SweeperHeaderProps) {
  return (
    <div className='border-b border-slate-700 bg-slate-800/50 backdrop-blur'>
      <div className='max-w-6xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center'>
              <BoltIcon className='w-6 h-6' />
            </div>
            <h1 className='text-2xl font-bold'>TokenSweeper</h1>
          </div>
          <div className='flex items-center space-x-4'>
            {/* <Link 
              href="/examples" 
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Examples
            </Link> */}
            {walletConnected && address && (
              <div className='flex items-center space-x-3 text-sm'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                  <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
