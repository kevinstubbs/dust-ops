import { WETH_TOKEN, USDC_TOKEN } from './constants'
import { FeeAmount } from '@uniswap/v3-sdk'

export const CurrentConfig = {
  rpc: {
    local: 'http://localhost:8545',
    mainnet: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    base: `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    optimism: `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    unichain: `https://unichain-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
  },
  tokens: {
    in: USDC_TOKEN,
    amountIn: 1000,
    out: WETH_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
}
