'use client'


import { getArbitraryQuote } from '@/app/actions/getQuoteAction'
import { usePrivateAccount, usePrivateAccountFull } from '@/app/hooks/usePrivateAccount'
import { railgunAddressAtom, selectedTokensAtom, stepAtom, tokensAtom, totalValueAtom } from '@/atoms/walletAtoms'
import { TransactionReview } from '@/components/sweeper/TransactionReview'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createWalletClient, extractChain, http, zeroAddress } from 'viem'
import { base, mainnet, optimism, unichain } from 'viem/chains'

const outTokens = {
  [mainnet.id]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [optimism.id]: '0x4200000000000000000000000000000000000006',
  [base.id]: '0x4200000000000000000000000000000000000006',
  [unichain.id]: '0x4200000000000000000000000000000000000006',
}

export default function Review() {
  const account = usePrivateAccount()
  const fullAccount = usePrivateAccountFull()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)
  const setRailgunAddress = useSetAtom(railgunAddressAtom)

  const totalValue = useAtomValue(totalValueAtom)
  const tokens = useAtomValue(tokensAtom)
  const selectedTokens = useAtomValue(selectedTokensAtom)

  useEffect(() => {
    setStep(3)
  }, [])

  useEffect(() => {
    if (!fullAccount) return

    Promise.allSettled(
      selectedTokens.map(async (x) => {
        const eoaClient = createWalletClient({
          account: fullAccount,
          chain: extractChain({
            chains: [mainnet, optimism, base, unichain],
            id: x.chainId as any, // Replace with your desired chain ID
          }),
          transport: http(),
        })

        return getArbitraryQuote(
          BigInt(parseFloat(x.balance) * 1e18),
          x.address,
          outTokens[x.chainId] || zeroAddress,
          x.chainId,
          18,
          18,
          eoaClient
        )
      })
    )
      .then(console.log)
      .catch(console.error)
      .finally(() => console.log('GOT QUOTES'))
  }, [selectedTokens, fullAccount])

  if (!account && typeof window !== 'undefined') {
    router.replace('/')
    return null
  }

  return (
    <TransactionReview
      selectedTokens={selectedTokens}
      tokens={tokens}
      totalValue={totalValue}
      onStartSweep={(railgunAddress) => {
        // Store railgun address if provided
        if (railgunAddress && railgunAddress.trim()) {
          setRailgunAddress(railgunAddress.trim())
        }
        
        // Add 500ms delay before navigation
        setTimeout(() => {
          if (railgunAddress && railgunAddress.trim()) {
            // If 0ZK address provided, go to privacy deposit
            router.push('/privacy-deposit')
          } else {
            // If no 0ZK address, skip privacy deposit and go to completion without privacy
            router.push('/completion?privacy=false')
          }
        }, 500)
      }}
    />
  )
}
