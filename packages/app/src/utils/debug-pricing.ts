export async function debugBasePricing() {
  console.log('=== DEBUG: Base Pricing Analysis ===')
  
  // Test the CoinGecko endpoints directly
  const wethAddress = '0x4200000000000000000000000000000000000006' // WETH on Base
  const nativeAddress = '0x0000000000000000000000000000000000000000' // Native ETH
  
  try {
    // Test WETH price on Base via CoinGecko
    console.log('Testing WETH price on Base via CoinGecko...')
    const wethResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${wethAddress}&vs_currencies=usd`
    )
    
    if (wethResponse.ok) {
      const wethData = await wethResponse.json()
      console.log('WETH on Base (CoinGecko):', wethData)
    } else {
      console.log('WETH on Base failed:', wethResponse.status, wethResponse.statusText)
    }
    
    // Test ETH price directly via CoinGecko's main endpoint
    console.log('Testing ETH price via CoinGecko main endpoint...')
    const ethResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    
    if (ethResponse.ok) {
      const ethData = await ethResponse.json()
      console.log('ETH direct (CoinGecko):', ethData)
    } else {
      console.log('ETH direct failed:', ethResponse.status, ethResponse.statusText)
    }
    
    // Test alternative pricing sources
    console.log('Testing alternative pricing sources...')
    
    // Test CoinMarketCap (if available)
    try {
      const cmcResponse = await fetch(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || 'demo'
          }
        }
      )
      
      if (cmcResponse.ok) {
        const cmcData = await cmcResponse.json()
        console.log('ETH (CoinMarketCap):', cmcData?.data?.ETH?.quote?.USD?.price)
      }
    } catch (error) {
      console.log('CoinMarketCap not available:', error)
    }
    
    // Test 1inch API for Base pricing
    try {
      const oneInchResponse = await fetch(
        'https://api.1inch.dev/price/v1.1/8453', // Base mainnet chainId
        {
          headers: {
            'Authorization': `Bearer ${process.env.API_1INCH || 'demo'}`
          }
        }
      )
      
      if (oneInchResponse.ok) {
        const oneInchData = await oneInchResponse.json()
        console.log('Base tokens (1inch):', oneInchData)
        
        // Check for ETH or WETH in the response
        const ethPrice = oneInchData?.['0x0000000000000000000000000000000000000000'] || 
                        oneInchData?.['0x4200000000000000000000000000000000000006']
        console.log('ETH/WETH price from 1inch:', ethPrice)
      } else {
        console.log('1inch API failed:', oneInchResponse.status)
      }
    } catch (error) {
      console.log('1inch API not available:', error)
    }
    
    // Test our current server API
    console.log('Testing our current server API...')
    const testTokens = [
      {
        contractAddress: nativeAddress,
        name: 'Ether',
        chain: 'base'
      },
      {
        contractAddress: wethAddress,
        name: 'Wrapped Ether',
        chain: 'base'
      }
    ]
    
    const serverResponse = await fetch('/api/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTokens)
    })
    
    if (serverResponse.ok) {
      const serverData = await serverResponse.json()
      console.log('Our server API results:', serverData)
    } else {
      console.log('Our server API failed:', serverResponse.status)
    }
    
  } catch (error) {
    console.error('Debug pricing failed:', error)
  }
  
  console.log('=== END DEBUG ===')
}

// Alternative pricing sources to consider
export const ALTERNATIVE_PRICING_SOURCES = {
  // Direct ETH price from CoinGecko (most reliable)
  COINGECKO_DIRECT: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  
  // 1inch price API (good for DeFi prices)
  ONEINCH_BASE: 'https://api.1inch.dev/price/v1.1/8453',
  
  // Uniswap V3 pricing (on-chain)
  UNISWAP_V3: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  
  // DefiLlama API (aggregated pricing)
  DEFILLAMA: 'https://coins.llama.fi/prices/current/ethereum:0x0000000000000000000000000000000000000000',
  
  // CoinMarketCap (if we have API key)
  COINMARKETCAP: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH'
} 