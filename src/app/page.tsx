'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { WagmiProvider } from '@/components/WagmiProvider'
import { ClientOnly } from '@/components/ClientOnly'
import { PACK_CONTRACT_ADDRESS, PACK_ABI, ERC20_CONTRACT_ADDRESS, ERC1155_CONTRACT_ADDRESS, ERC721_CONTRACT_ADDRESS, PackContentsResult } from '@/lib/contracts'
import { formatEther } from 'viem'

function PackApp() {
  const [activeTab, setActiveTab] = useState<'pack' | 'inventory'>('pack')
  const [amountToOpen, setAmountToOpen] = useState('1')
  
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()

  // Read pack contents
  const { data: packContents, isLoading: isLoadingPackContents, refetch: refetchPackContents } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'getPackContents',
    args: [BigInt(0)],
  }) as { data: PackContentsResult | undefined, isLoading: boolean, refetch: () => void }

  // Read pack balance
  const { data: packBalance } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(0)],
    query: {
      enabled: !!address,
    },
  })

  // Read ERC20 balance
  const { data: erc20Balance } = useReadContract({
    address: ERC20_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  // Read ERC1155 balances for token IDs 0, 1, 2
  const { data: erc1155Balance0 } = useReadContract({
    address: ERC1155_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'account', type: 'address' },
          { name: 'id', type: 'uint256' },
        ],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(0)],
    query: {
      enabled: !!address,
    },
  })

  const { data: erc1155Balance1 } = useReadContract({
    address: ERC1155_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'account', type: 'address' },
          { name: 'id', type: 'uint256' },
        ],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(1)],
    query: {
      enabled: !!address,
    },
  })

  const { data: erc1155Balance2 } = useReadContract({
    address: ERC1155_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'account', type: 'address' },
          { name: 'id', type: 'uint256' },
        ],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(2)],
    query: {
      enabled: !!address,
    },
  })

  // Read ERC721 balance
  const { data: erc721Balance } = useReadContract({
    address: ERC721_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  // Open pack function
  const { data: openPackData, writeContract: openPack, isPending: isOpeningPack } = useWriteContract()

  const { isLoading: isWaitingForTransaction } = useWaitForTransactionReceipt({
    hash: openPackData,
  })

  const handleOpenPack = () => {
    if (openPack && amountToOpen) {
      openPack({
        address: PACK_CONTRACT_ADDRESS as `0x${string}`,
        abi: PACK_ABI,
        functionName: 'openPack',
        args: [BigInt(0), BigInt(amountToOpen)],
      })
    }
  }

  const calculateNumber = (totalAmount: string, perUnitAmount: string) => {
    const total = BigInt(totalAmount)
    const perUnit = BigInt(perUnitAmount)
    if (perUnit === BigInt(0)) return 0
    return Number(total / perUnit)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Pack Demo</h1>
            
            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => connect({ connector })}
                      disabled={isConnecting}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pack')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pack'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pack Contents
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Your Inventory
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pack' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Pack Contents (Pack ID: 0)</h2>
                  <button
                    onClick={() => refetchPackContents()}
                    disabled={isLoadingPackContents}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoadingPackContents ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reload
                      </>
                    )}
                  </button>
                </div>
                
                {isLoadingPackContents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading pack contents...</p>
                  </div>
                ) : packContents ? (
                  <div className="space-y-4">
                    {/* @ts-ignore */}
                    {(() => {
                      // Calculate total number of tokens first
                      const totalTokens = (packContents as any)[0].reduce((total: number, content: any, index: number) => {
                        const number = calculateNumber(
                          content.totalAmount,
                          // @ts-ignore
                          (packContents as any)[1][index]
                        )
                        return total + number
                      }, 0)

                      return (packContents as any)[0].map((content: any, index: number) => { 
                        const number = calculateNumber(
                          content.totalAmount,
                          // @ts-ignore
                          (packContents as any)[1][index] 
                        )
                        return (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              
                              <div>
                                <span className="text-sm font-medium text-gray-500">Token Type</span>
                                <p className="text-sm">{content.tokenType === 0 ? 'ERC20' : content.tokenType === 1 ? 'ERC721' : 'ERC1155'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Number of Tokens</span>
                                <p className="text-sm">{number}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Price pool</span>
                                <p className="text-sm">{content.tokenType === 0 ? formatEther(content.totalAmount) : content.totalAmount}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Rate</span>
                                <p className="text-sm">{totalTokens > 0 ? (number / totalTokens * 100).toFixed(2) : '0.00'}%</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Token ID</span>
                                <p className="text-sm">{content.tokenId}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Asset Contract</span>
                                <p className="text-sm font-mono">{content.assetContract}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-600">No pack contents found.</p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Inventory</h2>
                
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Please connect your wallet to view your inventory.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Pack Balance</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {packBalance ? Number(packBalance).toString() : '0'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">ERC20 Balance</h3>
                        <p className="text-2xl font-bold text-green-600">
                          {erc20Balance ? formatEther(erc20Balance) : '0'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">ERC1155 Balance (ID: 0)</h3>
                        <p className="text-2xl font-bold text-purple-600">
                          {erc1155Balance0 ? Number(erc1155Balance0).toString() : '0'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">ERC1155 Balance (ID: 1)</h3>
                        <p className="text-2xl font-bold text-purple-600">
                          {erc1155Balance1 ? Number(erc1155Balance1).toString() : '0'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">ERC1155 Balance (ID: 2)</h3>
                        <p className="text-2xl font-bold text-purple-600">
                          {erc1155Balance2 ? Number(erc1155Balance2).toString() : '0'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">ERC721 Balance</h3>
                        <p className="text-2xl font-bold text-orange-600">
                          {erc721Balance ? Number(erc721Balance).toString() : '0'}
                        </p>
                      </div>
                    </div>

                    {/* Open Pack Section */}
                    <div className="bg-blue-50 rounded-lg p-6 mt-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Open Pack</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={amountToOpen}
                          onChange={(e) => setAmountToOpen(e.target.value)}
                          min="1"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Amount to open"
                        />
                        <button
                          onClick={handleOpenPack}
                          disabled={!isConnected || isOpeningPack || isWaitingForTransaction || !amountToOpen}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          {isOpeningPack || isWaitingForTransaction ? 'Opening...' : 'Open Pack'}
                        </button>
                      </div>
                      {openPackData && (
                        <p className="text-sm text-blue-600 mt-2">
                          Transaction: {openPackData}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ClientOnly>
      <WagmiProvider>
        <PackApp />
      </WagmiProvider>
    </ClientOnly>
  )
}
