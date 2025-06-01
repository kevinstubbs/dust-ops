'use client'

import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'
import { selectedTokensAtom, stepAtom, tokensAtom, totalValueAtom } from '@/atoms/walletAtoms'
import { TransactionReview } from '@/components/sweeper/TransactionReview'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Review() {
  const account = usePrivateAccount()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)

  const totalValue = useAtomValue(totalValueAtom)
  const tokens = useAtomValue(tokensAtom)
  const selectedTokens = useAtomValue(selectedTokensAtom)

  useEffect(() => {
    setStep(3)
  }, [])

  if (!account && typeof window !== 'undefined') {
    router.replace('/')
    return null
  }

  return (
    <TransactionReview
      selectedTokens={selectedTokens}
      tokens={tokens}
      totalValue={totalValue}
      onStartSweep={() => {
        // TODO: Send the transaction here.
        router.push('/privacy-deposit')
      }}
    />
  )
}
