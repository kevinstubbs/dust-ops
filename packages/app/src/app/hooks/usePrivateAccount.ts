import { privateKeyAtom } from '@/atoms/walletAtoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { privateKeyToAccount } from 'viem/accounts'

export const usePrivateAccountFull = () => {
  const pkey = useAtomValue(privateKeyAtom)
  const account = useMemo(() => {
    try {
      return privateKeyToAccount(pkey as any)
    } catch (e: any) {
      console.log(e)
      return null
    }
  }, [pkey])

  return account
}

export const usePrivateAccount = () => {
  const pkey = useAtomValue(privateKeyAtom)
  const account = useMemo(() => {
    try {
      return privateKeyToAccount(pkey as any).address
    } catch (e: any) {
      console.log(e)
      return null
    }
  }, [pkey])

  return account
}
