import { WalletIcon } from '@heroicons/react/24/outline'
import { Connect } from '@/components/Connect'
import { useAtom } from 'jotai'
import { privateKeyAtom } from '@/atoms/walletAtoms'
import Link from 'next/link'
import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'

export function WalletConnection() {
  const [pkey, setPkey] = useAtom(privateKeyAtom)
  const account = usePrivateAccount()

  return (
    <div className='text-center py-20'>
      <div className='w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8'>
        <WalletIcon className='w-12 h-12' />
      </div>
      <h2 className='text-4xl font-bold mb-4'>Welcome to TokenSweeper</h2>
      <p className='text-xl text-slate-300 mb-8 max-w-2xl mx-auto'>
        Automatically consolidate your tokens across all EVM chains into ETH with privacy protection via Railgun
      </p>
      <div>
        <label className='input validator'>
          <svg className='h-[1em] opacity-50' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
            <g strokeLinejoin='round' strokeLinecap='round' strokeWidth='2.5' fill='none' stroke='currentColor'>
              <path d='M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'></path>
              <circle cx='16.5' cy='7.5' r='.5' fill='currentColor'></circle>
            </g>
          </svg>
          <input
            type='password'
            required
            placeholder='Private key'
            pattern='^0x.*'
            title='Must be a valid EVM private key, starting with 0x'
            value={pkey}
            autoComplete='off'
            onChange={(e) => setPkey(e.target.value)}
          />
        </label>
        <p className='validator-hint hidden'>
          Must be a valid 64-character hexadecimal EVM private key, starting with 0x
        </p>
      </div>
      <div className='my-8'>Account: {account}</div>
      <Link href='/scan-holdings'>
        <button className='btn' disabled={!account || !pkey?.trim()?.length}>
          Start scanning
        </button>
      </Link>
      {account ? (
        <div className='flex justify-center'>
          <Connect />
        </div>
      ) : null}
    </div>
  )
}
