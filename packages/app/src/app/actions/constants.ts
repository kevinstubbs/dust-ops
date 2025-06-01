// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import { Token } from '@uniswap/sdk-core'
import { base, optimism, unichain } from 'viem/chains'

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

export const QUOTER = {
  [optimism.id]: '0x1f3131a13296fb91c90870043742c3cdbff1a8d7',
  [unichain.id]: '0x333e3c607b141b18ff6de9f258db6e77fe7491e0',
  [base.id]: '0x0d5e0f971ed27fbff6c2837bf31316121532048d',
}

// Currencies and Tokens

export const WETH_TOKEN = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether')

export const USDC_TOKEN = new Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC', 'USD//C')
