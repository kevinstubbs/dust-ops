'use client'

import { PropsWithChildren } from 'react'
// import { Web3Provider } from './Web3'
// import { DataProvider } from './Data'
// import { NotificationProvider } from './Notifications'

import { PrivyProvider } from '@privy-io/react-auth'

interface Props extends PropsWithChildren {
  cookies: string | null
}

export function Providers(props: Props) {
  return (
    <>
      {/* <Web3Provider cookies={props.cookies}> */}
      {/* <DataProvider> */}
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_privateappid!}
        // clientId='your-app-client-id'
        config={
          {
            // Create embedded wallets for users who don't have a wallet
            // embeddedWallets: {
            //   ethereum: {
            //     createOnLogin: 'users-without-wallets',
            //   },
            // },
          }
        }>
        {props.children}
        {/* <NotificationProvider>{props.children}</NotificationProvider> */}
      </PrivyProvider>
      {/* </DataProvider> */}
      {/* </Web3Provider> */}
    </>
  )
}
