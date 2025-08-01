import { NetworkId } from 'thales-utils';
import { Address } from 'viem';

const speedMarketsAMMCreatorContract = {
    addresses: {
        [NetworkId.OptimismMainnet]: '0xd26EC8c2b9ae45F6753271183f95A1cE69D0E671' as Address,
        [NetworkId.Arbitrum]: '0x905D1732F7639a402B1E0Ffcc2CeD2270Fc16812' as Address,
        [NetworkId.Base]: '0x6B5FE966Ea9B05d8E628E772B0b745734D069983' as Address,
        [NetworkId.PolygonMainnet]: '0xfC7105DA51017F2D990B9Fe68db343ae38060c3b' as Address,
        [NetworkId.OptimismSepolia]: '0xE114677AaBf957d5EeE55f73C6b93fdEDfC849C3' as Address,
    },
    abi: [
        {
            anonymous: false,
            inputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    indexed: false,
                    internalType: 'struct SpeedMarketsAMMCreator.PendingChainedSpeedMarket',
                    name: '_pendingChainedSpeedMarket',
                    type: 'tuple',
                },
            ],
            name: 'AddChainedSpeedMarket',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'delta',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'skewImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    indexed: false,
                    internalType: 'struct SpeedMarketsAMMCreator.PendingSpeedMarket',
                    name: '_pendingSpeedMarket',
                    type: 'tuple',
                },
            ],
            name: 'AddSpeedMarket',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_whitelistAddress',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: '_flag',
                    type: 'bool',
                },
            ],
            name: 'AddedIntoWhitelist',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_pendingSize',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint8',
                    name: '_createdSize',
                    type: 'uint8',
                },
            ],
            name: 'CreateSpeedMarkets',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'string',
                    name: '_errorMessage',
                    type: 'string',
                },
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    indexed: false,
                    internalType: 'struct SpeedMarketsAMMCreator.PendingChainedSpeedMarket',
                    name: '_pendingChainedSpeedMarket',
                    type: 'tuple',
                },
            ],
            name: 'LogChainedError',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bytes',
                    name: '_data',
                    type: 'bytes',
                },
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    indexed: false,
                    internalType: 'struct SpeedMarketsAMMCreator.PendingChainedSpeedMarket',
                    name: '_pendingChainedSpeedMarket',
                    type: 'tuple',
                },
            ],
            name: 'LogChainedErrorData',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'string',
                    name: '_errorMessage',
                    type: 'string',
                },
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'delta',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'skewImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    indexed: false,
                    internalType: 'struct SpeedMarketsAMMCreator.PendingSpeedMarket',
                    name: '_pendingSpeedMarket',
                    type: 'tuple',
                },
            ],
            name: 'LogError',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bytes',
                    name: '_data',
                    type: 'bytes',
                },
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'delta',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'skewImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    indexed: false,
                    internalType: 'struct SpeedMarketsAMMCreator.PendingSpeedMarket',
                    name: '_pendingSpeedMarket',
                    type: 'tuple',
                },
            ],
            name: 'LogErrorData',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'oldOwner',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'newOwner',
                    type: 'address',
                },
            ],
            name: 'OwnerChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'newOwner',
                    type: 'address',
                },
            ],
            name: 'OwnerNominated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'isPaused',
                    type: 'bool',
                },
            ],
            name: 'PauseChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_addressManager',
                    type: 'address',
                },
            ],
            name: 'SetAddressManager',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint64',
                    name: '_maxCreationDelay',
                    type: 'uint64',
                },
            ],
            name: 'SetMaxCreationDelay',
            type: 'event',
        },
        {
            inputs: [],
            name: 'acceptOwnership',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMCreator.ChainedSpeedMarketParams',
                    name: '_params',
                    type: 'tuple',
                },
            ],
            name: 'addPendingChainedSpeedMarket',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'delta',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'skewImpact',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMCreator.SpeedMarketParams',
                    name: '_params',
                    type: 'tuple',
                },
            ],
            name: 'addPendingSpeedMarket',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_whitelistAddress',
                    type: 'address',
                },
                {
                    internalType: 'bool',
                    name: '_flag',
                    type: 'bool',
                },
            ],
            name: 'addToWhitelist',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'addressManager',
            outputs: [
                {
                    internalType: 'contract IAddressManager',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMCreator.ChainedSpeedMarketParams',
                    name: '_chainedMarketParams',
                    type: 'tuple',
                },
                {
                    internalType: 'bytes[]',
                    name: '_priceUpdateData',
                    type: 'bytes[]',
                },
            ],
            name: 'createChainedSpeedMarket',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes[]',
                    name: '_priceUpdateData',
                    type: 'bytes[]',
                },
            ],
            name: 'createFromPendingChainedSpeedMarkets',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes[]',
                    name: '_priceUpdateData',
                    type: 'bytes[]',
                },
            ],
            name: 'createFromPendingSpeedMarkets',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'delta',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'skewImpact',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMCreator.SpeedMarketParams',
                    name: '_speedMarketParams',
                    type: 'tuple',
                },
                {
                    internalType: 'bytes[]',
                    name: '_priceUpdateData',
                    type: 'bytes[]',
                },
            ],
            name: 'createSpeedMarket',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'getPendingChainedSpeedMarketsSize',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'getPendingSpeedMarketsSize',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'initNonReentrant',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_addressManager',
                    type: 'address',
                },
            ],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'lastPauseTime',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'maxCreationDelay',
            outputs: [
                {
                    internalType: 'uint64',
                    name: '',
                    type: 'uint64',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'nominateNewOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'nominatedOwner',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'owner',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'paused',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            name: 'pendingChainedSpeedMarkets',
            outputs: [
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    internalType: 'uint64',
                    name: 'timeFrame',
                    type: 'uint64',
                },
                {
                    internalType: 'uint256',
                    name: 'strikePrice',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'strikePriceSlippage',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: 'collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'buyinAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: 'referrer',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'createdAt',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            name: 'pendingSpeedMarkets',
            outputs: [
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    internalType: 'uint64',
                    name: 'strikeTime',
                    type: 'uint64',
                },
                {
                    internalType: 'uint64',
                    name: 'delta',
                    type: 'uint64',
                },
                {
                    internalType: 'uint256',
                    name: 'strikePrice',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'strikePriceSlippage',
                    type: 'uint256',
                },
                {
                    internalType: 'enum SpeedMarket.Direction',
                    name: 'direction',
                    type: 'uint8',
                },
                {
                    internalType: 'address',
                    name: 'collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'buyinAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: 'referrer',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'skewImpact',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'createdAt',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_addressManager',
                    type: 'address',
                },
            ],
            name: 'setAddressManager',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint64',
                    name: '_maxCreationDelay',
                    type: 'uint64',
                },
            ],
            name: 'setMaxCreationDelay',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'setOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bool',
                    name: '_paused',
                    type: 'bool',
                },
            ],
            name: 'setPaused',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'proxyAddress',
                    type: 'address',
                },
            ],
            name: 'transferOwnershipAtInit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'whitelistedAddresses',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
    ],
};

export default speedMarketsAMMCreatorContract;
