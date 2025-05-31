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
import { getTokenHoldings } from './actions/getHoldingsAction'
import { fetchTokensFromAPIs, type FetchedToken } from '@/utils/tokenFetcher'
import { getMultipleTokenPrices, type TokenPriceInfo } from '@/utils/simplePricing'

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

// Convert fetched tokens to Token format with pricing
function convertFetchedTokensToTokens(fetchedTokens: FetchedToken[], priceData?: TokenPriceInfo[]): Token[] {
  return fetchedTokens.map((token, index) => {
    // Calculate display balance with decimals
    const rawBalance = parseFloat(token.balance) || 0
    const decimals = parseInt(token.decimals) || 18
    const displayBalance = rawBalance / Math.pow(10, decimals)
    
    // Find price for this token
    const priceInfo = priceData?.find(p => 
      p.contractAddress.toLowerCase() === token.contractAddress.toLowerCase() && 
      p.chain.toLowerCase() === token.chain.toLowerCase()
    )
    
    const priceUSD = priceInfo?.priceUSD || 0
    const totalValue = displayBalance * priceUSD
    
    // Handle symbol and name for native vs ERC-20 tokens
    let symbol: string
    let name: string
    
    if (token.type === 'Native') {
      symbol = 'ETH'
      name = `Ether (${token.chain})`
    } else {
      // Create a better symbol from the token name for ERC-20 tokens
      symbol = token.name 
        ? token.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 6).toUpperCase()
        : 'UNKNOWN'
      name = token.name || 'Unknown Token'
    }
    
    return {
      id: index + 1,
      symbol: symbol,
      name: name,
      chain: token.chain,
      balance: displayBalance.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 6 
      }),
      value: totalValue > 0 
        ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      liquid: displayBalance > 0, // Only consider tokens with balance as liquid
      selected: displayBalance > 0 && totalValue > 0.01, // Only auto-select tokens with balance > $0.01
    }
  }).filter(token => parseFloat(token.balance.replace(/,/g, '')) > 0) // Filter out zero balance tokens
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTokens, setSelectedTokens] = useState<number[]>([])
  const [tokens, setTokens] = useState<Token[]>([])

  const { address, isConnected } = useAccount()

  // Initialize selected tokens with liquid tokens
  useEffect(() => {
    setSelectedTokens(tokens.filter((t) => t.liquid && t.selected).map((t) => t.id))
  }, [tokens])

  // Handle wallet connection and token fetching
  useEffect(() => {
    if (isConnected && currentStep === 0 && address) {
      setCurrentStep(1)

      console.log({ address })

      // Fetch tokens from the APIs
      fetchTokensFromAPIs(address)
        .then(async (fetchedTokens) => {
          console.log('Fetched tokens:', fetchedTokens)
          
          // Fetch prices for the tokens
          const tokensForPricing = fetchedTokens.map(token => ({
            contractAddress: token.contractAddress,
            name: token.name,
            chain: token.chain
          }))
          
          console.log('Fetching prices for tokens:', tokensForPricing)
          
          try {
            const priceData = await getMultipleTokenPrices(tokensForPricing)
            console.log('Price data:', priceData)
            
            const convertedTokens = convertFetchedTokensToTokens(fetchedTokens, priceData)
            setTokens(convertedTokens)
            console.log('Converted tokens with prices:', convertedTokens)
          } catch (priceError) {
            console.error('Error fetching prices:', priceError)
            // Fallback to tokens without pricing
            const convertedTokens = convertFetchedTokensToTokens(fetchedTokens)
            setTokens(convertedTokens)
            console.log('Converted tokens without prices:', convertedTokens)
          }
          
          // Move to token selection after a brief delay to show scanning
          setTimeout(() => {
            setCurrentStep(2)
          }, 3000)
        })
        .catch((error) => {
          console.error('Error fetching tokens:', error)
          // On error, proceed to next step anyway
          setTimeout(() => {
            setCurrentStep(2)
          }, 2000)
        })

      // Keep the original getTokenHoldings call for reference
      getTokenHoldings(address)
        .then(console.log)
        .catch(console.error)
    }
  }, [isConnected, currentStep, address])

  const proceedToReview = () => {
    setCurrentStep(3)
  }

  const startSweep = () => {
    setCurrentStep(4)

    // setTimeout(() => {
    //   setCurrentStep(5)
    // }, 5000)
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
    <div className='fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-auto'>
      <SweeperHeader walletConnected={isConnected} address={address} />

      {isConnected && <ProgressBar steps={steps} currentStep={currentStep} />}

      <div className='max-w-6xl mx-auto px-6 pb-12'>
        {currentStep === 0 && <WalletConnection />}

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
