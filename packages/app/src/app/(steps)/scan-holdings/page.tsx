'use client'

import { usePrivateAccount, usePrivateAccountFull } from '@/app/hooks/usePrivateAccount'
import { stepAtom, tokensAtom } from '@/atoms/walletAtoms'
import { getMultipleTokenPrices } from '@/utils/simplePricing'
import { fetchTokensFromAPIs } from '@/utils/tokenFetcher'
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
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(1)
  }, [])

  useEffect(() => {
    if (!fullAccount) return

    fetchTokensFromAPIs(fullAccount.address, setNumChecked, setTotalNumChains)
      .then(async (_rawTokens) => {
        console.log('Fetched tokens:', _rawTokens)
        const fetchedTokens = []

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
              eoaClient
            )

            console.log({ res })
            fetchedTokens.push(x)
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

        // Move to token selection after a brief delay to show scanning
        setTimeout(() => {
          router.push('/select-tokens')
        }, 1000)
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
      <ArrowPathIcon className='w-16 h-16 mx-auto mb-6 animate-spin text-purple-400' />
      <h2 className='text-3xl font-bold mb-4'>Scanning Your Holdings</h2>
      <p className='text-slate-300 mb-8'>Analyzing tokens from Base, Optimism, and Unichain via Blockscout APIs...</p>
      <div className='max-w-md mx-auto'>
        <div className='bg-slate-700 rounded-full h-2 mb-4'>
          <div className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse w-3/4'></div>
        </div>
        <p className='text-sm text-slate-400'>
          Checking {numChecked}/{totalNumChains} chains...
        </p>
        <p className='text-sm text-slate-400'>Found {tokens.length} tokens.</p>
      </div>
    </div>
  )
}
