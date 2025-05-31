'use client'
import { createWalletClient, encodeFunctionData, http } from 'viem'
import {} from //  signAuthorization,
'viem/actions'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { verifyAuthorization } from 'viem/utils'
import { test7702abi, testTokenAbi } from './abis'

const eoa = privateKeyToAccount(process.env.NEXT_PUBLIC_SECRET as any)

const eoaClient = createWalletClient({
  account: eoa,
  chain: sepolia,
  transport: http(),
})

const testTokenAddress = '0x64EF2085f95A1F2D3371dEEF3b293C2a11826ae2'

async function mintToken() {
  const hash = await eoaClient.sendTransaction({
    data: encodeFunctionData({
      abi: testTokenAbi,
      functionName: 'mint',
      args: [eoa.address, 100 * 1e18],
    }),
    to: testTokenAddress,
  })

  console.log({ hash })
}

async function delegateTest7702() {
  const contractAddress = '0x5Efc750998C9fBDFe7b4e9d129Effc18fF88A344'

  // 1. Authorize designation of the Contract onto the EOA.
  const authorization = await eoaClient.signAuthorization({
    account: eoa,
    contractAddress,
    executor: 'self',
    chainId: 0,
  })

  const valid = await verifyAuthorization({
    address: eoa.address,
    authorization,
  })

  console.log({ authorization, valid })

  // const approveHash = await eoaClient.sendTransaction({
  //   data: encodeFunctionData({
  //     abi: testTokenAbi,
  //     functionName: 'approve',
  //     args: [eoa.address, 100 * 1e18],
  //   }),
  //   to: testTokenAddress,
  // })

  // console.log({ approveHash })

  // const hash = await eoaClient.sendTransaction({
  //   authorizationList: [authorization],
  //   data: encodeFunctionData({
  //     abi: test7702abi,
  //     functionName: 'pullTokens',
  //     args: ['0x64EF2085f95A1F2D3371dEEF3b293C2a11826ae2', 100 * 1e18],
  //   }),
  //   type: 'eip7702',
  //   to: eoa.address,
  // })
  const hash = await eoaClient.writeContract({
    abi: test7702abi,
    address: eoa.address, // target is SELF
    authorizationList: [authorization],
    functionName: 'pullTokens',
    args: ['0x64EF2085f95A1F2D3371dEEF3b293C2a11826ae2', 100 * 1e18],
  })

  console.log({ hash })
}

export default function Batchsend7702() {
  return (
    <div className='flex-column align-center'>
      <h1 className='text-xl'>Sepolia Test</h1>
      <div className='flex-col m-2'>
        <button
          className='btn btn-wide w-[100%] mt-4'
          onClick={() => {
            // mintToken()
            //   .then(async () => {
            //     console.log('MINTED')

            delegateTest7702()
              .then(() => {
                console.log('DELEGATED')
              })

              .catch(console.error)
              .finally(() => console.log('DONE'))
          }}>
          Test Sepolia
        </button>
      </div>
    </div>
  )
}
