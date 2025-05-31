export interface TokenPriceInfo {
  contractAddress: string
  name: string
  chain: string
  priceUSD: number | null
  error?: string
}

// Chain mapping for CoinGecko API
const CHAIN_MAPPING = {
  'base': 'base',
  'optimism': 'optimistic-ethereum',
  'mainnet': 'ethereum',
  'ethereum': 'ethereum'
}

export async function getTokenPrice(
  contractAddress: string,
  chain: string,
  tokenName: string
): Promise<TokenPriceInfo> {
  const cgChain = CHAIN_MAPPING[chain.toLowerCase() as keyof typeof CHAIN_MAPPING]
  
  if (!cgChain) {
    return {
      contractAddress,
      name: tokenName,
      chain,
      priceUSD: null,
      error: 'Chain not supported for pricing'
    }
  }

  // Handle native tokens by mapping to WETH equivalent for pricing
  let priceContractAddress = contractAddress
  if (contractAddress === '0x0000000000000000000000000000000000000000') {
    // Native token - use WETH address for pricing
    switch (chain.toLowerCase()) {
      case 'base':
        priceContractAddress = '0x4200000000000000000000000000000000000006' // WETH on Base
        break
      case 'optimism':
        priceContractAddress = '0x4200000000000000000000000000000000000006' // WETH on Optimism
        break
      case 'mainnet':
      case 'ethereum':
        priceContractAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH on Mainnet
        break
      default:
        // For unsupported chains, return null price
        return {
          contractAddress,
          name: tokenName,
          chain,
          priceUSD: null,
          error: 'Native token pricing not supported for this chain'
        }
    }
  }

  try {
    // CoinGecko API endpoint for token prices by contract address
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/${cgChain}?contract_addresses=${priceContractAddress}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const tokenData = data[priceContractAddress.toLowerCase()]
    
    if (tokenData && tokenData.usd) {
      return {
        contractAddress,
        name: tokenName,
        chain,
        priceUSD: tokenData.usd
      }
    } else {
      return {
        contractAddress,
        name: tokenName,
        chain,
        priceUSD: null,
        error: 'Token not found in CoinGecko'
      }
    }

  } catch (error) {
    console.error(`Error getting price for ${tokenName} on ${chain}:`, error)
    return {
      contractAddress,
      name: tokenName,
      chain,
      priceUSD: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getMultipleTokenPrices(
  tokens: Array<{ contractAddress: string; name: string; chain: string }>
): Promise<TokenPriceInfo[]> {
  // Skip client-side pricing and go directly to server-side due to CORS restrictions
  console.log('Using server-side pricing due to CORS restrictions')
  return await getMultipleTokenPricesServerSide(tokens)
}

async function getMultipleTokenPricesServerSide(
  tokens: Array<{ contractAddress: string; name: string; chain: string }>
): Promise<TokenPriceInfo[]> {
  try {
    const response = await fetch('/api/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokens)
    })

    if (!response.ok) {
      throw new Error(`Server API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Server-side pricing failed:', error)
    // Return empty results with errors
    return tokens.map(token => ({
      contractAddress: token.contractAddress,
      name: token.name,
      chain: token.chain,
      priceUSD: null,
      error: error instanceof Error ? error.message : 'Pricing unavailable'
    }))
  }
} 