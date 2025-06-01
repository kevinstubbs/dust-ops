import { WalletIcon } from '@heroicons/react/24/outline'
import { Connect } from '@/components/Connect'
import { useAtom } from 'jotai'
import { privateKeyAtom } from '@/atoms/walletAtoms'
import Link from 'next/link'
import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'

export function WalletConnection() {
  const [pkey, setPkey] = useAtom(privateKeyAtom)
  const account = usePrivateAccount()

  const isButtonActive = account && pkey?.trim()?.length

  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center px-4'>
  
     
      
      <div className='w-full max-w-[224px] mx-auto mb-8 mt-[130px]'>
        <label className='input validator w-full'>
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
            onChange={(e) => setPkey(e.target.value)}
            className='w-full'
          />
        </label>
        <p className='validator-hint hidden text-sm mt-2'>
          Must be a valid 64-character hexadecimal EVM private key, starting with 0x
        </p>
      </div>
      
      
      
      {isButtonActive && (
        <Link href='/scan-holdings'>
          <button className='btn-start-scanning mb-4'>
            <span className='gradient-text'>/Dust_OPS_Init</span>
          </button>
        </Link>
      )}
      
     
    </div>
  )
}
