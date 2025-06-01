import { Token } from '@/atoms/walletAtoms'
import { TokenPriceInfo } from '@/utils/simplePricing'
import { FetchedToken } from '@/utils/tokenFetcher'

// Convert fetched tokens to Token format with pricing
export function convertFetchedTokensToTokens(fetchedTokens: FetchedToken[], priceData?: TokenPriceInfo[]): Token[] {
  return fetchedTokens
    .map((token, index) => {
      // Calculate display balance with decimals
      const rawBalance = parseFloat(token.balance) || 0
      const decimals = parseInt(token.decimals) || 18
      const displayBalance = rawBalance / Math.pow(10, decimals)

      // Find price for this token
      const priceInfo = priceData?.find(
        (p) =>
          p.contractAddress.toLowerCase() === token.contractAddress.toLowerCase() &&
          p.chain.toLowerCase() === token.chain.toLowerCase()
      )

      const priceUSD = priceInfo?.priceUSD || 0
      const totalValue = displayBalance * priceUSD

      // Handle symbol and name for native vs ERC-20 tokens
      let symbol: string
      let name: string

      if (token.type === 'Native') {
        symbol = 'ETH'
        name = `Ether (${token.chain})`
      } else {
        // Create a better symbol from the token name for ERC-20 tokens
        symbol = token.name
          ? token.name
              .split(' ')
              .map((word) => word.charAt(0))
              .join('')
              .substring(0, 6)
              .toUpperCase()
          : 'UNKNOWN'
        name = token.name || 'Unknown Token'
      }

      return {
        id: index + 1,
        symbol: symbol,
        name: name,
        chain: token.chain,
        balance: displayBalance.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6,
        }),
        value:
          totalValue > 0
            ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '$0.00',
        liquid: displayBalance > 0, // Only consider tokens with balance as liquid
        selected: displayBalance > 0 && totalValue > 0.01, // Only auto-select tokens with balance > $0.01
      }
    })
    .filter((token) => parseFloat(token.balance.replace(/,/g, '')) > 0) // Filter out zero balance tokens
}
