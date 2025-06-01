'use client'

import { useEffect } from 'react'
import { getQuoteAction } from '../actions/getQuoteAction'
import { CurrentConfig } from '../actions/config'

export default function Home() {
  // Handle wallet connection
  useEffect(() => {
    getQuoteAction(CurrentConfig.tokens.amountIn, CurrentConfig.tokens.in.decimals, CurrentConfig.tokens.out.decimals)
  }, [])

  return (
    <div className='fixed inset-0 bg-dark-primary text-white overflow-auto'>
      Test
    </div>
  )
}
