import { getMultipleTokenPrices } from './simplePricing'
import { getImprovedMultipleTokenPrices } from './improvedPricing'

export async function comparePricingSources() {
  console.log('=== Pricing Source Comparison ===')
  
  const testTokens = [
    {
      contractAddress: '0x0000000000000000000000000000000000000000', // Native ETH on Base
      name: 'Ether',
      chain: 'base'
    },
    {
      contractAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
      name: 'Wrapped Ether',
      chain: 'base'
    },
    {
      contractAddress: '0x0000000000000000000000000000000000000000', // Native ETH on Optimism
      name: 'Ether',
      chain: 'optimism'
    },
    {
      contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base for comparison
      name: 'USD Coin',
      chain: 'base'
    }
  ]
  
  console.log('Testing tokens:', testTokens)
  
  try {
    // Test current pricing system
    console.log('\n--- Current Pricing System ---')
    const currentResults = await getMultipleTokenPrices(testTokens)
    currentResults.forEach(result => {
      console.log(`${result.name} on ${result.chain}: $${result.priceUSD} ${result.error ? `(Error: ${result.error})` : ''}`)
    })
    
    // Test improved pricing system
    console.log('\n--- Improved Pricing System ---')
    const improvedResults = await getImprovedMultipleTokenPrices(testTokens)
    improvedResults.forEach(result => {
      console.log(`${result.name} on ${result.chain}: $${result.priceUSD} ${result.source ? `(Source: ${result.source})` : ''} ${result.error ? `(Error: ${result.error})` : ''}`)
    })
    
    // Compare results
    console.log('\n--- Price Comparison ---')
    for (const token of testTokens) {
      const current = currentResults.find(r => 
        r.contractAddress === token.contractAddress && r.chain === token.chain
      )
      const improved = improvedResults.find(r => 
        r.contractAddress === token.contractAddress && r.chain === token.chain
      )
      
      if (current && improved && current.priceUSD && improved.priceUSD) {
        const difference = Math.abs(current.priceUSD - improved.priceUSD)
        const percentDiff = (difference / current.priceUSD) * 100
        
        console.log(`${token.name} on ${token.chain}:`)
        console.log(`  Current: $${current.priceUSD}`)
        console.log(`  Improved: $${improved.priceUSD} (${improved.source})`)
        console.log(`  Difference: $${difference.toFixed(2)} (${percentDiff.toFixed(2)}%)`)
        
        if (percentDiff > 1) {
          console.log(`  ⚠️  Significant price difference detected!`)
        }
        console.log('')
      }
    }
    
    return { currentResults, improvedResults }
    
  } catch (error) {
    console.error('Pricing comparison failed:', error)
    return null
  }
}

// Test specific ETH pricing sources directly
export async function testETHPricingSources() {
  console.log('=== Testing ETH Pricing Sources Directly ===')
  
  try {
    // CoinGecko direct ETH price
    console.log('Testing CoinGecko direct ETH price...')
    const cgResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    if (cgResponse.ok) {
      const cgData = await cgResponse.json()
      console.log('CoinGecko ETH direct:', cgData?.ethereum?.usd)
    }
    
    // CoinGecko WETH on Base
    console.log('Testing CoinGecko WETH on Base...')
    const wethResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=0x4200000000000000000000000000000000000006&vs_currencies=usd'
    )
    if (wethResponse.ok) {
      const wethData = await wethResponse.json()
      console.log('CoinGecko WETH on Base:', wethData?.['0x4200000000000000000000000000000000000006']?.usd)
    }
    
    // DefiLlama ETH price
    console.log('Testing DefiLlama ETH price...')
    const llamaResponse = await fetch(
      'https://coins.llama.fi/prices/current/ethereum:0x0000000000000000000000000000000000000000'
    )
    if (llamaResponse.ok) {
      const llamaData = await llamaResponse.json()
      console.log('DefiLlama ETH:', llamaData?.coins?.['ethereum:0x0000000000000000000000000000000000000000']?.price)
    }
    
    // 1inch Base pricing (if available)
    console.log('Testing 1inch Base pricing...')
    try {
      const oneInchResponse = await fetch(
        'https://api.1inch.dev/price/v1.1/8453',
        {
          headers: {
            'Authorization': `Bearer ${process.env.API_1INCH || ''}`
          }
        }
      )
      if (oneInchResponse.ok) {
        const oneInchData = await oneInchResponse.json()
        console.log('1inch Base ETH:', oneInchData?.['0x0000000000000000000000000000000000000000'])
        console.log('1inch Base WETH:', oneInchData?.['0x4200000000000000000000000000000000000006'])
      }
    } catch (error) {
      console.log('1inch not available:', error)
    }
    
  } catch (error) {
    console.error('ETH pricing sources test failed:', error)
  }
} 