import { WalletIcon } from '@heroicons/react/24/outline'
import { Connect } from '@/components/Connect'

export function WalletConnection() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
        <WalletIcon className="w-12 h-12" />
      </div>
      <h2 className="text-4xl font-bold mb-4">Welcome to TokenSweeper</h2>
      <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
        Automatically consolidate your tokens across all EVM chains into ETH with privacy protection via Railgun
      </p>
      <div className="flex justify-center">
        <Connect />
      </div>
    </div>
  )
} 