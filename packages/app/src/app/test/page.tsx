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
    <div className='fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-auto'>
      Test
    </div>
  )
}
