'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnection } from '@/components/sweeper/WalletConnection'
import { TokenScanning } from '@/components/sweeper/TokenScanning'
import { TokenSelection } from '@/components/sweeper/TokenSelection'
import { TransactionReview } from '@/components/sweeper/TransactionReview'
import { SweepProcessing } from '@/components/sweeper/SweepProcessing'
import { SweepCompletion } from '@/components/sweeper/SweepCompletion'
import { ProgressBar } from '@/components/sweeper/ProgressBar'
import { SweeperHeader } from '@/components/sweeper/SweeperHeader'

export type Token = {
  id: number
  symbol: string
  name: string
  chain: string
  balance: string
  value: string
  liquid: boolean
  selected: boolean
}

const steps = ['Connect Wallet', 'Scan Holdings', 'Select Tokens', 'Review & Sweep', 'Privacy Deposit', 'Completion']

const mockTokens: Token[] = [
  {
    id: 1,
    symbol: 'USDC',
    name: 'USD Coin',
    chain: 'Polygon',
    balance: '1,247.50',
    value: '$1,247.50',
    liquid: true,
    selected: true,
  },
  {
    id: 2,
    symbol: 'USDT',
    name: 'Tether',
    chain: 'BSC',
    balance: '892.33',
    value: '$892.33',
    liquid: true,
    selected: true,
  },
  {
    id: 3,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    chain: 'Arbitrum',
    balance: '445.67',
    value: '$445.67',
    liquid: true,
    selected: true,
  },
  {
    id: 4,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    chain: 'Optimism',
    balance: '0.75',
    value: '$2,850.00',
    liquid: true,
    selected: true,
  },
  {
    id: 5,
    symbol: 'SHIB',
    name: 'Shiba Inu',
    chain: 'Ethereum',
    balance: '50,000,000',
    value: '$1,200.00',
    liquid: false,
    selected: false,
  },
  {
    id: 6,
    symbol: 'LINK',
    name: 'Chainlink',
    chain: 'Ethereum',
    balance: '125.5',
    value: '$1,880.75',
    liquid: true,
    selected: true,
  },
]

export default function Web3SweeperPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [tokensLoading, setTokensLoading] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<number[]>([])
  const [sweepInProgress, setSweepInProgress] = useState(false)
  const [tokens] = useState<Token[]>(mockTokens)

  const { address, isConnected } = useAccount()

  // Initialize selected tokens with liquid tokens
  useEffect(() => {
    setSelectedTokens(tokens.filter((t) => t.liquid && t.selected).map((t) => t.id))
  }, [tokens])

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && currentStep === 0) {
      setCurrentStep(1)
      setTokensLoading(true)
      setTimeout(() => {
        setTokensLoading(false)
        setCurrentStep(2)
      }, 2000)
    }
  }, [isConnected, currentStep])

  const connectWallet = () => {
    // This will be handled by the Connect component
    setCurrentStep(1)
    setTokensLoading(true)
    setTimeout(() => {
      setTokensLoading(false)
      setCurrentStep(2)
    }, 2000)
  }

  const proceedToReview = () => {
    setCurrentStep(3)
  }

  const startSweep = () => {
    setSweepInProgress(true)
    setCurrentStep(4)
    setTimeout(() => {
      setCurrentStep(5)
      setSweepInProgress(false)
    }, 5000)
  }

  const toggleTokenSelection = (tokenId: number) => {
    const token = tokens.find((t) => t.id === tokenId)
    if (token?.liquid) {
      setSelectedTokens((prev) => (prev.includes(tokenId) ? prev.filter((id) => id !== tokenId) : [...prev, tokenId]))
    }
  }

  const totalValue = selectedTokens.reduce((sum, tokenId) => {
    const token = tokens.find((t) => t.id === tokenId)
    return sum + parseFloat(token?.value.replace('$', '').replace(',', '') || '0')
  }, 0)

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'>
      <SweeperHeader walletConnected={isConnected} address={address} />

      {isConnected && <ProgressBar steps={steps} currentStep={currentStep} />}

      <div className='max-w-6xl mx-auto px-6 pb-12'>
        {currentStep === 0 && <WalletConnection onConnect={connectWallet} />}

        {currentStep === 1 && <TokenScanning />}

        {currentStep === 2 && (
          <TokenSelection
            tokens={tokens}
            selectedTokens={selectedTokens}
            totalValue={totalValue}
            onToggleToken={toggleTokenSelection}
            onProceed={proceedToReview}
          />
        )}

        {currentStep === 3 && (
          <TransactionReview
            selectedTokens={selectedTokens}
            tokens={tokens}
            totalValue={totalValue}
            onStartSweep={startSweep}
          />
        )}

        {currentStep === 4 && <SweepProcessing />}

        {currentStep === 5 && <SweepCompletion />}
      </div>
    </div>
  )
}
