import { atom } from 'jotai'

export type Token = {
  id: number
  address: string
  symbol: string
  name: string
  chain: string
  chainId: number
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
