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

  // Navigate to completion with privacy after processing animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/completion?privacy=true')
    }, 4500) // Slightly longer than the 4-second progress animation

    return () => clearTimeout(timer)
  }, [router])

  return <SweepProcessing />
}
