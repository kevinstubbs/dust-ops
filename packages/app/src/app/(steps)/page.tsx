'use client'

import { stepAtom } from '@/atoms/walletAtoms'
import { WalletConnection } from '@/components/sweeper/WalletConnection'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export default function Home() {
  const setStep = useSetAtom(stepAtom)

  useEffect(() => {
    setStep(0)
  }, [])

  return <WalletConnection />
}
