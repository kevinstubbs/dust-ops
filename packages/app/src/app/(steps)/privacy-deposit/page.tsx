'use client'

import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'
import { stepAtom } from '@/atoms/walletAtoms'
import { SweepProcessing } from '@/components/sweeper/SweepProcessing'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PrivacyDeposit() {
  const account = usePrivateAccount()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(4)
  }, [])

  useEffect(() => {
    if (!account && typeof window !== 'undefined') {
      router.replace('/')
    }
  }, [account])

  return <SweepProcessing />
}
