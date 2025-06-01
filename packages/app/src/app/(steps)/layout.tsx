'use client'

import { stepAtom } from '@/atoms/walletAtoms'
import { ProgressBar } from '@/components/sweeper/ProgressBar'
import { SweeperHeader } from '@/components/sweeper/SweeperHeader'
import { useAtomValue } from 'jotai'
import { PropsWithChildren } from 'react'

const steps = ['Connect Wallet', 'Scan Holdings', 'Select Tokens', 'Review & Sweep', 'Privacy Deposit', 'Completion']
const stepUrls = ['/', 'scan-holdings', 'select-tokens', 'review', 'privacy-deposit', 'completion']

export default function Layout({ children }: PropsWithChildren) {
  const step = useAtomValue(stepAtom)
  //   // Initialize selected tokens with liquid tokens
  //   useEffect(() => {
  //     setSelectedTokens(tokens.filter((t) => t.liquid && t.selected).map((t) => t.id))
  //   }, [tokens])

  return (
    <div className='fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-auto'>
      <div className='max-w-6xl mx-auto px-6 pb-12'>
        <SweeperHeader walletConnected={false} address={'0x0'} />
        <ProgressBar steps={steps} stepUrls={stepUrls} currentStep={step} />
        {children}
      </div>
    </div>
  )
}
