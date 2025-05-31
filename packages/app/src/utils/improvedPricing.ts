export interface TokenPriceInfo {
  contractAddress: string
  name: string
  chain: string
  priceUSD: number | null
  error?: string
  source?: string
}

interface ChainConfig {
  coingeckoId: string
  chainId: number
  nativeToken: string
  wethAddress: string
  oneInchSupported: boolean
}

// Enhanced chain mapping with more accurate configurations
const ENHANCED_CHAIN_CONFIG: Record<string, ChainConfig> = {
  'base': {
    coingeckoId: 'base',
    chainId: 8453,
    nativeToken: 'ETH',
    wethAddress: '0x4200000000000000000000000000000000000006',
    oneInchSupported: true
  },
  'optimism': {
    coingeckoId: 'optimistic-ethereum',
    chainId: 10,
    nativeToken: 'ETH',
    wethAddress: '0x4200000000000000000000000000000000000006',
    oneInchSupported: true
  },
  'ethereum': {
    coingeckoId: 'ethereum',
    chainId: 1,
    nativeToken: 'ETH',
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    oneInchSupported: true
  },
  'mainnet': {
    coingeckoId: 'ethereum',
    chainId: 1,
    nativeToken: 'ETH',
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    oneInchSupported: true
  }
}

// Multiple pricing sources for better reliability
async function getETHPriceFromCoinGecko(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=false',
      {
        headers: { 'Accept': 'application/json' }
      }
    )
    
    if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`)
    
    const data = await response.json()
    return data?.ethereum?.usd || null
  } catch (error) {
    console.error('CoinGecko ETH price failed:', error)
    return null
  }
}

async function getETHPriceFromDefiLlama(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://coins.llama.fi/prices/current/ethereum:0x0000000000000000000000000000000000000000',
      {
        headers: { 'Accept': 'application/json' }
      }
    )
    
    if (!response.ok) throw new Error(`DefiLlama HTTP ${response.status}`)
    
    const data = await response.json()
    return data?.coins?.['ethereum:0x0000000000000000000000000000000000000000']?.price || null
  } catch (error) {
    console.error('DefiLlama ETH price failed:', error)
    return null
  }
}

async function get1InchPrice(chainId: number, tokenAddress: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.1inch.dev/price/v1.1/${chainId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_1INCH || ''}`,
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) throw new Error(`1inch HTTP ${response.status}`)
    
    const data = await response.json()
    return data?.[tokenAddress.toLowerCase()] || null
  } catch (error) {
    console.error('1inch price failed:', error)
    return null
  }
}

