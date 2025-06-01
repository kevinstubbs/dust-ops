'use client'

import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'
import { selectedTokensAtom, stepAtom, railgunAddressAtom } from '@/atoms/walletAtoms'
import { SweepCompletion } from '@/components/sweeper/SweepCompletion'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Completion() {
  const account = usePrivateAccount()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)
  const searchParams = useSearchParams()
  const selectedTokens = useAtomValue(selectedTokensAtom)
  const railgunAddress = useAtomValue(railgunAddressAtom)
  
  // Check if privacy was used (from URL parameter)
  const usedPrivacy = searchParams.get('privacy') === 'true'

  useEffect(() => {
    setStep(5)
  }, [])

  useEffect(() => {
    if (!account && typeof window !== 'undefined') {
      router.replace('/')
    }
  }, [account])

  return <SweepCompletion 
    usedPrivacy={usedPrivacy} 
    selectedTokens={selectedTokens}
    railgunAddress={railgunAddress}
  />
}
