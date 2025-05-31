import { NextRequest, NextResponse } from 'next/server'

type TokenRequest = {
  contractAddress: string
  name: string
  chain: string
}

// Chain mapping for CoinGecko API
const CHAIN_MAPPING = {
  'base': 'base',
  'optimism': 'optimistic-ethereum',
  'mainnet': 'ethereum',
  'ethereum': 'ethereum'
}

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  try {
    const tokens: TokenRequest[] = await request.json()

    if (!Array.isArray(tokens)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Group tokens by chain to make more efficient API calls
    const tokensByChain = tokens.reduce((acc, token) => {
      const cgChain = CHAIN_MAPPING[token.chain.toLowerCase() as keyof typeof CHAIN_MAPPING]
      if (cgChain) {
        if (!acc[cgChain]) acc[cgChain] = []
        
        // Map native tokens to WETH addresses for pricing
        let priceContractAddress = token.contractAddress
        if (token.contractAddress === '0x0000000000000000000000000000000000000000') {
          switch (token.chain.toLowerCase()) {
            case 'base':
              priceContractAddress = '0x4200000000000000000000000000000000000006'
              break
            case 'optimism':
              priceContractAddress = '0x4200000000000000000000000000000000000006'
              break
            case 'mainnet':
            case 'ethereum':
              priceContractAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
              break
          }
        }
        
        acc[cgChain].push({
          ...token,
          priceContractAddress
        })
      }
      return acc
    }, {} as Record<string, Array<TokenRequest & { priceContractAddress: string }>>)

    const allResults = []
    const chainEntries = Object.entries(tokensByChain)

    // Process each chain with delays to avoid rate limiting
    for (let i = 0; i < chainEntries.length; i++) {
      const [cgChain, chainTokens] = chainEntries[i]
      
      // Add delay between chains (except for the first one)
      if (i > 0) {
        await delay(1000) // 1 second delay between chains
      }
      
      try {
        // Batch request for all tokens on this chain using their price contract addresses
        const contractAddresses = chainTokens.map(t => t.priceContractAddress).join(',')
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/${cgChain}?contract_addresses=${contractAddresses}&vs_currencies=usd`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) {
          console.error(`CoinGecko API error for ${cgChain}:`, response.status, response.statusText)
          
          // Handle rate limiting with longer delay
          if (response.status === 429) {
            console.log(`Rate limited for ${cgChain}, adding longer delay...`)
            await delay(5000) // 5 second delay for rate limiting
          }
          
          // Add null results for this chain
          for (const token of chainTokens) {
            allResults.push({
              contractAddress: token.contractAddress, // Use original contract address
              name: token.name,
              chain: token.chain,
              priceUSD: null,
              error: `API error: ${response.status}`
            })
          }
          continue
        }

        const data = await response.json()
        
        // Process results for each token
        for (const token of chainTokens) {
          const tokenData = data[token.priceContractAddress.toLowerCase()]
          
          if (tokenData && tokenData.usd) {
            allResults.push({
              contractAddress: token.contractAddress, // Use original contract address
              name: token.name,
              chain: token.chain,
              priceUSD: tokenData.usd
            })
          } else {
            allResults.push({
              contractAddress: token.contractAddress, // Use original contract address
              name: token.name,
              chain: token.chain,
              priceUSD: null,
              error: 'Token not found in CoinGecko'
            })
          }
        }

      } catch (error) {
        console.error(`Error getting prices for chain ${cgChain}:`, error)
        // Add error results for this chain
        for (const token of chainTokens) {
          allResults.push({
            contractAddress: token.contractAddress, // Use original contract address
            name: token.name,
            chain: token.chain,
            priceUSD: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    // Handle tokens from unsupported chains
    const unsupportedTokens = tokens.filter(token => 
      !CHAIN_MAPPING[token.chain.toLowerCase() as keyof typeof CHAIN_MAPPING]
    )
    
    for (const token of unsupportedTokens) {
      allResults.push({
        contractAddress: token.contractAddress,
        name: token.name,
        chain: token.chain,
        priceUSD: null,
        error: 'Chain not supported for pricing'
      })
    }

    return NextResponse.json(allResults)

  } catch (error) {
    console.error('Error in pricing API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 