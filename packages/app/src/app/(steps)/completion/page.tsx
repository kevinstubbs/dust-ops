'use client'

import { stepAtom } from '@/atoms/walletAtoms'
import { SweepCompletion } from '@/components/sweeper/SweepCompletion'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export default function Completion() {
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(5)
  }, [])

  return <SweepCompletion />
}
