'use client'

import { stepAtom } from '@/atoms/walletAtoms'
import { SweepProcessing } from '@/components/sweeper/SweepProcessing'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export default function PrivacyDeposit() {
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(4)
  }, [])

  return <SweepProcessing />
}
