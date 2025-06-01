import { privateKeyAtom } from '@/atoms/walletAtoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { privateKeyToAccount } from 'viem/accounts'

export const usePrivateAccount = () => {
  const pkey = useAtomValue(privateKeyAtom)
  const account = useMemo(() => {
    try {
      console.log({ pkey }, privateKeyToAccount(pkey as any))
      return privateKeyToAccount(pkey as any).address
    } catch (e: any) {
      console.log(e)
      return null
    }
  }, [pkey])

  return account
}
