'use server'

import axios from 'axios'
import Redis from 'ioredis'

type TokenBalance = {
  token: {
    address: string
    address_hash: string
    circulating_market_cap: number | null
    decimals: string
    exchange_rate: number | null
    holders: string
    holders_count: string
    icon_url: string | null
    name: string
    symbol: string
    total_supply: string
    type: string
    volume_24h: number | null
  }
  token_id: string | null
  token_instance: unknown | null
  value: string
}

type ChainInfo = {
  chainId: number
  url: string
}

const chains: ChainInfo[] = [
  // { chainId: 1, url: 'https://eth.blockscout.com' }, // Ethereum Mainnet
  // { chainId: 30, url: 'https://rootstock.blockscout.com' }, // Rootstock Mainnet
  // { chainId: 137, url: 'https://polygon.blockscout.com' }, // Polygon Mainnet
  // { chainId: 31223, url: 'https://evm.flowscan.io' }, // Flow EVM Mainnet (unofficial chain ID)

  { chainId: 31, url: 'https://rootstock-testnet.blockscout.com' }, // Rootstock Testnet
  // { chainId: 31224, url: 'https://evm-testnet.flowscan.io' }, // Flow EVM Testnet (unofficial)
  { chainId: 11155111, url: 'https://eth-sepolia.blockscout.com' }, // Ethereum Sepolia Testnet
]

// TODO: Simple cache on Redis with short TTL.
export async function getTokenHoldings(address: `0x${string}`): Promise<unknown[]> {
  const fetchPromises = chains.map(async ({ chainId, url }) => {
    try {
      const apiUrl = `${url}/api/v2/addresses/${address}/token-balances`
      const [response, prices] = await Promise.all([fetch(apiUrl), getSpotPrices(chainId)])
      if (!response.ok) {
        throw new Error(`HTTP error from chain ${chainId}! status: ${response.status}`)
      }
      const data: TokenBalance[] = await response.json()
      return {
        chainId,
        status: 'fulfilled',
        data: data.map((x) => ({
          ...x,
          usdRatio: prices?.[x.token.address] || 0,
          usdVal: prices?.[x.token.address]
            ? prices[x.token.address] * (parseFloat(x.value) / Math.pow(10, parseInt(x.token.decimals, 10)))
            : 0,
        })),
      }
    } catch (error) {
      console.error(`Error fetching from chain ${chainId}:`, error)
      return { chainId, status: 'rejected', error: (error as Error).message }
    }
  })

  const results = await Promise.allSettled(fetchPromises)
  // Flatten the array of arrays into a single array of TokenBalance
  return results
}

async function getSpotPrices(chainId: number, currency = 'USD') {
  const client = new Redis(process.env.REDIS_CONNSTR!)

  const cacheKey = `${chainId}_${currency}x`
  const cachedResult = await client.get(cacheKey)

  if (cachedResult) return JSON.parse(cachedResult)

  const url = `https://api.1inch.dev/price/v1.1/${chainId}`

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.API_1INCH}`,
    },
    params: {
      currency,
    },
    paramsSerializer: {
      indexes: null,
    },
  }

  try {
    const response = await axios.get(url, config)
    const result = response.data
    const expirationSeconds = 120
    await client.set(cacheKey, JSON.stringify(result), 'EX', expirationSeconds)
    return result
  } catch (error) {
    console.error(error)
    return {}
  }
}
