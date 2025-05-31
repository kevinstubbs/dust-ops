import { parseUnits, formatUnits } from 'viem'

const READABLE_FORM_LEN = 4

export function fromReadableAmount(amount: number, decimals: number): bigint {
  return parseUnits(amount.toString(), decimals)
}

export function toReadableAmount(rawAmount: bigint | number, decimals: number): string {
  const raw = typeof rawAmount === 'bigint' ? rawAmount : BigInt(rawAmount)
  return formatUnits(raw, decimals).slice(0, READABLE_FORM_LEN)
}
