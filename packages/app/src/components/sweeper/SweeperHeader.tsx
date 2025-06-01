import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SweeperHeaderProps {
  walletConnected: boolean
  address?: `0x${string}`
  onDisconnect?: () => void
}

export function SweeperHeader({ walletConnected, address, onDisconnect }: SweeperHeaderProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  return (
    <div className="header-professional relative">
      <div className="h-full flex items-center justify-between max-w-[1400px] mx-auto px-6">
        {/* Logo positioned 350px from left */}
        <div className="absolute left-[350px] flex items-center">
          <Link href="/" className="flex items-center">
            <svg 
              width="40" 
              height="20" 
              viewBox="0 0 41 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <path 
                d="M30 2C37 2 45.8902 22 30 22M30 2C15 3.5 21.5 22 30 22M30 2V22M2 22V2L18.5 22H2Z" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Center subheader */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <h1 className="text-subheader text-white text-lg tracking-wider">
            LEAVE NO TOKEN BEHIND
          </h1>
        </div>

        {/* Right side navigation and wallet */}
        <div className="ml-auto flex items-center space-x-6">
          <Link 
            href="/examples" 
            className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
          >
            Examples
          </Link>
          
          {walletConnected && address && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#BBB424' }}></div>
                <span className="text-white font-mono">
                  {formatAddress(address)}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  console.log('Disconnect button clicked')
                  onDisconnect?.()
                }}
                className="btn-disconnect flex items-center justify-center w-8 h-8 hover:scale-105 active:scale-95 transition-transform"
                title="Disconnect Wallet"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 