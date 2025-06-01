import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import type { Token } from '@/atoms/walletAtoms'

interface TransactionReviewProps {
  selectedTokens: Token[]
  tokens: Token[]
  totalValue: number
  gas: bigint
  onStartSweep: () => void
}

export function TransactionReview({ selectedTokens, totalValue, gas, onStartSweep }: TransactionReviewProps) {
  const [isToggled, setIsToggled] = useState(false)

  useEffect(() => {
    // TODO: Calculate the swaps here.
    console.log({ selectedTokens })
  }, [selectedTokens])

  const handleToggle = () => {
    const newValue = !isToggled
    setIsToggled(newValue)
    return newValue
  }

  return (
    <div className='py-8'>
      <h2 className='text-3xl font-bold mb-8'>Review Sweep Transaction</h2>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <div className='bg-slate-800/50 rounded-xl p-6'>
            <h3 className='text-xl font-semibold mb-4'>Transaction Summary</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Selected Tokens:</span>
                <span>{selectedTokens.length}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Total Value:</span>
                <span className='text-green-400 font-semibold'>${totalValue.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Estimated Gas:</span>
                <span>${(Number(gas) / 1e9) * 20 * 0.66}</span>
                {/* 20 is a guess about gas price (gwei to pay per gas unit) */}
                {/* TODO: multiply gas by gas price and then by $NATIVE_TOKEN:USD */}
                {/* optimism:usd $0.66 */}
                {/* eth:usd $2506.39 */}
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Slippage:</span>
                <span>0.5%</span>
              </div>
              <hr className='border-slate-600' />
              <div className='flex justify-between font-semibold'>
                <span>Net Amount (ETH):</span>
                <span className='text-green-400'>~2.48 ETH</span>
              </div>
            </div>
          </div>

          <div className='bg-slate-800/50 rounded-xl p-6'>
            <h3 className='text-xl font-semibold mb-4 flex items-center'>
              <ShieldCheckIcon className='w-5 h-5 mr-2 text-purple-400' />
              Privacy Settings
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Railgun Deposit:</span>
                <span className='text-green-400'>Enabled</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Withdrawal Delay:</span>
                <span>3 days</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Fresh Wallet:</span>
                <span>Auto-generated</span>
              </div>
              <button
                onClick={handleToggle}
                className='w-full mt-4 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-white hover:bg-white/15 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] backdrop-saturate-150'>
                <span className='flex items-center justify-center space-x-2'>
                  <span
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${isToggled ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                  <span>{isToggled ? 'Advanced Mode Enabled' : 'Enable Advanced Mode'}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-slate-800/50 rounded-xl p-6'>
            <h3 className='text-xl font-semibold mb-4'>Processing Steps</h3>
            <div className='space-y-3'>
              {[
                'Cross-chain token swaps',
                'Consolidate to ETH',
                'Deposit to Railgun',
                '3-day privacy delay',
                'Withdraw to fresh wallet',
              ].map((step, index) => (
                <div key={index} className='flex items-center space-x-3'>
                  <div className='w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs'>
                    {index + 1}
                  </div>
                  <span className='text-slate-300'>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStartSweep}
            className='w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-4 rounded-xl font-semibold transition-all text-lg'>
            Confirm & Start Sweep
          </button>
        </div>
      </div>
    </div>
  )
}
