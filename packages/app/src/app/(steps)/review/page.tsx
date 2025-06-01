'use client'

import { stepAtom } from '@/atoms/walletAtoms'
import { TransactionReview } from '@/components/sweeper/TransactionReview'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export default function Review() {
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(3)
  }, [])

  return (
    <TransactionReview
      selectedTokens={selectedTokens}
      tokens={tokens}
      totalValue={totalValue}
      onStartSweep={startSweep}
    />
  )
}
