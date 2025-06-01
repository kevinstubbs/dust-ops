import { ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import type { Token } from '@/atoms/walletAtoms'

interface TransactionReviewProps {
  selectedTokens: Token[]
  tokens: Token[]
  totalValue: number
  onStartSweep: (railgunAddress?: string) => void
}

// Available chains from the API
const AVAILABLE_CHAINS = [
  { name: 'Base', ticker: 'BASE' },
  { name: 'Optimism', ticker: 'OP' },
  { name: 'Unichain', ticker: 'UNI' }
]

export function TransactionReview({
  selectedTokens,
  tokens, // eslint-disable-line @typescript-eslint/no-unused-vars
  totalValue, // eslint-disable-line @typescript-eslint/no-unused-vars
  onStartSweep,
}: TransactionReviewProps) {
  const [isToggled, setIsToggled] = useState(false)
  const [railgunAddress, setRailgunAddress] = useState('')
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [selectedChain, setSelectedChain] = useState<string>('')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)

  const handleToggle = () => {
    const newValue = !isToggled
    setIsToggled(newValue)
    return newValue
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.chain-dropdown')) {
        setIsChainDropdownOpen(false)
      }
    }

    if (isChainDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChainDropdownOpen])

  // Calculate actual total value from selected tokens
  const actualTotalValue = selectedTokens.reduce((sum, token) => {
    const value = parseFloat(token.value.replace('$', '').replace(',', '') || '0')
    return sum + value
  }, 0)

  // More realistic gas estimation based on transaction size
  const baseGasFee = 8.50 // Base gas fee in USD
  const additionalGasPerToken = selectedTokens.length * 2.50 // Additional gas per token
  const estimatedGas = baseGasFee + additionalGasPerToken
  
  const slippagePercent = 0.5
  const slippageAmount = actualTotalValue * (slippagePercent / 100)
  
  // Check if we have enough funds before applying Math.max
  const calculatedNetAmount = actualTotalValue - estimatedGas - slippageAmount
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
                <span className='font-semibold' style={{ color: '#BBB424' }}>${actualTotalValue.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Estimated Gas:</span>
                <span>${estimatedGas.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Slippage:</span>
                <span>{slippagePercent}%</span>
              </div>
              <hr className='border-slate-600' />
              <div className='flex justify-between font-semibold'>
                <span>Net Amount (ETH):</span>
                {hasInsufficientFunds ? (
                  <span style={{ color: '#ff4444' }}>NOT ENOUGH FUNDS TO PAY GASS FEES</span>
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
              {!isToggled || !railgunAddress.trim() ? (
                // Show normal wallet address input when no 0ZK address is provided
                <>
                  <div>
                    <label className='block text-sm font-medium mb-3 font-tanklager' style={{ color: '#BBB424' }}>
                      ADD NEW WALLET ADDRESS HERE
                    </label>
                    <div className='flex gap-3'>
                      <input
                        type='text'
                        placeholder='0x...'
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        className='flex-1 px-4 py-3 rounded-xl border font-mono text-sm transition-all duration-300'
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
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
                      
                      {/* Chain Selection Dropdown */}
                      <div className='relative chain-dropdown'>
                        <button
                          type='button'
                          onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                          className='px-4 py-3 rounded-xl border font-mono text-sm transition-all duration-300 flex items-center gap-2 min-w-[80px] justify-center'
                          style={{
                            background: selectedChain ? 'rgba(187, 180, 36, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: selectedChain ? '1px solid rgba(187, 180, 36, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                          }}>
                          <span className='font-tanklager font-semibold'>
                            {selectedChain || 'CHAIN'}
                          </span>
                          <ChevronDownIcon className='w-4 h-4' />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {isChainDropdownOpen && (
                          <div 
                            className='absolute top-full mt-2 right-0 rounded-xl border overflow-hidden z-50'
                            style={{
                              background: 'rgba(30, 30, 30, 0.95)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                            }}>
                            {AVAILABLE_CHAINS.map((chain) => (
                              <button
                                key={chain.ticker}
                                type='button'
                                onClick={() => {
                                  setSelectedChain(chain.ticker)
                                  setIsChainDropdownOpen(false)
                                }}
                                className='w-full px-4 py-3 text-left hover:bg-white/10 transition-all duration-200 font-tanklager'
                                style={{ color: 'white' }}>
                                <div className='flex flex-col'>
                                  <span className='font-semibold text-sm'>{chain.ticker}</span>
                                  <span className='text-xs text-slate-400'>{chain.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Show RAILGUN privacy warning when 0ZK address is provided
                <div className='space-y-4'>
                  <div 
                    className="border rounded-lg p-4"
                    style={{ 
                      backgroundColor: 'rgba(187, 180, 36, 0.1)', 
                      borderColor: 'rgba(187, 180, 36, 0.2)' 
                    }}>
                    <p className='text-sm font-tanklager text-white'>
                      BE AWARE, RAILGUN HAS A RECOMMENDED PROCESS ON HANDLING YOUR FUNDS TO GUARANTEE YOUR OPTIMAL PRIVACY,{' '}
                      <a
                        href="https://docs.railgun.org/wiki"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='gradient-link'>
                        LEARN MORE HERE
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => onStartSweep(railgunAddress)}
                disabled={(isToggled && !railgunAddress.trim()) || (!isToggled && (!newWalletAddress.trim() || !selectedChain))}
                className='w-full px-6 py-4 font-semibold transition-all text-lg btn-review-sweep disabled:opacity-50 disabled:cursor-not-allowed'
                style={{ borderRadius: '0.75rem' }}>
                <span className='uppercase text-white font-bold'>
                  {!selectedChain && !isToggled ? 'SELECT CHAIN TO CONTINUE' : 'CONFIRM & START SWEEP'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
