'use client'

import { CurrentConfig } from '@/app/actions/config'
import { getArbitraryQuote, outTokens } from '@/app/actions/getQuoteAction'
import { usePrivateAccount, usePrivateAccountFull } from '@/app/hooks/usePrivateAccount'
import { selectedTokensAtom, stepAtom, tokensAtom, totalValueAtom } from '@/atoms/walletAtoms'
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
      totalValue={totalValue}
      gas={estimatedGas}
      onStartSweep={() => {
        // TODO: Send the transaction here.
        router.push('/privacy-deposit')
      }}
    />
  )
}
