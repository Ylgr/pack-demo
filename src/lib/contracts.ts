import PackABI from '@/abi/Pack.json'

export const PACK_CONTRACT_ADDRESS = '0xF5FeD57F086221bdDd9052b99D7400A97eb215ec'
export const ERC20_CONTRACT_ADDRESS = '0x1816F669BAd06DBf3dF0Ec3333dDf3fc2C240dEF'
export const ERC1155_CONTRACT_ADDRESS = '0xcc47dD2D73a07f971bB21c3b9cdB0382C775bEB8'
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
