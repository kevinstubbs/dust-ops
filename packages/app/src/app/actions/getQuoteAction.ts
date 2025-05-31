'use server'
import { createPublicClient, http, getContract } from 'viem'
import { foundry, mainnet } from 'viem/chains'
import { computePoolAddress } from '@uniswap/v3-sdk'
import QuoterAbi from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import IUniswapV3PoolAbi from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { POOL_FACTORY_CONTRACT_ADDRESS, QUOTER_CONTRACT_ADDRESS } from './constants'
import { fromReadableAmount, toReadableAmount } from './conversion'
import { CurrentConfig } from './config'

const client = createPublicClient({
  chain: foundry,
  transport: http(), // or your custom RPC
})

export async function getQuoteAction(amountIn: number, decimals: number, outDecimals: number): Promise<string> {
  const poolConstants = await getPoolConstants()

  const quotedAmountOut = await client.readContract({
    address: QUOTER_CONTRACT_ADDRESS,
    abi: QuoterAbi.abi,
    functionName: 'quoteExactInputSingle',
    args: [
      poolConstants.token0,
      poolConstants.token1,
      poolConstants.fee,
      fromReadableAmount(amountIn, decimals).toString(),
      0,
    ],
  })

  console.log({ quotedAmountOut, outDecimals })
  return toReadableAmount(quotedAmountOut as any, outDecimals)
}

async function getPoolConstants(): Promise<{
  token0: `0x${string}`
  token1: `0x${string}`
  fee: number
}> {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  })

  const poolContract = getContract({
    address: currentPoolAddress as any,
    abi: IUniswapV3PoolAbi.abi,
    client,
  })

  const [token0, token1, fee] = await Promise.all<any>([
    poolContract.read.token0(),
    poolContract.read.token1(),
    poolContract.read.fee(),
  ])

  return { token0, token1, fee }
}
