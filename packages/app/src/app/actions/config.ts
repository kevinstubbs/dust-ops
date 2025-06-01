import { base, optimism, unichain } from 'viem/chains'
import { WETH_TOKEN, USDC_TOKEN } from './constants'
import { FeeAmount } from '@uniswap/v3-sdk'

export const CurrentConfig = {
  rpc: {
    local: 'http://localhost:8545',
    mainnet: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    base: `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    optimism: `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    unichain: `https://unichain-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    31337: 'http://localhost:8545',
    1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    [base.id]: `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    [optimism.id]: `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    [unichain.id]: `https://unichain-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
  },
  tokens: {
    in: USDC_TOKEN,
    amountIn: 1000,
    out: WETH_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
}
