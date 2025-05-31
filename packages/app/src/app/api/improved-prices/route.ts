import { NextRequest, NextResponse } from 'next/server'
import { getImprovedMultipleTokenPrices } from '@/utils/improvedPricing'

interface TokenRequest {
  contractAddress: string
  name: string
  chain: string
}

export async function POST(request: NextRequest) {
  try {
    const tokens: TokenRequest[] = await request.json()

    if (!Array.isArray(tokens)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    console.log(`Processing ${tokens.length} tokens with improved pricing...`)
    
    const results = await getImprovedMultipleTokenPrices(tokens)
    
    console.log(`Improved pricing completed: ${results.length} results`)
    return NextResponse.json(results)

  } catch (error) {
    console.error('Error in improved pricing API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 