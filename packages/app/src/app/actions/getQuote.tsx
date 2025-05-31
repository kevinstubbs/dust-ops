// quote-uniswap.js
import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'
import { Token, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Pool, Route, Trade } from '@uniswap/v3-sdk'

// 1. Setup Viem Public Client (Infura, Alchemy, or public RPC)
const client = createPublicClient({
  chain: mainnet,
  transport: http(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`),
})

// 2. Token definitions
const USDC = new Token(1, '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC', 'USD Coin')
const WETH = new Token(1, '0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether')

// 3. Uniswap V3 pool contract address (USDC/WETH 0.3%)
const poolAddress = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'

// 4. ABI fragments for slot0, fee, liquidity
const abi = parseAbi([
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() view returns (uint128)',
  'function fee() view returns (uint24)',
])

export async function getQuote(inputAmountRaw: string, slippageBips: number) {
  // 5. Read pool state
  const [slot0, liquidity, fee] = await Promise.all([
    client.readContract({ address: poolAddress, abi, functionName: 'slot0' }),
    client.readContract({ address: poolAddress, abi, functionName: 'liquidity' }),
    client.readContract({ address: poolAddress, abi, functionName: 'fee' }),
  ])

  // 6. Construct pool object
  const pool = new Pool(USDC, WETH, fee, slot0.sqrtPriceX96.toString(), liquidity.toString(), slot0.tick)

  // 7. Prepare trade
  const inputAmount = CurrencyAmount.fromRawAmount(USDC, inputAmountRaw)
  const route = new Route([pool], USDC, WETH)
  const trade = await Trade.exactIn(route, inputAmount)
  const slippage = new Percent(slippageBips, 10_000)
  const minOut = trade.minimumAmountOut(slippage)

  // 8. Output
  console.log(`💱 Quoting ${inputAmount.toExact()} ${USDC.symbol} → ${WETH.symbol}`)
  console.log(`Estimated output: ${trade.outputAmount.toExact()} ${WETH.symbol}`)
  console.log(`Minimum output with ${slippage.toSignificant(3)}% slippage: ${minOut.toExact()} ${WETH.symbol}`)
}
