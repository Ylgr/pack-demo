import { createConfig, http } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from '@wagmi/connectors'

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: 'Pack Demo',
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
})
