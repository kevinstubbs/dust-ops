'use client'

import { usePrivateAccount, usePrivateAccountFull } from '@/app/hooks/usePrivateAccount'
import { stepAtom, Token, tokensAtom } from '@/atoms/walletAtoms'
import { getMultipleTokenPrices } from '@/utils/simplePricing'
import { FetchedToken, fetchTokensFromAPIs } from '@/utils/tokenFetcher'
import { useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { convertFetchedTokensToTokens } from '../select-tokens/token-utils'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { createWalletClient, extractChain, http, zeroAddress } from 'viem'
import { getArbitraryQuote, outTokens } from '@/app/actions/getQuoteAction'
import { mainnet, optimism, base, unichain } from 'viem/chains'
import { CurrentConfig } from '@/app/actions/config'

export default function ScanHoldings() {
  const account = usePrivateAccount()
  const fullAccount = usePrivateAccountFull()
  const router = useRouter()
  const [tokens, setTokens] = useAtom(tokensAtom)
  const [numChecked, setNumChecked] = useState(0)
  const [totalNumChains, setTotalNumChains] = useState(0)
  const [progress, setProgress] = useState(0)
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(1)
  }, [])

  // Animate progress bar with variable speed
  useEffect(() => {
    const startTime = Date.now()
    const duration = 4000 // 4 seconds total

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1) // normalized time (0 to 1)

      // Custom easing: slow start, fast finish
      // Using exponential ease-in function
      const easedProgress = Math.pow(t, 0.3) * 100

      setProgress(easedProgress)

      if (t < 1) {
        requestAnimationFrame(animateProgress)
      }
    }

    requestAnimationFrame(animateProgress)
  }, [])

  useEffect(() => {
    if (!fullAccount) return

    fetchTokensFromAPIs(fullAccount.address, setNumChecked, setTotalNumChains)
      .then(async (_rawTokens) => {
        console.log('Fetched tokens:', _rawTokens)
        const fetchedTokens: FetchedToken[] = []

        for (let i = 0; i < _rawTokens.length; i++) {
          const x = _rawTokens[i]
          try {
            const eoaClient = createWalletClient({
              account: fullAccount,
              chain: extractChain({
                chains: [mainnet, optimism, base, unichain],
                id: x.chainId as any, // Replace with your desired chain ID
              }),
              transport: http(CurrentConfig.rpc[x.chainId as any]),
            })
            console.log(CurrentConfig.rpc[x.chainId as any])

            const res = await getArbitraryQuote(
              BigInt(parseFloat(x.balance) * 1e18),
              x.contractAddress,
              outTokens[x.chainId] || zeroAddress,
              // zeroAddress,
              x.chainId,
              18,
              18,
              eoaClient as any
            )

            console.log({ res })
            fetchedTokens.push(x as any)
          } catch (e) {
            if (x.chainId === 10) {
              console.warn(e, x)
            }
            // console.warn(e)
          }
        }

        // Fetch prices for the tokens
        const tokensForPricing = fetchedTokens.map((token) => ({
          contractAddress: token.contractAddress,
          name: token.name,
          chain: token.chain,
        }))

        console.log('Fetching prices for tokens:', tokensForPricing)

        if (tokensForPricing.length) {
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
        }

        // Move to token selection after progress completes
        setTimeout(() => {
          router.push('/select-tokens')
        }, 4500) // Slightly longer than progress animation
      })
      .catch((error) => {
        console.error('Error fetching tokens:', error)
        // On error, proceed to next step anyway
      })
  }, [fullAccount])

  useEffect(() => {
    if (!account && typeof window !== 'undefined') {
      router.replace('/')
    }
  }, [account])

  // getQuoteAction(CurrentConfig.tokens.amountIn, CurrentConfig.tokens.in.decimals, CurrentConfig.tokens.out.decimals)
  //     //   .then(console.log)
  //     //   .catch(console.error)
  //     //   .finally(() => console.log('Finished quoting'))

  //     if (isConnected && currentStep === 0) {
  //       setCurrentStep(1)

  //       // Fetch tokens from the APIs
  //

  return (
    <div className='text-center py-20'>
      <ArrowPathIcon className='w-16 h-16 mx-auto mb-6 animate-spin spin-gradient' />
      <h2 className='text-3xl font-bold mb-4 font-tanklager'>Scanning Your Holdings</h2>
      <p className='text-slate-300 mb-8 font-tanklager'>
        Analyzing tokens from Base, Optimism, and Unichain via Blockscout APIs...
      </p>
      <div className='max-w-md mx-auto'>
        <div className='bg-slate-700 rounded-full h-3 mb-4 overflow-hidden'>
          <div
            className='scan-progress-bar h-3 rounded-full transition-all duration-100 ease-out'
            style={{ width: `${progress}%` }}></div>
        </div>
        <p className='text-sm text-slate-400 font-tanklager'>
          Checking {numChecked}/{totalNumChains} chains...
        </p>
        <p className='text-sm text-slate-400 font-tanklager'>Found {tokens.length} tokens.</p>
      </div>
    </div>
  )
}
