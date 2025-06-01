'use client'

import { usePrivateAccount } from '@/app/hooks/usePrivateAccount'
import { stepAtom } from '@/atoms/walletAtoms'
import { SweepCompletion } from '@/components/sweeper/SweepCompletion'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Completion() {
  const account = usePrivateAccount()
  const router = useRouter()
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(5)
  }, [])

  useEffect(() => {
    if (!account && typeof window !== 'undefined') {
      router.replace('/')
    }
  }, [account])

  return <SweepCompletion />
}
