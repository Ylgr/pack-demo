import PackABI from '@/abi/Pack.json'

export const PACK_CONTRACT_ADDRESS = '0xfbe9a1300f80c0716ece0e9958dfb9b5454b0f5f'
export const ERC20_CONTRACT_ADDRESS = '0x8039Aa417e40880eC44f536049e7139F92d31a7c'
export const ERC1155_CONTRACT_ADDRESS = '0x38EE235315b653eEAc9048D7e8e100DA095F73b0'
export const ERC721_CONTRACT_ADDRESS = '0x575414EaEe150EeE1D53F9D08b75e356f24889B7'

export const PACK_ABI = PackABI

export interface PackContent {
  assetContract: string
  tokenType: number
  tokenId: string
  totalAmount: string
}

export interface PackContentsResult {
  contents: PackContent[]
  perUnitAmounts: string[]
}
