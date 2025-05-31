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
import { parseEther } from 'viem'
import { useNotifications } from '@/context/Notifications'
import { formatBalance } from '@/utils/format'
import { signAuthorization } from 'viem/actions'

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

// These are the 10 default addresses when forking.
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

type Call = {
  data: `0x${string}`
  to: `0x${string}`
  value: bigint
}

export default function SweeperCell() {
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

  const { data, writeContract } = useWriteContract()

  const {
    isLoading,
    error: txError,
    isSuccess: txSuccess,
  } = useWaitForTransactionReceipt({
    hash: data,
  })

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

      // // Sign the EIP-712 typed data for authorization
      // const domain = {
      //   name: 'EIP-7702',
      //   version: '1',
      //   chainId: chain?.id,
      //   verifyingContract: address,
      // }

      // const types = {
      //   EIP712Domain: [
      //     { name: 'name', type: 'string' },
      //     { name: 'version', type: 'string' },
      //     { name: 'chainId', type: 'uint256' },
      //     { name: 'verifyingContract', type: 'address' },
      //   ],
      //   Authorization: [
      //     { name: 'authorizer', type: 'address' },
      //     { name: 'authorized', type: 'address' },
      //     { name: 'nonce', type: 'uint256' },
      //   ],
      // }

      // const message = {
      //   authorizer: address,
      //   authorized: address,
      //   nonce: 0,
      // }

      // const authorization = await (window.ethereum as any).request({
      //   method: 'eth_signTypedData_v4',
      //   params: [address, { domain, types, primaryType: 'Authorization', message }],
      // })

      // Deployed with `make simple-deploy contract=BatchCallDelegation`
      const contractAddress = '0x56BBC4969818d4E27Fe39983f8aDee4F3e1C5c6f'

      console.log('wc account', walletClient.account)
      const authorization = await signAuthorization(walletClient, {
        account: address,
        contractAddress: contractAddress,
        executor: 'self',
      })

      console.log({ authorization })
      // Execute the batch send
      writeContract({
        address: address!,
        abi: batchCallDelegationAbi,
        functionName: 'execute',
        args: [calls],
        value: parseEther(amount) * BigInt(receivers.length),
        authorizationList: [authorization],
      })
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
      <h1 className='text-xl'>Sweeper Cell</h1>
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
          {address}
          {walletClient?.transport.type}
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
          disabled={!address || Boolean(estimateError) || amount === '' || isLoading}>
          {isLoading ? <span className='loading loading-dots loading-sm'></span> : 'Send ETH to all'}
        </button>
      </div>
    </div>
  )
}
