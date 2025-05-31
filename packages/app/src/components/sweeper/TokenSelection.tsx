import { ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Token } from '@/app/page'

interface TokenSelectionProps {
  tokens: Token[]
  selectedTokens: number[]
  totalValue: number
  onToggleToken: (tokenId: number) => void
  onProceed: () => void
}

export function TokenSelection({ tokens, selectedTokens, totalValue, onToggleToken, onProceed }: TokenSelectionProps) {
  return (
    <div className='py-8'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold mb-2'>Select Tokens to Sweep</h2>
        <p className='text-slate-300'>
          Liquid tokens are pre-selected. Total value:
          <span className='text-green-400 font-semibold'> ${totalValue.toLocaleString()}</span>
        </p>
      </div>

      <div className='grid gap-4 mb-8'>
        {tokens.map((token) => (
          <div
            key={token.id}
            onClick={() => onToggleToken(token.id)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedTokens.includes(token.id)
                ? 'border-purple-500 bg-purple-500/10'
                : token.liquid
                  ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                  : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
            }`}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div
                  className={`w-3 h-3 rounded-full ${
                    selectedTokens.includes(token.id) ? 'bg-purple-500' : 'bg-slate-600'
                  }`}></div>
                <div>
                  <div className='flex items-center space-x-2'>
                    <span className='font-semibold'>{token.symbol}</span>
                    <span className='text-xs bg-slate-700 px-2 py-1 rounded'>{token.chain}</span>
                    {!token.liquid && <span className='text-xs bg-red-600 px-2 py-1 rounded'>Low Liquidity</span>}
                  </div>
                  <p className='text-sm text-slate-400'>{token.name}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold'>{token.value}</p>
                <p className='text-sm text-slate-400'>{token.balance}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onProceed}
        disabled={selectedTokens.length === 0}
        className='cursor-pointer w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center'>
        Review & Sweep Selected Tokens
        <ChevronRightIcon className='w-5 h-5 ml-2' />
      </button>
    </div>
  )
}
