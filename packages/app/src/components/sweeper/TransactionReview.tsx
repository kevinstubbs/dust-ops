import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import type { Token } from '@/atoms/walletAtoms'

interface TransactionReviewProps {
  selectedTokens: Token[]
  tokens: Token[]
  totalValue: number
  gas: bigint
  onStartSweep: (railgunAddress?: string) => void
}

export function TransactionReview({ selectedTokens, totalValue, gas, onStartSweep }: TransactionReviewProps) {
  const [isToggled, setIsToggled] = useState(false)
  const [railgunAddress, setRailgunAddress] = useState('')
  const [newWalletAddress, setNewWalletAddress] = useState('')

  useEffect(() => {
    // TODO: Calculate the swaps here.
    console.log({ selectedTokens })
  }, [selectedTokens])

  const handleToggle = () => {
    const newValue = !isToggled
    setIsToggled(newValue)
    return newValue
  }

  // Calculate actual total value from selected tokens
  // const actualTotalValue = selectedTokens.reduce((sum, token) => {
  //   const value = parseFloat(token.value.replace('$', '').replace(',', '') || '0')
  //   return sum + value
  // }, 0)

  // More realistic gas estimation based on transaction size
  const baseGasFee = 8.5 // Base gas fee in USD
  const additionalGasPerToken = selectedTokens.length * 2.5 // Additional gas per token
  const estimatedGas = baseGasFee + additionalGasPerToken

  const slippagePercent = 0.5
  const slippageAmount = totalValue * (slippagePercent / 100)

  // Check if we have enough funds before applying Math.max
  const calculatedNetAmount = totalValue - estimatedGas - slippageAmount
  const hasInsufficientFunds = calculatedNetAmount < 0

  // Ensure we don't have negative net amount
  const netUsdAmount = Math.max(0, calculatedNetAmount)

  // Convert to ETH (using approximate rate - in real app this would be dynamic)
  const ethPrice = 3200 // Approximate ETH price in USD
  const netEthAmount = netUsdAmount / ethPrice

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
                <span className='font-semibold' style={{ color: '#BBB424' }}>
                  ${totalValue.toLocaleString()}
                </span>
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
                <span>{slippagePercent}%</span>
              </div>
              <hr className='border-slate-600' />
              <div className='flex justify-between font-semibold'>
                <span>Net Amount (ETH):</span>
                {hasInsufficientFunds ? (
                  <span style={{ color: '#ff4444' }}>NOT ENOUGH FUNDS TO PAY GAS FEES</span>
                ) : (
                  <span style={{ color: '#BBB424' }}>~{netEthAmount.toFixed(4)} ETH</span>
                )}
              </div>
            </div>
          </div>

          <div className='bg-slate-800/50 rounded-xl p-6'>
            <h3 className='text-xl font-semibold mb-4 flex items-center'>
              <ShieldCheckIcon className='w-5 h-5 mr-2' style={{ color: '#BBB424' }} />
              Privacy Settings
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Railgun Deposit:</span>
                <span style={{ color: '#BBB424' }}>Enabled</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Withdrawal Delay:</span>
                <span>3 days</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Fresh Wallet:</span>
                <span>Auto-generated</span>
              </div>

              {!isToggled ? (
                <button
                  onClick={handleToggle}
                  className='w-full mt-4 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-white hover:bg-white/15 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] backdrop-saturate-150'>
                  <span className='flex items-center justify-center space-x-2'>
                    <span className='w-2 h-2 rounded-full bg-slate-400'></span>
                    <span>Enable Advanced Mode</span>
                  </span>
                </button>
              ) : (
                <div className='mt-4'>
                  <label className='input validator w-full'>
                    <input
                      type='text'
                      placeholder='RAILGUN 0ZK ADDRESS'
                      value={railgunAddress}
                      onChange={(e) => setRailgunAddress(e.target.value)}
                      className='w-full'
                      style={{ textTransform: 'uppercase' }}
                    />
                  </label>
                </div>
              )}
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
                  <div
                    className='w-6 h-6 rounded-full flex items-center justify-center text-xs text-black font-semibold'
                    style={{ backgroundColor: '#BBB424' }}>
                    {index + 1}
                  </div>
                  <span className='text-slate-300'>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-slate-800/50 rounded-xl p-6'>
            <h3 className='text-xl font-semibold mb-4'>Wallet Address</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-3 font-tanklager' style={{ color: '#BBB424' }}>
                  ADD NEW WALLET ADDRESS HERE
                </label>
                <input
                  type='text'
                  placeholder='0x...'
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border font-mono text-sm transition-all duration-300'
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                    e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>

              <button
                onClick={() => onStartSweep(railgunAddress)}
                disabled={(isToggled && !railgunAddress.trim()) || !newWalletAddress.trim()}
                className='w-full px-6 py-4 font-semibold transition-all text-lg btn-review-sweep disabled:opacity-50 disabled:cursor-not-allowed'
                style={{ borderRadius: '0.75rem' }}>
                <span className='uppercase text-white font-bold'>CONFIRM & START SWEEP</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