async function getTokenPriceFromCoinGecko(
  contractAddress: string,
  chainConfig: ChainConfig
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/${chainConfig.coingeckoId}?contract_addresses=${contractAddress}&vs_currencies=usd`,
      {
        headers: { 'Accept': 'application/json' }
      }
    )
    
    if (!response.ok) throw new Error(`CoinGecko token HTTP ${response.status}`)
    
    const data = await response.json()
    return data?.[contractAddress.toLowerCase()]?.usd || null
  } catch (error) {
    console.error('CoinGecko token price failed:', error)
    return null
  }
}

export async function getImprovedTokenPrice(
  contractAddress: string,
  chain: string,
  tokenName: string
): Promise<TokenPriceInfo> {
  const chainConfig = ENHANCED_CHAIN_CONFIG[chain.toLowerCase() as keyof typeof ENHANCED_CHAIN_CONFIG]
  
  if (!chainConfig) {
    return {
      contractAddress,
      name: tokenName,
      chain,
      priceUSD: null,
      error: 'Chain not supported for pricing'
    }
  }

  const isNativeToken = contractAddress === '0x0000000000000000000000000000000000000000'
  
  if (isNativeToken && chainConfig.nativeToken === 'ETH') {
    // For native ETH, use multiple sources for best accuracy
    console.log(`Getting native ETH price for ${chain}...`)
    
    // Try multiple sources in parallel for speed
    const [cgPrice, llamaPrice, oneInchPrice] = await Promise.allSettled([
      getETHPriceFromCoinGecko(),
      getETHPriceFromDefiLlama(),
      chainConfig.oneInchSupported ? get1InchPrice(chainConfig.chainId, '0x0000000000000000000000000000000000000000') : null
    ])
    
    // Extract successful results
    const prices: { price: number; source: string }[] = []
    
    if (cgPrice.status === 'fulfilled' && cgPrice.value !== null) {
      prices.push({ price: cgPrice.value, source: 'CoinGecko Direct' })
    }
    
    if (llamaPrice.status === 'fulfilled' && llamaPrice.value !== null) {
      prices.push({ price: llamaPrice.value, source: 'DefiLlama' })
    }
    
    if (oneInchPrice.status === 'fulfilled' && oneInchPrice.value !== null) {
      prices.push({ price: oneInchPrice.value, source: '1inch' })
    }
    
    if (prices.length === 0) {
      // Fallback: try WETH price from CoinGecko
      console.log(`No direct ETH price found, trying WETH on ${chain}...`)
      const wethPrice = await getTokenPriceFromCoinGecko(chainConfig.wethAddress, chainConfig)
      
      if (wethPrice !== null) {
        return {
          contractAddress,
          name: tokenName,
          chain,
          priceUSD: wethPrice,
          source: 'CoinGecko WETH Fallback'
        }
      }
      
      return {
        contractAddress,
        name: tokenName,
        chain,
        priceUSD: null,
        error: 'No pricing sources available for ETH'
      }
    }
    
    // Use the median price for better accuracy
    prices.sort((a, b) => a.price - b.price)
    const medianPrice = prices[Math.floor(prices.length / 2)].price
    const sources = prices.map(p => p.source).join(', ')
    
    console.log(`ETH prices found: ${prices.map(p => `${p.source}: $${p.price}`).join(', ')}`)
    console.log(`Using median price: $${medianPrice}`)
    
    return {
      contractAddress,
      name: tokenName,
      chain,
      priceUSD: medianPrice,
      source: `Median of: ${sources}`
    }
  } else {
    // For ERC-20 tokens, try CoinGecko first, then 1inch
    console.log(`Getting ERC-20 token price for ${tokenName} on ${chain}...`)
    
    const [cgPrice, oneInchPrice] = await Promise.allSettled([
      getTokenPriceFromCoinGecko(contractAddress, chainConfig),
      chainConfig.oneInchSupported ? get1InchPrice(chainConfig.chainId, contractAddress) : null
    ])
    
    if (cgPrice.status === 'fulfilled' && cgPrice.value !== null) {
      return {
        contractAddress,
        name: tokenName,
        chain,
        priceUSD: cgPrice.value,
        source: 'CoinGecko'
      }
    }
    
    if (oneInchPrice.status === 'fulfilled' && oneInchPrice.value !== null) {
      return {
        contractAddress,
        name: tokenName,
        chain,
        priceUSD: oneInchPrice.value,
        source: '1inch'
      }
    }
    
    return {
      contractAddress,
      name: tokenName,
      chain,
      priceUSD: null,
      error: 'Token not found in pricing sources'
    }
  }
}

export async function getImprovedMultipleTokenPrices(
  tokens: Array<{ contractAddress: string; name: string; chain: string }>
): Promise<TokenPriceInfo[]> {
  console.log('Using improved pricing system...')
  
  // Group tokens by type for more efficient processing
  const ethTokens = tokens.filter(t => t.contractAddress === '0x0000000000000000000000000000000000000000')
  const erc20Tokens = tokens.filter(t => t.contractAddress !== '0x0000000000000000000000000000000000000000')
  
  const results: TokenPriceInfo[] = []
  
  // Get ETH price once and reuse for all native tokens
  if (ethTokens.length > 0) {
    console.log(`Processing ${ethTokens.length} native ETH tokens...`)
    
    // Get a single ETH price to use for all chains
    const [cgPrice, llamaPrice] = await Promise.allSettled([
      getETHPriceFromCoinGecko(),
      getETHPriceFromDefiLlama()
    ])
    
    let ethPrice: number | null = null
    let ethSource = ''
    
    if (cgPrice.status === 'fulfilled' && cgPrice.value !== null) {
      ethPrice = cgPrice.value
      ethSource = 'CoinGecko Direct'
    } else if (llamaPrice.status === 'fulfilled' && llamaPrice.value !== null) {
      ethPrice = llamaPrice.value
      ethSource = 'DefiLlama'
    }
    
    // Apply the same ETH price to all native tokens
    for (const token of ethTokens) {
      if (ethPrice !== null) {
        results.push({
          contractAddress: token.contractAddress,
          name: token.name,
          chain: token.chain,
          priceUSD: ethPrice,
          source: ethSource
        })
      } else {
        // Fallback to individual token pricing
        results.push(await getImprovedTokenPrice(token.contractAddress, token.chain, token.name))
      }
    }
  }
  
  // Process ERC-20 tokens individually
  if (erc20Tokens.length > 0) {
    console.log(`Processing ${erc20Tokens.length} ERC-20 tokens...`)
    
    const erc20Results = await Promise.allSettled(
      erc20Tokens.map(token => 
        getImprovedTokenPrice(token.contractAddress, token.chain, token.name)
      )
    )
    
    for (const result of erc20Results) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }
  }
  
  return results
} 