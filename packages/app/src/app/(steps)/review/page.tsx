'use client'

import { CurrentConfig } from '@/app/actions/config'
import { getArbitraryQuote, outTokens } from '@/app/actions/getQuoteAction'

import { usePrivateAccount, usePrivateAccountFull } from '@/app/hooks/usePrivateAccount'
import { railgunAddressAtom, selectedTokensAtom, stepAtom, tokensAtom, totalValueAtom } from '@/atoms/walletAtoms'
import { TransactionReview } from '@/components/sweeper/TransactionReview'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createWalletClient, extractChain, http, zeroAddress } from 'viem'
import { base, mainnet, optimism, unichain } from 'viem/chains'

export default function Review() {
  const account = usePrivateAccount()
  const fullAccount = usePrivateAccountFull()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)
  const setRailgunAddress = useSetAtom(railgunAddressAtom)

  const totalValue = useAtomValue(totalValueAtom)
  const tokens = useAtomValue(tokensAtom)
  const selectedTokens = useAtomValue(selectedTokensAtom)
  const [estimatedGas, setEstimatedGas] = useState(BigInt(0))

  useEffect(() => {
    setStep(3)
  }, [])

  useEffect(() => {
    if (!fullAccount) return

    let gas = BigInt(0)

    Promise.allSettled(
      selectedTokens.map(async (x) => {
        const eoaClient = createWalletClient({
          account: fullAccount,
          chain: extractChain({
            chains: [mainnet, optimism, base, unichain],
            id: x.chainId as any, // Replace with your desired chain ID
          }),
          transport: http(CurrentConfig.rpc[x.chainId as any]),
        })

        const res = await getArbitraryQuote(
          BigInt(parseFloat(x.balance) * 1e18),
          x.address,
          outTokens[x.chainId] || zeroAddress,
          x.chainId,
          18,
          18,
          eoaClient
        )

        console.log({ res }, res.gasEstimate)
        if (res.gasEstimate) {
          gas += res.gasEstimate
        }

        return res
      })
    )
      .then((x) => {
        console.log(x, { gas })
        setEstimatedGas(gas)
      })
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
      gas={estimatedGas}
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
