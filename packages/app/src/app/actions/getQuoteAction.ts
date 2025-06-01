import {
  Account,
  createPublicClient,
  //  createPublicClient, http, extractChain,
  encodeAbiParameters,
  encodePacked,
  extractChain,
  http,
} from 'viem'
import { base, mainnet, optimism, unichain } from 'viem/chains'
// import { base, mainnet, optimism, unichain } from 'viem/chains'
// import { FeeAmount } from '@uniswap/v4-sdk'
// import QuoterAbi from '@uniswap/v4-periphery'
// import IUniswapV3PoolAbi from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
// import { QUOTER } from './constants'
// import { fromReadableAmount, toReadableAmount } from './conversion'

const UNIVERSAL_ROUTER_ADDRESS = {
  [unichain.id]: '0xef740bf23acae26f6492b10de645d6b98dc8eaf3',
  [base.id]: '0x6ff5693b99212da76ad316178a184ab56d299b43',
  [optimism.id]: '0x851116d9223fabed8e56c0e6b8ad0c31d98b3507',
}

// Router ABI
const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'permit2', type: 'address' },
          { internalType: 'address', name: 'weth9', type: 'address' },
          { internalType: 'address', name: 'v2Factory', type: 'address' },
          { internalType: 'address', name: 'v3Factory', type: 'address' },
          { internalType: 'bytes32', name: 'pairInitCodeHash', type: 'bytes32' },
          { internalType: 'bytes32', name: 'poolInitCodeHash', type: 'bytes32' },
          { internalType: 'address', name: 'v4PoolManager', type: 'address' },
          { internalType: 'address', name: 'v3NFTPositionManager', type: 'address' },
          { internalType: 'address', name: 'v4PositionManager', type: 'address' },
        ],
        internalType: 'struct RouterParameters',
        name: 'params',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'BalanceTooLow', type: 'error' },
  { inputs: [], name: 'ContractLocked', type: 'error' },
  {
    inputs: [{ internalType: 'Currency', name: 'currency', type: 'address' }],
    name: 'DeltaNotNegative',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'Currency', name: 'currency', type: 'address' }],
    name: 'DeltaNotPositive',
    type: 'error',
  },
  { inputs: [], name: 'ETHNotAccepted', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'commandIndex', type: 'uint256' },
      { internalType: 'bytes', name: 'message', type: 'bytes' },
    ],
    name: 'ExecutionFailed',
    type: 'error',
  },
  { inputs: [], name: 'FromAddressIsNotOwner', type: 'error' },
  { inputs: [], name: 'InputLengthMismatch', type: 'error' },
  { inputs: [], name: 'InsufficientBalance', type: 'error' },
  { inputs: [], name: 'InsufficientETH', type: 'error' },
  { inputs: [], name: 'InsufficientToken', type: 'error' },
  { inputs: [{ internalType: 'bytes4', name: 'action', type: 'bytes4' }], name: 'InvalidAction', type: 'error' },
  { inputs: [], name: 'InvalidBips', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'commandType', type: 'uint256' }],
    name: 'InvalidCommandType',
    type: 'error',
  },
  { inputs: [], name: 'InvalidEthSender', type: 'error' },
  { inputs: [], name: 'InvalidPath', type: 'error' },
  { inputs: [], name: 'InvalidReserves', type: 'error' },
  { inputs: [], name: 'LengthMismatch', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'NotAuthorizedForToken',
    type: 'error',
  },
  { inputs: [], name: 'NotPoolManager', type: 'error' },
  { inputs: [], name: 'OnlyMintAllowed', type: 'error' },
  { inputs: [], name: 'SliceOutOfBounds', type: 'error' },
  { inputs: [], name: 'TransactionDeadlinePassed', type: 'error' },
  { inputs: [], name: 'UnsafeCast', type: 'error' },
  { inputs: [{ internalType: 'uint256', name: 'action', type: 'uint256' }], name: 'UnsupportedAction', type: 'error' },
  { inputs: [], name: 'V2InvalidPath', type: 'error' },
  { inputs: [], name: 'V2TooLittleReceived', type: 'error' },
  { inputs: [], name: 'V2TooMuchRequested', type: 'error' },
  { inputs: [], name: 'V3InvalidAmountOut', type: 'error' },
  { inputs: [], name: 'V3InvalidCaller', type: 'error' },
  { inputs: [], name: 'V3InvalidSwap', type: 'error' },
  { inputs: [], name: 'V3TooLittleReceived', type: 'error' },
  { inputs: [], name: 'V3TooMuchRequested', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'minAmountOutReceived', type: 'uint256' },
      { internalType: 'uint256', name: 'amountReceived', type: 'uint256' },
    ],
    name: 'V4TooLittleReceived',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'maxAmountInRequested', type: 'uint256' },
      { internalType: 'uint256', name: 'amountRequested', type: 'uint256' },
    ],
    name: 'V4TooMuchRequested',
    type: 'error',
  },
  {
    inputs: [],
    name: 'V3_POSITION_MANAGER',
    outputs: [{ internalType: 'contract INonfungiblePositionManager', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'V4_POSITION_MANAGER',
    outputs: [{ internalType: 'contract IPositionManager', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'commands', type: 'bytes' },
      { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'commands', type: 'bytes' },
      { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'msgSender',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolManager',
    outputs: [{ internalType: 'contract IPoolManager', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
      { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'unlockCallback',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
]

export async function getArbitraryQuote(
  amountIn: bigint,
  inToken: string,
  outToken: string,
  chainId: number,
  inDecimals: number,
  outDecimals: number,
  walletClient: Account
): Promise<any> {
  const client = createPublicClient({
    chain: extractChain({
      chains: [mainnet, optimism, base, unichain],
      id: chainId as any, // Replace with your desired chain ID
    }),
    transport: http(), // or your custom RPC
  })

  // console.log({ inToken, outToken })
  // const quotedAmountOut = await client.readContract({
  //   address: QUOTER[chainId],
  //   abi: QuoterAbi.abi,
  //   functionName: 'quoteExactInputSingle',
  //   args: [inToken, outToken, FeeAmount.MEDIUM, fromReadableAmount(amountIn, inDecimals).toString(), 0],
  // })

  // console.log({ quotedAmountOut, outDecimals })
  // return toReadableAmount(quotedAmountOut as any, outDecimals)

  // const tokenIn = '0xTokenInAddress' // Replace with actual tokenIn address
  // const tokenOut = '0xTokenOutAddress' // Replace with actual tokenOut address
  // const amount = BigInt('1000000000000000000') // Replace with actual amount

  // 1. Define the pool key
  const poolKey = {
    currency0: inToken as any,
    currency1: outToken as any,
    fee: 3000,
    tickSpacing: 60,
    hooks: '0x0000000000000000000000000000000000000000',
  }

  // 2. Encode the Universal Router command
  const commands = encodePacked(['uint8'], [0x10]) // SWAP_EXACT_IN_SINGLE

  // 3. Encode the swap actions
  const actions = encodePacked(['uint8', 'uint8', 'uint8'], [0x06, 0x0c, 0x0f])

  // 4. Encode parameters
  const exactInputSingleParams = encodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [
          {
            name: 'poolKey',
            type: 'tuple',
            components: [
              { name: 'currency0', type: 'address' },
              { name: 'currency1', type: 'address' },
              { name: 'fee', type: 'uint24' },
              { name: 'tickSpacing', type: 'int24' },
              { name: 'hooks', type: 'address' },
            ],
          },
          { name: 'zeroForOne', type: 'bool' },
          { name: 'amountIn', type: 'uint128' },
          { name: 'amountOutMinimum', type: 'uint128' },
          { name: 'hookData', type: 'bytes' },
        ],
      },
    ],
    [
      {
        poolKey,
        zeroForOne: true,
        amountIn: BigInt(amountIn),
        amountOutMinimum: BigInt(0),
        hookData: '0x',
      },
    ]
  )

  // 5. Encode secondary params
  const param1 = encodeAbiParameters(
    [
      { name: 'currency0', type: 'address' },
      { name: 'amountIn', type: 'uint128' },
    ],
    [poolKey.currency0, BigInt(amountIn)]
  )

  const param2 = encodeAbiParameters(
    [
      { name: 'currency1', type: 'address' },
      { name: 'minAmountOut', type: 'uint128' },
    ],
    [poolKey.currency1, BigInt(0)]
  )

  // 6. Combine into inputs array
  const params = [exactInputSingleParams, param1, param2]

  const inputs = [
    encodeAbiParameters(
      [
        { name: 'actions', type: 'bytes' },
        { name: 'params', type: 'bytes[]' },
      ],
      [actions, params]
    ),
  ]

  // const router = getContract({
  //   address: UNIVERSAL_ROUTER_ADDRESS[chainId],
  //   abi: ROUTER_ABI,
  //   client: {
  //     public: client,
  //     wallet: walletClient,
  //   },
  // })

  // walletClient.gas
  // const tx = await router.estimateGas(commands, inputs, { value: 0 })
  // await tx.wait()
  console.log({ chainId, address: UNIVERSAL_ROUTER_ADDRESS[chainId] })
  const gasEstimate = await client.estimateContractGas({
    account: walletClient.address,
    address: UNIVERSAL_ROUTER_ADDRESS[chainId],
    abi: ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs],
  })

  return { commands, inputs, gasEstimate }
}

// export async function getQuoteAction(amountIn: number, decimals: number, outDecimals: number): Promise<string> {
//   const poolConstants = await getPoolConstants()

//   const client = createPublicClient({
//     chain: mainnet,
//     transport: http(), // or your custom RPC
//   })

//   const quotedAmountOut = await client.readContract({
//     address: QUOTER_CONTRACT_ADDRESS,
//     abi: QuoterAbi.abi,
//     functionName: 'quoteExactInputSingle',
//     args: [
//       poolConstants.token0,
//       poolConstants.token1,
//       poolConstants.fee,
//       fromReadableAmount(amountIn, decimals).toString(),
//       0,
//     ],
//   })

//   console.log({ quotedAmountOut, outDecimals })
//   return toReadableAmount(quotedAmountOut as any, outDecimals)
// }

// async function getPoolConstants(): Promise<{
//   token0: `0x${string}`
//   token1: `0x${string}`
//   fee: number
// }> {
//   const currentPoolAddress = computePoolAddress({
//     factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
//     tokenA: CurrentConfig.tokens.in,
//     tokenB: CurrentConfig.tokens.out,
//     fee: CurrentConfig.tokens.poolFee,
//   })
//   const client = createPublicClient({
//     chain: extractChain({
//       chains: [mainnet, optimism, base, unichain],
//       id: 1, // Replace with your desired chain ID
//     }),
//     transport: http(), // or your custom RPC
//   })

//   const poolContract = getContract({
//     address: currentPoolAddress as any,
//     abi: IUniswapV3PoolAbi.abi,
//     client,
//   })

//   const [token0, token1, fee] = await Promise.all<any>([
//     poolContract.read.token0(),
//     poolContract.read.token1(),
//     poolContract.read.fee(),
//   ])

//   return { token0, token1, fee }
// }
