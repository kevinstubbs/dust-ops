# DUST.OPS
![banner](https://github.com/user-attachments/assets/bd6ac7ab-cce6-4532-8c47-db1348d289d4)

A **token sweeper** and **privacy enabler** for your fragmented, cluttered EVM wallets. Designed for surgical execution, **DUST.OPS** finds your liquid assets across chains, consolidates them, and optionally ghosts your exit through a Railgun-powered privacy hatch.

[Demo Video](https://ethglobal.com/showcase/-uk2n7) | [Live App](https://dust-ops.vercel.app/) | [Slide Deck](https://github.com/kevinstubbs/dust-ops/blob/main/slide-deck.md) | [Design Files](https://github.com/kevinstubbs/dust-ops/blob/main/design-files.md)

---

## Disclaimer

**Private key is required for this prototype.**
Due to current limitations (specifically lack of support for Ethereum's [Pectra Upgrade](https://eips.ethereum.org/EIPS/eip-7702) and `signAuthorization`), we're using direct key injection for the sake of this hackathon build.  

> **Never use a primary wallet. Only test with burner wallets.**

---

## Why DUST.OPS?

Your wallets are more than just assets — they’re **onchain footprints**. DUST.OPS is designed to:

- Identify tokens across Optimism, Base, and Uniswap Network (potential for any EVM integration)
- Pre-select only **liquid tokens** for consolidation
- Provide **one-click cleanup** using Uniswap and Stargate
- Optionally routing tokens through **Railgun** to cover your trace
- Deliver assets to a **fresh wallet**

We don’t just help you consolidate, swap, and bridge — we help you start fresh.

---

## How DUST.OPS Works

1. You input a private key to connect the source wallet.
2. DUST.OPS checks **Optimism**, **Base**, and **Unichain** for token balances.
3. Liquidity analysis (via Coingecko API) determines what can be swapped.
4. Tokens with enough liquidity are pre-selected for the swap.
5. You confirm swaps (to ETH) and optionally enable **privacy via Railgun**.
6. ETH proceeds are sent to a **new wallet**.
7. Now you have a **fresh wallet with funds**, completely detached from your original onchain identity.

![flow-s](https://github.com/user-attachments/assets/7066f341-07c9-472d-bd54-4e3123137e01)

---

## Tech Stack

### Dev & Frontend
- `React`, `Typescript`, `Tailwind`, `Viem`, `Wagmi`, `Uniswap`, `Coingecko`

### Backend / Ops
- `Next.js`, `Vercel`, `Redis Caching Layer`, `LayerZero`, `Blockscout`, `Foundry`

### Smart Contracts List

| Contract | Address | Network |
|----------|---------|---------|
| `ExternalSweeper.sol` | | Base |
| `MyOApp.sol` | | Optimism |
| `OriginSweeper.sol` | | Unichain |
| `Test7702.sol` | | Unichain |
| `Test7702Factory.sol` | | Base
| `TestToken.sol` | | Optimism

---

## Built for ETHGlobal Prague 2025

Join the operation. Run the cleanup.
**Exit with no echo.**
