# Pack Demo Application

A Next.js application for managing and opening NFT packs using wagmi and viem for blockchain interactions.

## Features

- **Wallet Connection**: Connect to Arbitrum Sepolia network using MetaMask, WalletConnect, or Coinbase Wallet
- **Pack Contents**: View pack contents and calculate drop rates for each item
- **Inventory Management**: View balances of packs and various token types (ERC20, ERC1155, ERC721)
- **Pack Opening**: Open packs with customizable amounts

## Technology Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **wagmi v2** for blockchain interactions
- **viem** for Ethereum library
- **Arbitrum Sepolia** testnet

## Contract Addresses

- **Pack Contract**: `0xfbe9a1300f80c0716ece0e9958dfb9b5454b0f5f`
- **ERC20 Token**: `0x8039Aa417e40880eC44f536049e7139F92d31a7c`
- **ERC1155 Token**: `0x38EE235315b653eEAc9048D7e8e100DA095F73b0`
- **ERC721 Token**: `0x575414EaEe150EeE1D53F9D08b75e356f24889B7`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### GitHub Pages

The application is deployed to GitHub Pages and is available at:
**https://ylgr.github.io/pack-demo/**

To deploy updates:

1. **Automatic deployment**:
   ```bash
   npm run deploy
   ```

2. **Manual deployment**:
   ```bash
   npm run build
   npx gh-pages -d out
   ```

3. **Using the deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Usage

1. **Connect Wallet**: Click on any wallet connector button to connect your wallet
2. **View Pack Contents**: Switch to the "Pack Contents" tab to see what's inside pack ID 0
3. **Check Inventory**: Switch to "Your Inventory" to view your token balances
4. **Open Packs**: Enter the amount of packs to open and click "Open Pack"

## Network Configuration

The application is configured to use **Arbitrum Sepolia** testnet. Make sure your wallet is connected to this network.

## Development

The application uses:
- `src/lib/wagmi.ts` - wagmi configuration
- `src/lib/contracts.ts` - contract addresses and types
- `src/components/WagmiProvider.tsx` - React context provider
- `src/app/page.tsx` - Main application component

## WalletConnect Setup

To use WalletConnect, you can add it back to the configuration in `src/lib/wagmi.ts`:

```typescript
import { walletConnect } from '@wagmi/connectors'

// Add to connectors array:
walletConnect({
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
}),
```

Get your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).
