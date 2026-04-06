# UniTrust 🔗

**Own it. Prove it. Track it.**

A full-stack Web3 monorepo for registering physical assets as NFTs, issuing soulbound certificate NFTs, and tracking carbon footprint — deployed on Polygon Amoy Testnet.

## Architecture

```
unitrust/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   └── backend/           # Express + MongoDB + Pinata
├── packages/
│   ├── contracts/         # Solidity (Hardhat + OpenZeppelin)
│   ├── shared/            # Types, constants, utilities
│   └── config/            # Addresses, network, env schemas
└── infra/                 # Deployment configs
```

## Quick Start

### Prerequisites
- Node.js ≥ 18
- pnpm ≥ 9
- MetaMask wallet
- MongoDB Atlas account
- Pinata account (IPFS)
- Alchemy account (RPC)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
cp packages/contracts/.env.example packages/contracts/.env

# Fill in your API keys in the .env files

# Compile smart contracts
cd packages/contracts && npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts (when ready)
npx hardhat run scripts/deploy.ts --network amoy

# Start development
pnpm dev
```

## Features

- **Asset NFTs** — ERC-721 tokens for physical assets with ownership tracking
- **Soulbound Certificates** — Non-transferable certificate NFTs from institutes
- **Certificate Request Flow** — Institute sends request → User accepts/rejects → Mint
- **QR Code System** — Scan-to-verify with prefix isolation
- **Carbon Tracking** — Sustainability data on every token
- **Role-Based Access** — User and Institute dashboards

## Tech Stack

| Layer | Tech |
|-------|------|
| Smart Contracts | Solidity 0.8.24, Hardhat, OpenZeppelin |
| Frontend | Next.js 14, RainbowKit, wagmi, Zustand |
| Backend | Express, Mongoose, Pinata SDK |
| Blockchain | Polygon Amoy (Chain ID: 80002) |
| Storage | MongoDB Atlas, IPFS (Pinata) |

## License

MIT