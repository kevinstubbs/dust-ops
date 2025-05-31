'use client'
import {
  useAccount,
  useBalance,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWalletClient,
} from 'wagmi'
import { useState, useEffect } from 'react'
import { createWalletClient, encodeFunctionData, http, parseEther } from 'viem'
import { useNotifications } from '@/context/Notifications'
import { formatBalance } from '@/utils/format'
import {
  //  signAuthorization,
  waitForTransactionReceipt,
} from 'viem/actions'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
import { verifyAuthorization } from 'viem/utils'

const batchCallDelegationAbi = [
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
        ],
        internalType: 'struct BatchCallDelegation.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

const receivers = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
] as const

export const abi = [
  { type: 'function', name: 'initialize', inputs: [], outputs: [], stateMutability: 'payable' },
  { type: 'function', name: 'ping', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    name: 'Log',
    inputs: [{ name: 'message', type: 'string', indexed: false, internalType: 'string' }],
    anonymous: false,
  },
]

type Call = {
  data: `0x${string}`
  to: `0x${string}`
  value: bigint
}

export default function Batchsend7702() {
  const [amount, setAmount] = useState('0.01')
  const { Add } = useNotifications()
  const { data: walletClient } = useWalletClient()
  const { address, chain } = useAccount()
  const { data: balanceData } = useBalance({
    address,
  })

  const calls: Call[] = receivers.map((to) => ({
    data: '0x' as `0x${string}`,
    to: to as `0x${string}`,
    value: parseEther(amount),
  }))

  const { error: estimateError } = useSimulateContract({
    address: address,
    abi: batchCallDelegationAbi,
    functionName: 'execute',
    args: [calls],
    value: parseEther(amount) * BigInt(receivers.length),
  })

  const { data } = useWriteContract()

  const {
    isLoading,
    error: txError,
    isSuccess: txSuccess,
  } = useWaitForTransactionReceipt({
    hash: data,
  })

  useEffect(() => {
    ;(async function () {
      try {
        const eoa = privateKeyToAccount(process.env.NEXT_PUBLIC_SECRET as any)

        const eoaClient = createWalletClient({
          account: eoa,
          chain: foundry,
          transport: http(),
        })
        const contractAddress = '0x287da1D560CC66F6A686E9E2723eB7A21DE35422'
        // 1. Authorize designation of the Contract onto the EOA.
        const authorization = await eoaClient.signAuthorization({
          account: eoa,
          contractAddress,
          // executor: 'self',
        })

        const valid = await verifyAuthorization({
          address: eoa.address,
          authorization,
        })

        console.log({ authorization, valid })

        // const hash = await eoaClient.writeContract({
        //   abi,
        //   address: eoaClient.account.address,
        //   authorizationList: [authorization],
        //   functionName: 'initialize',
        // })

        const hash = await eoaClient.sendTransaction({
          authorizationList: [authorization],
          //                  ↑ 3. Pass the Authorization as a parameter.
          data: encodeFunctionData({
            abi,
            functionName: 'initialize',
          }),
          type: 'eip7702',
          to: eoa.address,
        })

        console.log({ hash })
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const handleSendTransaction = async () => {
    if (estimateError) {
      Add(`Transaction failed: ${estimateError.cause}`, {
        type: 'error',
      })
      return
    }

    try {
      if (!window.ethereum) {
        throw new Error('No ethereum provider found')
      } else if (!walletClient) {
        throw new Error('No walletClient')
      } else if (!address) {
        throw new Error('Not connected (no address)')
      }

      const brainAddress = '0xDcbd0d0A904eAad4e2935745faD7c27eBD9BC862' as any

      // Sign the EIP-712 typed data for authorization
      const domain = {
        name: 'EIP-7702',
        version: '1',
        chainId: chain?.id,
        verifyingContract: brainAddress,
      }

      // 3. Define the types (strict EIP-712 format)
      const types = {
        Authorization: [],
      }

      // 4. Define the message
      const message = {}

      // 5. Sign typed data using eth_signTypedData_v4 via viem
      const signature = await walletClient.signTypedData({
        account: address,
        domain,
        types,
        primaryType: 'Authorization',
        message,
      })

      // const domain = {
      //   name: 'MySmartAccount',
      //   version: '1',
      //   chainId: 0,
      //   verifyingContract: '0x56BBC4969818d4E27Fe39983f8aDee4F3e1C5c6f',
      // }

      // const types = {
      //   Authorization: [
      //     { name: 'nonce', type: 'uint256' },
      //     { name: 'target', type: 'address' },
      //     { name: 'data', type: 'bytes' },
      //     { name: 'value', type: 'uint256' },
      //   ],
      // }

      // const message = {
      //   nonce: 1,
      //   target: '0x56BBC4969818d4E27Fe39983f8aDee4F3e1C5c6f',
      //   data: encodeFunctionData({
      //     abi,
      //     functionName: 'ping',
      //   }),
      //   value: 0,
      // }

      // const params = [
      //   address,
      //   JSON.stringify({
      //     types: types,
      //     domain: domain,
      //     primaryType: 'Authorization',
      //     message: message,
      //   }),
      // ]

      // console.log({ message, params })

      // const method = 'eth_signTypedData_v4'

      // const authorization = await (window as any).ethereum.request({
      //   method,
      //   params,
      // })

      // console.log({ authorization })

      // Deployed with `make simple-deploy contract=BatchCallDelegation`
      // const contractAddress = '0x56BBC4969818d4E27Fe39983f8aDee4F3e1C5c6f'

      // console.log('wc account', walletClient.account)
      // const authorization = await signAuthorization(walletClient, {
      //   account: address,
      //   contractAddress: contractAddress,
      //   executor: 'self',
      // })

      console.log({ signature })
      // Execute the batch send
      // writeContract({
      //   address: address!,
      //   abi: batchCallDelegationAbi,
      //   functionName: 'execute',
      //   args: [calls],
      //   value: parseEther(amount) * BigInt(receivers.length),
      //   authorizationList: [authorization],
      // })

      const hash = await walletClient.sendTransaction({
        authorizationList: [
          {
            address,
            chainId: 31337,
            nonce: 2,
            signed: true,
            // signature,
            contractAddress: brainAddress,
          },
        ],
        // ↑ 3. Pass the Authorization as a parameter.
        data: encodeFunctionData({
          abi,
          functionName: 'ping',
        }),
        to: address,
      })

      // const pingHash = await walletClient.sendTransaction({
      //   data: encodeFunctionData({
      //     abi,
      //     functionName: 'ping',
      //   }),
      //   to: brainAddress,
      // })
      console.log({ hash })

      const receipt = await waitForTransactionReceipt(walletClient, { hash })

      console.log(receipt.logs)

      // console.log({ pingHash })
    } catch (error) {
      console.error(error)
      Add(`Failed to send transaction: ${error}`, {
        type: 'error',
      })
    }
  }

  useEffect(() => {
    if (txSuccess) {
      Add(`Transaction successful`, {
        type: 'success',
        href: chain?.blockExplorers?.default.url ? `${chain.blockExplorers.default.url}/tx/${data}` : undefined,
      })
    } else if (txError) {
      Add(`Transaction failed: ${txError.cause}`, {
        type: 'error',
      })
    }
  }, [txSuccess, txError])

  return (
    <div className='flex-column align-center'>
      <h1 className='text-xl'>Batch Send ETH</h1>
      <div className='flex-col m-2'>
        <label className='form-control w-full max-w-xs'>
          <div className='label'>
            <span className='label-text'>Amount of ETH to send to each address</span>
          </div>
          <input
            type='number'
            step='0.001'
            min='0'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className='input input-bordered w-full max-w-xs'
          />
        </label>

        <div className='stats shadow-sm join-item mb-2 bg-[#282c33] mt-4'>
          <div className='stat'>
            <div className='stat-title'>Your balance</div>
            {address ? (
              <div>{formatBalance(balanceData?.value ?? BigInt(0))} ETH</div>
            ) : (
              <p>Please connect your wallet</p>
            )}
          </div>
        </div>

        <div className='mt-4'>
          <div>Address: {address}</div>
          <h2 className='text-lg mb-2'>Receivers ({receivers.length})</h2>
          <div className='max-h-60 overflow-y-auto'>
            {receivers.map((receiver, index) => (
              <div key={receiver} className='text-sm mb-1'>
                {index + 1}. {receiver}
              </div>
            ))}
          </div>
        </div>

        <button
          className='btn btn-wide w-[100%] mt-4'
          onClick={handleSendTransaction}
          // disabled={
          //   !address ||
          //   // || Boolean(estimateError)
          //   // amount === '' ||
          //   // isLoading
          // }
        >
          {isLoading ? <span className='loading loading-dots loading-sm'></span> : 'Send ETH to all'}
        </button>
      </div>
    </div>
  )
}
