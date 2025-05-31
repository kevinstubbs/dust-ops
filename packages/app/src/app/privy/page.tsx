'use client'

import { useConnectWallet, usePrivy, useSignAuthorization } from '@privy-io/react-auth'
import { useWallets } from '@privy-io/react-auth'

function ConnectWalletButton() {
  // const {connectWallet} = useConnectWallet();

  // connectWallet();
  //   const { signAuthorization } = useSignAuthorization()

  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      console.log(wallet)

      //   try {
      //     const authorization = signAuthorization({
      //       contractAddress: '0x1234567890abcdef1234567890abcdef12345678', // The address of the smart contract
      //       chainId: 31337,
      //     })

      //     console.log({ authorization })
      //   } catch (e) {
      //     console.error(e)
      //   } finally {
      //     console.log('finished trying')
      //   }
    },
    onError: (error) => {
      console.log(error)
    },
  })
  // Prompt user to connect a wallet with Privy modal
  return <button onClick={connectWallet}>Connect wallet</button>
}

export default function PrivyCheck() {
  const { ready, authenticated } = usePrivy()
  const { signAuthorization } = useSignAuthorization()
  const { wallets } = useWallets()

  if (!ready) {
    return <div>Loading...</div>
  }

  // Now it's safe to use other Privy hooks and state
  return (
    <div>
      Privy is ready!
      {/* {JSON.stringify(wallets, null, 4)}
      {JSON.stringify({ user }, null, 4)} */}
      {authenticated ? 'AUTHD' : 'NOT AUTHD'}
      <div className='flex flex-col gap-8'>
        <ConnectWalletButton />
        <button
          disabled={!wallets[0]}
          onClick={() => {
            wallets[0].loginOrLink()
          }}>
          Login with wallet
        </button>
        <button
          disabled={!authenticated}
          onClick={() => {
            try {
              console.log({ signAuthorization })
              const authorization = signAuthorization({
                // The address of the smart contract (this is a dummy address from Privy documentation.)
                contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: 31337,
              })

              console.log({ authorization })
            } catch (e) {
              console.error(e)
            } finally {
              console.log('finished trying')
            }
          }}>
          signAuthorization
        </button>
      </div>
      <div></div>
    </div>
  )
}
