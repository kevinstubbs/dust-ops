import { getMultipleTokenPrices } from './simplePricing'

// Test with some known tokens on Base including native ETH
const testTokens = [
  {
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    name: 'USD Coin',
    chain: 'base'
  },
  {
    contractAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
    name: 'Wrapped Ether',
    chain: 'base'
  },
  {
    contractAddress: '0x0000000000000000000000000000000000000000', // Native ETH on Base
    name: 'Ether',
    chain: 'base'
  },
  {
    contractAddress: '0x0000000000000000000000000000000000000000', // Native ETH on Optimism
    name: 'Ether',
    chain: 'optimism'
  }
]

export async function testPricing() {
  console.log('Testing pricing functionality with native tokens...')
  try {
    const results = await getMultipleTokenPrices(testTokens)
    console.log('Pricing results:', results)
    
    // Verify native tokens get the same price as WETH
    const baseNativeETH = results.find(r => r.contractAddress === '0x0000000000000000000000000000000000000000' && r.chain === 'base')
    const baseWETH = results.find(r => r.contractAddress === '0x4200000000000000000000000000000000000006' && r.chain === 'base')
    
    if (baseNativeETH && baseWETH) {
      console.log('Base Native ETH price:', baseNativeETH.priceUSD)
      console.log('Base WETH price:', baseWETH.priceUSD)
      console.log('Prices match:', baseNativeETH.priceUSD === baseWETH.priceUSD)
    }
    
    return results
  } catch (error) {
    console.error('Pricing test failed:', error)
    return null
  }
} 