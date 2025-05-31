import { NextRequest, NextResponse } from 'next/server'

type ApiToken = {
  balance: string
  contractAddress: string
  decimals: string
  name: string
  symbol: string
  type: string
  id?: string
}

type ApiResponse = {
  message: string
  result: ApiToken[]
  status: string
}

type FetchedToken = {
  name: string
  balance: string
  decimals: string
  type: string
  chain: string
  contractAddress: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
  }

  const baseUrl = `https://base.blockscout.com/api?module=account&action=tokenlist&address=${address}`
  const optimismUrl = `https://optimism.blockscout.com/api?module=account&action=tokenlist&address=${address}`
  const unichainUrl = `https://unichain.blockscout.com/api?module=account&action=tokenlist&address=${address}`
  
  // Native token balance URLs
  const baseBalanceUrl = `https://base.blockscout.com/api?module=account&action=balance&address=${address}`
  const optimismBalanceUrl = `https://optimism.blockscout.com/api?module=account&action=balance&address=${address}`
  const unichainBalanceUrl = `https://unichain.blockscout.com/api?module=account&action=balance&address=${address}`

  try {
    const [
      baseResponse, 
      optimismResponse, 
      unichainResponse,
      baseBalanceResponse,
      optimismBalanceResponse,
      unichainBalanceResponse
    ] = await Promise.allSettled([
      fetch(baseUrl),
      fetch(optimismUrl),
      fetch(unichainUrl),
      fetch(baseBalanceUrl),
      fetch(optimismBalanceUrl),
      fetch(unichainBalanceUrl)
    ])

    const tokens: FetchedToken[] = []

    // Process Base response (ERC-20 tokens)
    if (baseResponse.status === 'fulfilled' && baseResponse.value.ok) {
      try {
        const baseData: ApiResponse = await baseResponse.value.json()
        console.log('Server: Base response:', baseData)
        
        if (baseData.status === '1' && baseData.result && Array.isArray(baseData.result)) {
          const baseTokens = baseData.result
            .filter(token => token.type === 'ERC-20')
            .map(token => ({
              name: token.name || 'Unknown Token',
              balance: token.balance,
              decimals: token.decimals,
              type: token.type,
              chain: 'Base',
              contractAddress: token.contractAddress
            }))
          tokens.push(...baseTokens)
          console.log('Server: Found', baseTokens.length, 'ERC-20 tokens on Base')
        }
      } catch (error) {
        console.error('Server: Error parsing Base response:', error)
      }
    }

    // Process Base native token balance
    if (baseBalanceResponse.status === 'fulfilled' && baseBalanceResponse.value.ok) {
      try {
        const baseBalanceData = await baseBalanceResponse.value.json()
        console.log('Server: Base balance response:', baseBalanceData)
        
        if (baseBalanceData.status === '1' && baseBalanceData.result) {
          const balance = baseBalanceData.result
          if (balance !== '0') {
            tokens.push({
              name: 'Ether',
              balance: balance,
              decimals: '18',
              type: 'Native',
              chain: 'Base',
              contractAddress: '0x0000000000000000000000000000000000000000'
            })
            console.log('Server: Found native ETH balance on Base:', balance)
          }
        }
      } catch (error) {
        console.error('Server: Error parsing Base balance response:', error)
      }
    }

    // Process Optimism response (ERC-20 tokens)
    if (optimismResponse.status === 'fulfilled' && optimismResponse.value.ok) {
      try {
        const optimismData: ApiResponse = await optimismResponse.value.json()
        console.log('Server: Optimism response:', optimismData)
        
        if (optimismData.status === '1' && optimismData.result && Array.isArray(optimismData.result)) {
          const optimismTokens = optimismData.result
            .filter(token => token.type === 'ERC-20')
            .map(token => ({
              name: token.name || 'Unknown Token',
              balance: token.balance,
              decimals: token.decimals,
              type: token.type,
              chain: 'Optimism',
              contractAddress: token.contractAddress
            }))
          tokens.push(...optimismTokens)
          console.log('Server: Found', optimismTokens.length, 'ERC-20 tokens on Optimism')
        }
      } catch (error) {
        console.error('Server: Error parsing Optimism response:', error)
      }
    }

    // Process Optimism native token balance
    if (optimismBalanceResponse.status === 'fulfilled' && optimismBalanceResponse.value.ok) {
      try {
        const optimismBalanceData = await optimismBalanceResponse.value.json()
        console.log('Server: Optimism balance response:', optimismBalanceData)
        
        if (optimismBalanceData.status === '1' && optimismBalanceData.result) {
          const balance = optimismBalanceData.result
          if (balance !== '0') {
            tokens.push({
              name: 'Ether',
              balance: balance,
              decimals: '18',
              type: 'Native',
              chain: 'Optimism',
              contractAddress: '0x0000000000000000000000000000000000000000'
            })
            console.log('Server: Found native ETH balance on Optimism:', balance)
          }
        }
      } catch (error) {
        console.error('Server: Error parsing Optimism balance response:', error)
      }
    }

    // Process Unichain response (ERC-20 tokens)
    if (unichainResponse.status === 'fulfilled' && unichainResponse.value.ok) {
      try {
        const unichainData: ApiResponse = await unichainResponse.value.json()
        console.log('Server: Unichain response:', unichainData)
        
        if (unichainData.status === '1' && unichainData.result && Array.isArray(unichainData.result)) {
          const unichainTokens = unichainData.result
            .filter(token => token.type === 'ERC-20')
            .map(token => ({
              name: token.name || 'Unknown Token',
              balance: token.balance,
              decimals: token.decimals,
              type: token.type,
              chain: 'Unichain',
              contractAddress: token.contractAddress
            }))
          tokens.push(...unichainTokens)
          console.log('Server: Found', unichainTokens.length, 'ERC-20 tokens on Unichain')
        }
      } catch (error) {
        console.error('Server: Error parsing Unichain response:', error)
      }
    }

    // Process Unichain native token balance
    if (unichainBalanceResponse.status === 'fulfilled' && unichainBalanceResponse.value.ok) {
      try {
        const unichainBalanceData = await unichainBalanceResponse.value.json()
        console.log('Server: Unichain balance response:', unichainBalanceData)
        
        if (unichainBalanceData.status === '1' && unichainBalanceData.result) {
          const balance = unichainBalanceData.result
          if (balance !== '0') {
            tokens.push({
              name: 'Ether',
              balance: balance,
              decimals: '18',
              type: 'Native',
              chain: 'Unichain',
              contractAddress: '0x0000000000000000000000000000000000000000'
            })
            console.log('Server: Found native ETH balance on Unichain:', balance)
          }
        }
      } catch (error) {
        console.error('Server: Error parsing Unichain balance response:', error)
      }
    }

    console.log('Server: Total tokens found:', tokens.length)
    
    return NextResponse.json(tokens, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Server: Error fetching tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 