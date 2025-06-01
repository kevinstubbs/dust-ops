'use client'

import { stepAtom } from '@/atoms/walletAtoms'
import { ProgressBar } from '@/components/sweeper/ProgressBar'
import { SweeperHeader } from '@/components/sweeper/SweeperHeader'
import { useAtomValue } from 'jotai'
import { PropsWithChildren, useEffect } from 'react'

const steps = ['Connect Wallet', 'Scan Holdings', 'Select Tokens', 'Review & Sweep', 'Privacy Deposit', 'Completion']
const stepUrls = ['/', 'scan-holdings', 'select-tokens', 'review', 'privacy-deposit', 'completion']

export default function Layout({ children }: PropsWithChildren) {
  const step = useAtomValue(stepAtom)
  
  // Apply background class and prevent scrolling on first screen
  useEffect(() => {
    if (step === 0) {
      document.body.classList.add('first-screen-bg')
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('first-screen-bg')
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('first-screen-bg')
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
  }, [step])

  return (
    <div className={`fixed inset-0 text-white ${step === 0 ? 'overflow-hidden' : 'overflow-auto bg-dark-primary'}`}>
      <div className='max-w-6xl mx-auto px-6 pb-12'>
        {step !== 0 && <SweeperHeader walletConnected={false} address={'0x0'} />}
        {step !== 0 && <ProgressBar steps={steps} stepUrls={stepUrls} currentStep={step} />}
        {children}
      </div>
    </div>
  )
}
