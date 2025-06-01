import { ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Token } from '@/atoms/walletAtoms'

interface TokenSelectionProps {
  tokens: Token[]
  selectedTokens: Token[]
  totalValue: number
  onToggleToken: (tokenId: number) => void
  onProceed: () => void
}

export function TokenSelection({ tokens, selectedTokens, totalValue, onToggleToken, onProceed }: TokenSelectionProps) {
  return (
    <div className='py-8'>
      {/* Header and Button in 1:1 layout */}
      <div className='grid grid-cols-2 gap-8 items-end mb-8'>
        <div>
          <h2 className='text-3xl font-bold mb-2'>Select Tokens to Sweep</h2>
          <p className='text-slate-300'>
            Liquid tokens are pre-selected. Total value:
            <span className='font-semibold' style={{ color: '#BBB424' }}> ${totalValue.toLocaleString()}</span>
          </p>
        </div>
        
        <div>
          <button
            onClick={onProceed}
            // Don't disable if there are no tokens available at all (so user can see for demo purposes)
            disabled={selectedTokens.length === 0 && tokens.length > 0}
            className='cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 font-semibold transition-all flex items-center justify-center btn-review-sweep'
            style={{ borderRadius: '0px' }}>
            <span className='uppercase text-white font-bold'>REVIEW & SWEEP SELECTED TOKENS</span>
            <ChevronRightIcon className='w-5 h-5 ml-2 text-white' />
          </button>
        </div>
      </div>

      <div className='grid gap-4 mb-8'>
        {tokens.map((token) => {
          // Parse token value to determine if it's under $0.01
          const tokenValue = parseFloat(token.value.replace('$', '').replace(',', '') || '0')
          const isLowValue = tokenValue < 0.01
          const isSelected = selectedTokens.find((x) => x.id === token.id)
          
          return (
            <div
              key={token.id}
              onClick={() => onToggleToken(token.id)}
              className={`p-4 border-2 transition-all cursor-pointer token-selection-box ${
                isSelected
                  ? 'selected'
                  : isLowValue
                    ? 'token-low-value'
                    : token.liquid
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ 
                borderRadius: '0px',
                borderColor: isSelected ? '#BBB424' : undefined
              }}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`w-3 h-3`}
                    style={{ 
                      borderRadius: '0px',
                      backgroundColor: isSelected ? '#BBB424' : (isLowValue ? 'rgba(255, 255, 255, 0.3)' : '#64748b')
                    }}></div>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-semibold'>{token.symbol}</span>
                      <span className='text-xs bg-slate-700 px-2 py-1' style={{ borderRadius: '0px' }}>{token.chain}</span>
                      {!token.liquid && <span className='text-xs bg-red-600 px-2 py-1' style={{ borderRadius: '0px' }}>Low Liquidity</span>}
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
          )
        })}
      </div>
    </div>
  )
}
