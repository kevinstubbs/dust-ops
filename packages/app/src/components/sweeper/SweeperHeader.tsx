import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SweeperHeaderProps {
  walletConnected: boolean
  address?: `0x${string}`
  onDisconnect?: () => void
  onConnect?: () => void
}

export function SweeperHeader({ walletConnected, address, onDisconnect, onConnect }: SweeperHeaderProps) {
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

        {/* Right side - wallet display or connect button */}
        <div className="ml-auto flex items-center space-x-4">
          {walletConnected && address ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#BBB424' }}></div>
                <span 
                  className="text-white text-lg"
                  style={{ fontFamily: 'Tanklager, Arial, sans-serif' }}
                >
                  {formatAddress(address)}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  console.log('Disconnect button clicked')
                  onDisconnect?.()
                }}
                className="text-white hover:opacity-70 transition-opacity cursor-pointer p-1"
                title="Disconnect Wallet"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="btn-header-connect"
            >
              <span className="gradient-text">Connect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 