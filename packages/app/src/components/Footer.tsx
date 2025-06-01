'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NetworkStatus } from './NetworkStatus'

export function Footer() {
  const pathname = usePathname()
  const isFirstScreen = pathname === '/'

  return (
    <>
     

      <footer className='sticky top-[100vh] footer flex justify-center items-center bg-transparent text-white p-4'>
        <p className='font-tanklager text-center'>
          {isFirstScreen 
            ? 'Built with <3 at ETHGlobal Prague 2025 - One Click. No Echo.'
            : '/DUST.OPS'
          }
        </p>
      </footer>
    </>
  )
}
