import { atom } from 'jotai'

export type Token = {
  id: number
  symbol: string
  name: string
  chain: string
  balance: string
  value: string
  liquid: boolean
  selected: boolean
}

export const privateKeyAtom = atom<string>('')
export const tokensAtom = atom<Token[]>([])
export const selectedTokensAtom = atom<Token[]>([])
export const stepAtom = atom<number>(0)
export const totalValueAtom = atom<number>(0)
export const railgunAddressAtom = atom<string>('')
