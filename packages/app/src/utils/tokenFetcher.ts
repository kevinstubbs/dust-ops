type ApiToken = {
  balance: string
  contractAddress: string
  decimals: string
  name: string
  symbol: string
  type: string
  id?: string
}

type ApiResponse = {
  message: string
  result: ApiToken[]
  status: string
}

export type FetchedToken = {
  name: string
  balance: string
  decimals: string
  type: string
  chain: string
  contractAddress: string
}

export async function fetchTokensFromAPIs(
  address: string,
  setNumChecked: (x: number) => void,
  setTotalNumChains: (x: number) => void
): Promise<FetchedToken[]> {
  const baseUrl = `https://base.blockscout.com/api?module=account&action=tokenlist&address=${address}`
  const optimismUrl = `https://optimism.blockscout.com/api?module=account&action=tokenlist&address=${address}`
  const unichainUrl = `https://unichain.blockscout.com/api?module=account&action=tokenlist&address=${address}`

  // Native token balance URLs
  const baseBalanceUrl = `https://base.blockscout.com/api?module=account&action=balance&address=${address}`
  const optimismBalanceUrl = `https://optimism.blockscout.com/api?module=account&action=balance&address=${address}`
  const unichainBalanceUrl = `https://unichain.blockscout.com/api?module=account&action=balance&address=${address}`

  setTotalNumChains(3)

  console.log('Fetching tokens for address:', address)
  console.log('Base URL:', baseUrl)
  console.log('Optimism URL:', optimismUrl)
  console.log('Unichain URL:', unichainUrl)
  console.log('Base Balance URL:', baseBalanceUrl)
  console.log('Optimism Balance URL:', optimismBalanceUrl)
  console.log('Unichain Balance URL:', unichainBalanceUrl)

  // Configure fetch options to handle CORS
  const fetchOptions: RequestInit = {
    method: 'GET',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: window.location.origin,
    },
    credentials: 'omit',
  }

  let numChecked = 0

  try {
    const [
      baseResponse,
      optimismResponse,
      unichainResponse,
      baseBalanceResponse,
      optimismBalanceResponse,
      unichainBalanceResponse,
    ] = await Promise.allSettled([
      fetch(baseUrl, fetchOptions).then(() => setNumChecked(++numChecked)),
      fetch(optimismUrl, fetchOptions).then(() => setNumChecked(++numChecked)),
      fetch(unichainUrl, fetchOptions).then(() => setNumChecked(++numChecked)),
      fetch(baseBalanceUrl, fetchOptions),
      fetch(optimismBalanceUrl, fetchOptions),
      fetch(unichainBalanceUrl, fetchOptions),
    ])

    const tokens: FetchedToken[] = []

    // Process Base response (ERC-20 tokens)
    if (baseResponse.status === 'fulfilled' && baseResponse.value.ok) {
      try {
        const baseData: ApiResponse = await baseResponse.value.json()
        console.log('Base response:', baseData)

        if (baseData.status === '1' && baseData.result && Array.isArray(baseData.result)) {
          const baseTokens = baseData.result
            .filter((token) => token.type === 'ERC-20')
            .map((token) => ({
              name: token.name || 'Unknown Token',
              balance: token.balance,
              decimals: token.decimals,
              type: token.type,
              chain: 'Base',
              contractAddress: token.contractAddress,
            }))
          tokens.push(...baseTokens)
          console.log('Found', baseTokens.length, 'ERC-20 tokens on Base')
        } else {
          console.log('No tokens found on Base or unexpected response format')
        }
      } catch (error) {
        console.error('Error parsing Base response:', error)
      }
    } else if (baseResponse.status === 'fulfilled') {
      console.error('Base API error:', baseResponse.value.status, baseResponse.value.statusText)
    } else {
      console.error('Base request failed:', baseResponse.reason)
      if (baseResponse.reason instanceof TypeError && baseResponse.reason.message.includes('Failed to fetch')) {
        console.error('This is likely a CORS error. The API may not allow browser requests.')
      }
    }

    // Process Base native token balance
    if (baseBalanceResponse.status === 'fulfilled' && baseBalanceResponse.value.ok) {
      try {
        const baseBalanceData = await baseBalanceResponse.value.json()
        console.log('Base balance response:', baseBalanceData)

        if (baseBalanceData.status === '1' && baseBalanceData.result) {
          const balance = baseBalanceData.result
          if (balance !== '0') {
            tokens.push({
              name: 'Ether',
              balance: balance,
              decimals: '18',
              type: 'Native',
              chain: 'Base',
              contractAddress: '0x0000000000000000000000000000000000000000', // Native token placeholder
            })
            console.log('Found native ETH balance on Base:', balance)
          }
        }
      } catch (error) {
        console.error('Error parsing Base balance response:', error)
      }
    }

    // Process Optimism response (ERC-20 tokens)
    if (optimismResponse.status === 'fulfilled' && optimismResponse.value.ok) {
      try {
        const optimismData: ApiResponse = await optimismResponse.value.json()
        console.log('Optimism response:', optimismData)

        if (optimismData.status === '1' && optimismData.result && Array.isArray(optimismData.result)) {
          const optimismTokens = optimismData.result
            .filter((token) => token.type === 'ERC-20')
            .map((token) => ({
              name: token.name || 'Unknown Token',
              balance: token.balance,
              decimals: token.decimals,
              type: token.type,
              chain: 'Optimism',
              contractAddress: token.contractAddress,
            }))
          tokens.push(...optimismTokens)
          console.log('Found', optimismTokens.length, 'ERC-20 tokens on Optimism')
        } else {
          console.log('No tokens found on Optimism or unexpected response format')
        }
      } catch (error) {
        console.error('Error parsing Optimism response:', error)
      }
    } else if (optimismResponse.status === 'fulfilled') {
      console.error('Optimism API error:', optimismResponse.value.status, optimismResponse.value.statusText)
    } else {
      console.error('Optimism request failed:', optimismResponse.reason)
      if (optimismResponse.reason instanceof TypeError && optimismResponse.reason.message.includes('Failed to fetch')) {
        console.error('This is likely a CORS error. The API may not allow browser requests.')
      }
    }

    // Process Optimism native token balance
    if (optimismBalanceResponse.status === 'fulfilled' && optimismBalanceResponse.value.ok) {
      try {
        const optimismBalanceData = await optimismBalanceResponse.value.json()
        console.log('Optimism balance response:', optimismBalanceData)

        if (optimismBalanceData.status === '1' && optimismBalanceData.result) {
          const balance = optimismBalanceData.result
          if (balance !== '0') {
            tokens.push({
              name: 'Ether',
              balance: balance,
              decimals: '18',
              type: 'Native',
              chain: 'Optimism',
              contractAddress: '0x0000000000000000000000000000000000000000', // Native token placeholder
            })
            console.log('Found native ETH balance on Optimism:', balance)
          }
        }
      } catch (error) {
        console.error('Error parsing Optimism balance response:', error)
      }
    }

    // Process Unichain response (ERC-20 tokens)
    if (unichainResponse.status === 'fulfilled' && unichainResponse.value.ok) {
      try {
        const unichainData: ApiResponse = await unichainResponse.value.json()
        console.log('Unichain response:', unichainData)

        if (unichainData.status === '1' && unichainData.result && Array.isArray(unichainData.result)) {
          const unichainTokens = unichainData.result
            .filter((token) => token.type === 'ERC-20')
            .map((token) => ({
              name: token.name || 'Unknown Token',
              balance: token.balance,
              decimals: token.decimals,
              type: token.type,
              chain: 'Unichain',
              contractAddress: token.contractAddress,
            }))
          tokens.push(...unichainTokens)
          console.log('Found', unichainTokens.length, 'ERC-20 tokens on Unichain')
        } else {
          console.log('No tokens found on Unichain or unexpected response format')
        }
      } catch (error) {
        console.error('Error parsing Unichain response:', error)
      }
    } else if (unichainResponse.status === 'fulfilled') {
      console.error('Unichain API error:', unichainResponse.value.status, unichainResponse.value.statusText)
    } else {
      console.error('Unichain request failed:', unichainResponse.reason)
      if (unichainResponse.reason instanceof TypeError && unichainResponse.reason.message.includes('Failed to fetch')) {
        console.error('This is likely a CORS error. The API may not allow browser requests.')
      }
    }

    // Process Unichain native token balance
    if (unichainBalanceResponse.status === 'fulfilled' && unichainBalanceResponse.value.ok) {
      try {
        const unichainBalanceData = await unichainBalanceResponse.value.json()
        console.log('Unichain balance response:', unichainBalanceData)

        if (unichainBalanceData.status === '1' && unichainBalanceData.result) {
          const balance = unichainBalanceData.result
          if (balance !== '0') {
            tokens.push({
              name: 'Ether',
              balance: balance,
              decimals: '18',
              type: 'Native',
              chain: 'Unichain',
              contractAddress: '0x0000000000000000000000000000000000000000', // Native token placeholder
            })
            console.log('Found native ETH balance on Unichain:', balance)
          }
        }
      } catch (error) {
        console.error('Error parsing Unichain balance response:', error)
      }
    }

    console.log('Total tokens found:', tokens.length)

    // If no tokens found due to CORS errors, let's try the fallback server-side approach
    if (tokens.length === 0) {
      console.log('No tokens found via direct API calls. Trying server-side proxy...')
      return await fetchTokensViaProxy(address)
    }

    return tokens
  } catch (error) {
    console.error('Error fetching tokens:', error)
    console.log('Trying server-side proxy as fallback...')
    return await fetchTokensViaProxy(address)
  }
}

// Fallback function to use server-side proxy
async function fetchTokensViaProxy(address: string): Promise<FetchedToken[]> {
  try {
    const response = await fetch(`/api/tokens?address=${address}`)
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Server-side proxy also failed:', error)
    return []
  }
}
