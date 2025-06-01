'use client'

import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'
import { selectedTokensAtom, stepAtom, tokensAtom, totalValueAtom, railgunAddressAtom } from '@/atoms/walletAtoms'
import { TransactionReview } from '@/components/sweeper/TransactionReview'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Review() {
  const account = usePrivateAccount()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)
  const setRailgunAddress = useSetAtom(railgunAddressAtom)

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
