'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { WagmiProvider } from '@/components/WagmiProvider'
import { ClientOnly } from '@/components/ClientOnly'
import { PACK_CONTRACT_ADDRESS, PACK_ABI, ERC20_CONTRACT_ADDRESS, ERC1155_CONTRACT_ADDRESS, ERC721_CONTRACT_ADDRESS, PackContentsResult } from '@/lib/contracts'
import { formatEther, decodeEventLog } from 'viem'
import React from 'react' // Added for useEffect

// Interface for the PackOpened event data
interface PackOpenedEvent {
  packId: bigint
  opener: string
  numOfPacksOpened: bigint
  rewardUnitsDistributed: {
    assetContract: string
    tokenType: number
    tokenId: bigint
    totalAmount: bigint
  }[]
}

// Modal component for displaying pack opening results
function PackOpenedModal({ 
  isOpen, 
  onClose, 
  eventData 
}: { 
  isOpen: boolean
  onClose: () => void
  eventData: PackOpenedEvent | null
}) {
  if (!isOpen || !eventData) return null

  // Use mappings from PackApp (duplicate or lift up if needed)
  const packNames = [
    'Tre Lucky',
    'Tre Sprout',
    'Tre Spirit',
    'Tre Guardian',
  ];
  const packColors = [
    'bg-black-500', // Tre Lucky
    'bg-green-500', // Tre Sprout
    'bg-blue-500', // Tre Spirit
    'bg-purple-600', // Tre Guardian (last one purple)
  ];
  const packTextColors = [
    'text-black-500',
    'text-green-500',
    'text-blue-500',
    'text-purple-600',
  ];
  const packLogos = [
    '❓✨', // You can replace with SVG or image if needed
    '❓🌱',
    '❓🪴',
    '❓🎋',
  ];
  const erc20Name = 'Lucky BIC';
  const erc20Logo = '🪙'; // Coin emoji
  const erc1155Name = 'Original Baby Tre';
  const erc1155Ids = [
    'OGBT Common',
    'OGBT Uncommon',
    'OGBT Rare',
    'OGBT Epic',
    'OGBT Legendary',
  ];
  // Reddit-style colors for ERC1155, matching pack colors
  const erc1155Colors = [
    'text-black-500',
    'text-green-500',
    'text-blue-500',
    'text-yellow-600',
    'text-purple-500', // Legendary, can be adjusted
  ];

  const getTokenTypeName = (tokenType: number) => {
    switch (tokenType) {
      case 0: return 'ERC20'
      case 1: return 'ERC721'
      case 2: return 'ERC1155'
      default: return 'Unknown'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pack Opened Successfully! 🎉</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className={`font-medium mb-2 ${packColors[Number(eventData.packId)]}`}>Pack Details</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{packLogos[Number(eventData.packId)]}</span>
              <span className={`font-semibold ${packTextColors[Number(eventData.packId)]}`}>
                {packNames[Number(eventData.packId)]}
              </span>
            </div>
            <p className={`text-sm ${packColors[Number(eventData.packId)]}`}>
              You opened <strong>{packNames[Number(eventData.packId)]} (Pack ID: {Number(eventData.packId)})</strong>
              {" "}with amount <strong>{Number(eventData.numOfPacksOpened)}</strong>
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Your Rewards:</h3>
            {eventData.rewardUnitsDistributed.filter(r => r.tokenType !== 1).length > 0 ? (
              <div className="space-y-3">
                {eventData.rewardUnitsDistributed.filter(r => r.tokenType !== 1).map((reward, index) => {
                  // Show only a friendly summary for each reward
                  if (reward.tokenType === 0) {
                    // ERC20
                    return (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <span className="text-2xl">{erc20Logo}</span>
                        <span className="font-semibold text-green-700">
                          {formatEther(reward.totalAmount)} {erc20Name}
                        </span>
                      </div>
                    )
                  } else if (reward.tokenType === 2) {
                    // ERC1155
                    const id = Number(reward.tokenId);
                    return (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <span className="text-2xl">🎍</span>
                        <span className={`font-semibold ${erc1155Colors[id]}`}>
                          {Number(reward.totalAmount)} {erc1155Name} ({erc1155Ids[id]})
                        </span>
                      </div>
                    )
                  }
                  return null;
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No rewards distributed</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function PackApp() {
  // Mappings for names and colors
  const packNames = [
    'Tre Lucky',
    'Tre Sprout',
    'Tre Spirit',
    'Tre Guardian',
  ];
  const packColors = [
    'bg-gray-500', // Tre Lucky
    'bg-green-500', // Tre Sprout
    'bg-blue-500', // Tre Spirit
    'bg-purple-600', // Tre Guardian (last one purple)
  ];
  const packTextColors = [
    'text-gray-500',
    'text-green-500',
    'text-blue-500',
    'text-purple-600',
  ];
  const packLogos = [
    '❓✨', // You can replace with SVG or image if needed
    '❓🌱',
    '❓🪴',
    '❓🎋',
  ];
  const erc20Name = 'Lucky BIC';
  const erc20Logo = '🪙'; // Coin emoji
  const erc1155Name = 'Original Baby Tre';
  const erc1155Ids = [
    'OGBT Common',
    'OGBT Uncommon',
    'OGBT Rare',
    'OGBT Epic',
    'OGBT Legendary',
  ];
  // Reddit-style colors for ERC1155, matching pack colors
  const erc1155Colors = [
    'text-black-500',
    'text-green-500',
    'text-blue-500',
    'text-yellow-600',
    'text-purple-500', // Legendary, can be adjusted
  ];
  const [activeTab, setActiveTab] = useState<'pack' | 'inventory'>('pack')
  const [activePackId, setActivePackId] = useState<number>(0)
  const [amountToOpen, setAmountToOpen] = useState('1')
  const [showModal, setShowModal] = useState(false)
  const [packOpenedEvent, setPackOpenedEvent] = useState<PackOpenedEvent | null>(null)
  
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()

  // Read pack contents for the active pack ID
  const { data: packContents, isLoading: isLoadingPackContents, refetch: refetchPackContents } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'getPackContents',
    args: [BigInt(activePackId)],
  }) as { data: PackContentsResult | undefined, isLoading: boolean, refetch: () => void }

  // Read pack balances for all IDs
  const { data: packBalance0 } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(0)],
    query: {
      enabled: !!address,
    },
  })

  const { data: packBalance1 } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(1)],
    query: {
      enabled: !!address,
    },
  })

  const { data: packBalance2 } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(2)],
    query: {
      enabled: !!address,
    },
  })

  const { data: packBalance3 } = useReadContract({
    address: PACK_CONTRACT_ADDRESS as `0x${string}`,
    abi: PACK_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`, BigInt(3)],
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

  const { data: erc1155Balance3 } = useReadContract({
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
    args: [address as `0x${string}`, BigInt(3)],
    query: {
      enabled: !!address,
    },
  })

  const { data: erc1155Balance4 } = useReadContract({
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
    args: [address as `0x${string}`, BigInt(4)],
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

  const { isLoading: isWaitingForTransaction, data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: openPackData,
  })

  // Monitor transaction receipt for PackOpened event
  React.useEffect(() => {
    if (transactionReceipt && openPackData) {
      console.log('Transaction receipt:', transactionReceipt)
      // Parse logs to find PackOpened event
      const packOpenedEvent = transactionReceipt.logs.find(log => {
        try {
          // Check if this log is from our pack contract
          if (log.address.toLowerCase() === PACK_CONTRACT_ADDRESS.toLowerCase()) {
            // The first topic should be the event signature for PackOpened
            // PackOpened(uint256,address,uint256,tuple[])
            const eventSignature = '0x58bbfaa763248693d05ac650926341943af86affd998d80e41dbcc9adfdae607';
            console.log('Event signature:', eventSignature)
            return log.topics[0] === eventSignature
          }
          return false
        } catch (error) {
          return false
        }
      })

      if (packOpenedEvent) {
        try {
          // Parse the event data
          // topics[0] = event signature
          // topics[1] = packId (indexed)
          // topics[2] = opener (indexed)
          // data = numOfPacksOpened + rewardUnitsDistributed array
          
          const packId = BigInt(packOpenedEvent.topics?.[1] || '0')
          const opener = '0x' + (packOpenedEvent.topics?.[2]?.slice(26) || '') // Remove padding
          
          // Use viem's decodeEventLog to properly decode the event
          try {
            const decodedEvent = decodeEventLog({
              abi: PACK_ABI,
              data: packOpenedEvent.data,
              topics: packOpenedEvent.topics,
              eventName: 'PackOpened'
            })


            if (decodedEvent && decodedEvent.eventName === 'PackOpened') {
              const eventData = decodedEvent.args as any
              if (eventData) {
                const packOpenedEventData: PackOpenedEvent = {
                  packId: eventData.packId,
                  opener: eventData.opener,
                  numOfPacksOpened: eventData.numOfPacksOpened,
                  rewardUnitsDistributed: eventData.rewardUnitsDistributed
                }

                setPackOpenedEvent(packOpenedEventData)
                setShowModal(true)
                return
              }
            }
          } catch (decodeError) {
            console.log('Event decoding failed, using fallback:', decodeError)
          }
          
          // Fallback to parsed topics if decoding fails
          const fallbackEvent: PackOpenedEvent = {
            packId,
            opener,
            numOfPacksOpened: BigInt(amountToOpen),
            rewardUnitsDistributed: [
              {
                assetContract: ERC20_CONTRACT_ADDRESS,
                tokenType: 0,
                tokenId: BigInt(0),
                totalAmount: BigInt(1000000000000000000) // 1 token in wei
              }
            ]
          }
          
          setPackOpenedEvent(fallbackEvent)
          setShowModal(true)
        } catch (error) {
          console.error('Error parsing PackOpened event:', error)
        }
      }
    }
  }, [transactionReceipt, openPackData, amountToOpen])

  const handleOpenPack = (packId: number) => {
    if (openPack && amountToOpen && PACK_CONTRACT_ADDRESS) {
      openPack({
        address: PACK_CONTRACT_ADDRESS as `0x${string}`,
        abi: PACK_ABI,
        functionName: 'openPack',
        args: [BigInt(packId), BigInt(amountToOpen)],
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
                {/* Pack ID Tabs */}
                <div className="flex space-x-2 mb-4">
                  {[0, 1, 2, 3].map((packId) => (
                    <button
                      key={packId}
                      onClick={() => setActivePackId(packId)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        activePackId === packId
                          ? packColors[packId] + ' text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span>{packLogos[packId]}</span>
                      <span>{packNames[packId]}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${packTextColors[activePackId]}`}> {packNames[activePackId]} (Pack ID: {activePackId}) </h2>
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
                        if (content.tokenType === 1) return total; // skip ERC721
                        const number = calculateNumber(
                          content.totalAmount,
                          // @ts-ignore
                          (packContents as any)[1][index]
                        )
                        return total + number
                      }, 0)

                      return (packContents as any)[0].map((content: any, index: number) => { 
                        if (content.tokenType === 1) return null; // skip ERC721
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
                      {[0, 1, 2, 3].map((packId) => (
                        <div key={packId} className="bg-gray-50 rounded-lg p-4">
                          <h3 className={`font-medium mb-2 flex items-center gap-2 ${packTextColors[packId]}`}> 
                            <span>{packLogos[packId]}</span> {packNames[packId]}
                          </h3>
                          <p className="text-2xl font-bold">
                            {packId === 0 ? (packBalance0 ? Number(packBalance0).toString() : '0') :
                             packId === 1 ? (packBalance1 ? Number(packBalance1).toString() : '0') :
                             packId === 2 ? (packBalance2 ? Number(packBalance2).toString() : '0') :
                             (packBalance3 ? Number(packBalance3).toString() : '0')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Open Pack Section */}
                    <div className="bg-blue-50 rounded-lg p-6 mt-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Open Pack</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((packId) => (
                          <div key={packId} className="bg-white rounded-lg p-4 border border-blue-200">
                            <h4 className={`font-medium mb-2 flex items-center gap-2 ${packTextColors[packId]}`}>
                              <span>{packLogos[packId]}</span> {packNames[packId]} <span className="text-xs text-gray-500">(Pack ID {packId})</span>
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Balance: {packId === 0 ? (packBalance0 ? Number(packBalance0).toString() : '0') :
                                       packId === 1 ? (packBalance1 ? Number(packBalance1).toString() : '0') :
                                       packId === 2 ? (packBalance2 ? Number(packBalance2).toString() : '0') :
                                       (packBalance3 ? Number(packBalance3).toString() : '0')}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="number"
                                value={amountToOpen}
                                onChange={(e) => setAmountToOpen(e.target.value)}
                                min="1"
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                placeholder="Amount"
                              />
                            </div>
                            <button
                              onClick={() => handleOpenPack(packId)}
                              disabled={!isConnected || isOpeningPack || isWaitingForTransaction || !amountToOpen}
                              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                            >
                              {isOpeningPack || isWaitingForTransaction ? 'Opening...' : 'Open Pack'}
                            </button>
                          </div>
                        ))}
                      </div>
                      {openPackData && (
                        <p className="text-sm text-blue-600 mt-4">
                          Transaction: {openPackData}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <span>{erc20Logo}</span> {erc20Name}
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {erc20Balance ? formatEther(erc20Balance) : '0'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      {[0, 1, 2, 3, 4].map((id) => (
                        <div key={id} className="bg-gray-50 rounded-lg p-4">
                          <h3 className={`font-medium mb-2 flex items-center gap-2 ${erc1155Colors[id]}`}>
                            <span>🎍</span> {erc1155Name} ({erc1155Ids[id]})
                          </h3>
                          <p className={`text-2xl font-bold ${erc1155Colors[id]}`}>
                            {id === 0 ? (erc1155Balance0 ? Number(erc1155Balance0).toString() : '0') :
                             id === 1 ? (erc1155Balance1 ? Number(erc1155Balance1).toString() : '0') :
                             id === 2 ? (erc1155Balance2 ? Number(erc1155Balance2).toString() : '0') :
                             id === 3 ? (erc1155Balance3 ? Number(erc1155Balance3).toString() : '0') :
                             (erc1155Balance4 ? Number(erc1155Balance4).toString() : '0')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pack Opened Modal */}
      <PackOpenedModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        eventData={packOpenedEvent} 
      />
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
