import { TBD_ADDRESS } from 'constants/network';
import { NetworkId } from 'thales-utils';
import { Address } from 'viem';

const speedMarketsAMMContract = {
    addresses: {
        [NetworkId.OptimismMainnet]: '0xE16B8a01490835EC1e76bAbbB3Cadd8921b32001' as Address,
        [NetworkId.OptimismGoerli]: '0x05cD078cECB32d62b304e9028C147bBCdef5Ba24' as Address,
        [NetworkId.OptimismSepolia]: TBD_ADDRESS,
        [NetworkId.PolygonMainnet]: '0x4B1aED25f1877E1E9fBECBd77EeE95BB1679c361' as Address,
        [NetworkId.Arbitrum]: '0x02D0123a89Ae6ef27419d5EBb158d1ED4Cf24FA3' as Address,
        [NetworkId.Base]: '0x85b827d133FEDC36B844b20f4a198dA583B25BAA' as Address,
        [NetworkId.ZkSync]: '0x508F31897c25C436b257E37763E157Cb53D0a6fa' as Address,
        [NetworkId.ZkSyncSepolia]: '0xF0C711f9DBd9937fc43BEa168B3F40614B3D6821' as Address,
        [NetworkId.BlastSepolia]: '0xA2dCFEe657Bc0a71AC31d146366246202eae18a4' as Address,
    },
    abi: [
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_mastercopy',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'contract SpeedMarketsAMMUtils',
                    name: '_speedMarketsAMMUtils',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_addressManager',
                    type: 'address',
                },
            ],
            name: 'AMMAddressesChanged',
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
                    internalType: 'address',
                    name: '_destination',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'AmountTransfered',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_minBuyinAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maxBuyinAmount',
                    type: 'uint256',
                },
            ],
            name: 'AmountsChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_market',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: '_asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_strikeTime',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'int64',
                    name: '_strikePrice',
                    type: 'int64',
                },
                {
                    indexed: false,
                    internalType: 'enum SpeedMarket.Direction',
                    name: '_direction',
                    type: 'uint8',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_buyinAmount',
                    type: 'uint256',
                },
            ],
            name: 'MarketCreated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_market',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: '_asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_strikeTime',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'int64',
                    name: '_strikePrice',
                    type: 'int64',
                },
                {
                    indexed: false,
                    internalType: 'enum SpeedMarket.Direction',
                    name: '_direction',
                    type: 'uint8',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_buyinAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_safeBoxImpact',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_lpFee',
                    type: 'uint256',
                },
            ],
            name: 'MarketCreatedWithFees',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_market',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'enum SpeedMarket.Direction',
                    name: '_result',
                    type: 'uint8',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: '_userIsWinner',
                    type: 'bool',
                },
            ],
            name: 'MarketResolved',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: '_enabled',
                    type: 'bool',
                },
            ],
            name: 'MultiCollateralOnOffRampEnabled',
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
                    name: 'refferer',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'trader',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'amount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'volume',
                    type: 'uint256',
                },
            ],
            name: 'ReferrerPaid',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_safeBoxImpact',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maxSkewImpact',
                    type: 'uint256',
                },
            ],
            name: 'SafeBoxAndMaxSkewImpactChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'pythId',
                    type: 'bytes32',
                },
            ],
            name: 'SetAssetToPythID',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256[]',
                    name: '_timeThresholds',
                    type: 'uint256[]',
                },
                {
                    indexed: false,
                    internalType: 'uint256[]',
                    name: '_lpFees',
                    type: 'uint256[]',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_lpFee',
                    type: 'uint256',
                },
            ],
            name: 'SetLPFeeParams',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maxRiskPerAsset',
                    type: 'uint256',
                },
            ],
            name: 'SetMaxRiskPerAsset',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maxRiskPerAssetAndDirection',
                    type: 'uint256',
                },
            ],
            name: 'SetMaxRiskPerAssetAndDirection',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maximumPriceDelay',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maximumPriceDelayForResolving',
                    type: 'uint256',
                },
            ],
            name: 'SetMaximumPriceDelays',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: '_supported',
                    type: 'bool',
                },
            ],
            name: 'SetSupportedAsset',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_minimalTimeToMaturity',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_maximalTimeToMaturity',
                    type: 'uint256',
                },
            ],
            name: 'TimesChanged',
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
                    internalType: 'uint256',
                    name: 'index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'pageSize',
                    type: 'uint256',
                },
            ],
            name: 'activeMarkets',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'pageSize',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
            ],
            name: 'activeMarketsPerUser',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            stateMutability: 'view',
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
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            name: 'assetToPythId',
            outputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'market',
                    type: 'address',
                },
            ],
            name: 'canResolveMarket',
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
                    internalType: 'enum SpeedMarket.Direction',
                    name: 'direction',
                    type: 'uint8',
                },
                {
                    internalType: 'uint256',
                    name: 'buyinAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'bytes[]',
                    name: 'priceUpdateData',
                    type: 'bytes[]',
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
            name: 'createNewMarket',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
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
                    internalType: 'enum SpeedMarket.Direction',
                    name: 'direction',
                    type: 'uint8',
                },
                {
                    internalType: 'bytes[]',
                    name: 'priceUpdateData',
                    type: 'bytes[]',
                },
                {
                    internalType: 'address',
                    name: 'collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'collateralAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'bool',
                    name: 'isEth',
                    type: 'bool',
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
            name: 'createNewMarketWithDifferentCollateral',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            name: 'currentRiskPerAsset',
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
            inputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
                {
                    internalType: 'enum SpeedMarket.Direction',
                    name: '',
                    type: 'uint8',
                },
            ],
            name: 'currentRiskPerAssetAndDirection',
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
            inputs: [
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
            ],
            name: 'getLengths',
            outputs: [
                {
                    internalType: 'uint256[5]',
                    name: '',
                    type: 'uint256[5]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
            ],
            name: 'getParams',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'bool',
                            name: 'supportedAsset',
                            type: 'bool',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'pythId',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint256',
                            name: 'safeBoxImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint64',
                            name: 'maximumPriceDelay',
                            type: 'uint64',
                        },
                    ],
                    internalType: 'struct ISpeedMarketsAMM.Params',
                    name: '',
                    type: 'tuple',
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
                    internalType: 'contract IERC20Upgradeable',
                    name: '_sUSD',
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
            name: 'lpFee',
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
            inputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            name: 'lpFees',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'marketHasCreatedAtAttribute',
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
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'marketHasFeeAttribute',
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
                    name: 'index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'pageSize',
                    type: 'uint256',
                },
            ],
            name: 'maturedMarkets',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: 'pageSize',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
            ],
            name: 'maturedMarketsPerUser',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'maxBuyinAmount',
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
            inputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            name: 'maxRiskPerAsset',
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
            inputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
                {
                    internalType: 'enum SpeedMarket.Direction',
                    name: '',
                    type: 'uint8',
                },
            ],
            name: 'maxRiskPerAssetAndDirection',
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
            name: 'maxSkewImpact',
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
            name: 'maximalTimeToMaturity',
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
            name: 'maximumPriceDelay',
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
            inputs: [],
            name: 'maximumPriceDelayForResolving',
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
            inputs: [],
            name: 'minBuyinAmount',
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
            name: 'minimalTimeToMaturity',
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
            name: 'multicollateralEnabled',
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
                    internalType: 'address',
                    name: 'market',
                    type: 'address',
                },
                {
                    internalType: 'bytes[]',
                    name: 'priceUpdateData',
                    type: 'bytes[]',
                },
            ],
            name: 'resolveMarket',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_market',
                    type: 'address',
                },
                {
                    internalType: 'int64',
                    name: '_finalPrice',
                    type: 'int64',
                },
            ],
            name: 'resolveMarketAsOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_market',
                    type: 'address',
                },
                {
                    internalType: 'int64',
                    name: '_finalPrice',
                    type: 'int64',
                },
            ],
            name: 'resolveMarketManually',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address[]',
                    name: 'markets',
                    type: 'address[]',
                },
                {
                    internalType: 'int64[]',
                    name: 'finalPrices',
                    type: 'int64[]',
                },
            ],
            name: 'resolveMarketManuallyBatch',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'market',
                    type: 'address',
                },
                {
                    internalType: 'bytes[]',
                    name: 'priceUpdateData',
                    type: 'bytes[]',
                },
                {
                    internalType: 'address',
                    name: 'collateral',
                    type: 'address',
                },
                {
                    internalType: 'bool',
                    name: 'toEth',
                    type: 'bool',
                },
            ],
            name: 'resolveMarketWithOfframp',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address[]',
                    name: 'markets',
                    type: 'address[]',
                },
                {
                    internalType: 'bytes[]',
                    name: 'priceUpdateData',
                    type: 'bytes[]',
                },
            ],
            name: 'resolveMarketsBatch',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'sUSD',
            outputs: [
                {
                    internalType: 'contract IERC20Upgradeable',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'safeBoxImpact',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '_mastercopy',
                    type: 'address',
                },
                {
                    internalType: 'contract SpeedMarketsAMMUtils',
                    name: '_speedMarketsAMMUtils',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_addressManager',
                    type: 'address',
                },
            ],
            name: 'setAMMAddresses',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_minBuyinAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_maxBuyinAmount',
                    type: 'uint256',
                },
            ],
            name: 'setAmounts',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    internalType: 'bytes32',
                    name: 'pythId',
                    type: 'bytes32',
                },
            ],
            name: 'setAssetToPythID',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256[]',
                    name: '_timeThresholds',
                    type: 'uint256[]',
                },
                {
                    internalType: 'uint256[]',
                    name: '_lpFees',
                    type: 'uint256[]',
                },
                {
                    internalType: 'uint256',
                    name: '_lpFee',
                    type: 'uint256',
                },
            ],
            name: 'setLPFeeParams',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    internalType: 'uint256',
                    name: '_maxRiskPerAsset',
                    type: 'uint256',
                },
            ],
            name: 'setMaxRiskPerAsset',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    internalType: 'uint256',
                    name: '_maxRiskPerAssetAndDirection',
                    type: 'uint256',
                },
            ],
            name: 'setMaxRiskPerAssetAndDirection',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint64',
                    name: '_maximumPriceDelay',
                    type: 'uint64',
                },
                {
                    internalType: 'uint64',
                    name: '_maximumPriceDelayForResolving',
                    type: 'uint64',
                },
            ],
            name: 'setMaximumPriceDelays',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bool',
                    name: '_enabled',
                    type: 'bool',
                },
            ],
            name: 'setMultiCollateralOnOffRampEnabled',
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
                    internalType: 'uint256',
                    name: '_safeBoxImpact',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_maxSkewImpact',
                    type: 'uint256',
                },
            ],
            name: 'setSafeBoxAndMaxSkewImpact',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    internalType: 'bool',
                    name: '_supported',
                    type: 'bool',
                },
            ],
            name: 'setSupportedAsset',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_minimalTimeToMaturity',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_maximalTimeToMaturity',
                    type: 'uint256',
                },
            ],
            name: 'setTimes',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'speedMarketMastercopy',
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
            inputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            name: 'supportedAsset',
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
            name: 'timeThresholdsForFees',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '_destination',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'transferAmount',
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
        {
            stateMutability: 'payable',
            type: 'receive',
        },
    ],
    abis: {
        [NetworkId.ZkSync]: [
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
                name: 'AMMAddressesChanged',
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
                        internalType: 'address',
                        name: '_destination',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_amount',
                        type: 'uint256',
                    },
                ],
                name: 'AmountTransfered',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint8',
                        name: 'version',
                        type: 'uint8',
                    },
                ],
                name: 'Initialized',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_minBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_minimalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maximalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maximumPriceDelay',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maximumPriceDelayForResolving',
                        type: 'uint256',
                    },
                ],
                name: 'LimitParamsChanged',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'address',
                        name: '_market',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'address',
                        name: '_user',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: '_asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_strikeTime',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'int64',
                        name: '_strikePrice',
                        type: 'int64',
                    },
                    {
                        indexed: false,
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '_direction',
                        type: 'uint8',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_buyinAmount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_lpFee',
                        type: 'uint256',
                    },
                ],
                name: 'MarketCreatedWithFees',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: '_market',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'int64',
                        name: '_finalPrice',
                        type: 'int64',
                    },
                    {
                        indexed: false,
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '_result',
                        type: 'uint8',
                    },
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: '_userIsWinner',
                        type: 'bool',
                    },
                ],
                name: 'MarketResolved',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: '_enabled',
                        type: 'bool',
                    },
                ],
                name: 'MultiCollateralOnOffRampEnabled',
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
                        name: 'refferer',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'address',
                        name: 'trader',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'volume',
                        type: 'uint256',
                    },
                ],
                name: 'ReferrerPaid',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxSkewImpact',
                        type: 'uint256',
                    },
                ],
                name: 'SafeBoxAndMaxSkewImpactChanged',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'pythId',
                        type: 'bytes32',
                    },
                ],
                name: 'SetAssetToPythID',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256[]',
                        name: '_timeThresholds',
                        type: 'uint256[]',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256[]',
                        name: '_lpFees',
                        type: 'uint256[]',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_lpFee',
                        type: 'uint256',
                    },
                ],
                name: 'SetLPFeeParams',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxRiskPerAsset',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxRiskPerAssetAndDirection',
                        type: 'uint256',
                    },
                ],
                name: 'SetMaxRisks',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: '_supported',
                        type: 'bool',
                    },
                ],
                name: 'SetSupportedAsset',
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
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                ],
                name: 'activeMarkets',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address',
                    },
                ],
                name: 'activeMarketsPerUser',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
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
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'assetToPythId',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                ],
                name: 'canResolveMarket',
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
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'direction',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'buyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
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
                name: 'createNewMarket',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
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
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'direction',
                        type: 'uint8',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                    {
                        internalType: 'address',
                        name: 'collateral',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'collateralAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bool',
                        name: 'isEth',
                        type: 'bool',
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
                name: 'createNewMarketWithDifferentCollateral',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'currentRiskPerAsset',
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
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '',
                        type: 'uint8',
                    },
                ],
                name: 'currentRiskPerAssetAndDirection',
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
                name: 'getAvailableAmountForNewMarkets',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'availableAmount',
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
                        name: 'user',
                        type: 'address',
                    },
                ],
                name: 'getLengths',
                outputs: [
                    {
                        internalType: 'uint256[5]',
                        name: '',
                        type: 'uint256[5]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                ],
                name: 'getParams',
                outputs: [
                    {
                        components: [
                            {
                                internalType: 'bool',
                                name: 'supportedAsset',
                                type: 'bool',
                            },
                            {
                                internalType: 'bytes32',
                                name: 'pythId',
                                type: 'bytes32',
                            },
                            {
                                internalType: 'uint256',
                                name: 'safeBoxImpact',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint64',
                                name: 'maximumPriceDelay',
                                type: 'uint64',
                            },
                        ],
                        internalType: 'struct ISpeedMarkets.Params',
                        name: '',
                        type: 'tuple',
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
                        internalType: 'contract IERC20Upgradeable',
                        name: '_sUSD',
                        type: 'address',
                    },
                ],
                name: 'initialize',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                ],
                name: 'isUserWinnerForMarket',
                outputs: [
                    {
                        internalType: 'bool',
                        name: 'isWinner',
                        type: 'bool',
                    },
                ],
                stateMutability: 'view',
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
                name: 'lpFee',
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
                inputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256',
                    },
                ],
                name: 'lpFees',
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
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                ],
                name: 'maturedMarkets',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address',
                    },
                ],
                name: 'maturedMarketsPerUser',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'maxBuyinAmount',
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
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'maxRiskPerAsset',
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
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '',
                        type: 'uint8',
                    },
                ],
                name: 'maxRiskPerAssetAndDirection',
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
                name: 'maxSkewImpact',
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
                name: 'maximalTimeToMaturity',
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
                name: 'maximumPriceDelay',
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
                inputs: [],
                name: 'maximumPriceDelayForResolving',
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
                inputs: [],
                name: 'minBuyinAmount',
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
                name: 'minimalTimeToMaturity',
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
                name: 'multicollateralEnabled',
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
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                ],
                name: 'resolveMarket',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '_market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'int64',
                        name: '_finalPrice',
                        type: 'int64',
                    },
                ],
                name: 'resolveMarketAsOwner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '_market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'int64',
                        name: '_finalPrice',
                        type: 'int64',
                    },
                ],
                name: 'resolveMarketManually',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32[]',
                        name: 'markets',
                        type: 'bytes32[]',
                    },
                    {
                        internalType: 'int64[]',
                        name: 'finalPrices',
                        type: 'int64[]',
                    },
                ],
                name: 'resolveMarketManuallyBatch',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                    {
                        internalType: 'address',
                        name: 'collateral',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'toEth',
                        type: 'bool',
                    },
                ],
                name: 'resolveMarketWithOfframp',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32[]',
                        name: 'markets',
                        type: 'bytes32[]',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                ],
                name: 'resolveMarketsBatch',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [],
                name: 'sUSD',
                outputs: [
                    {
                        internalType: 'contract IERC20Upgradeable',
                        name: '',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'safeBoxImpact',
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
                inputs: [
                    {
                        internalType: 'address',
                        name: '_addressManager',
                        type: 'address',
                    },
                ],
                name: 'setAMMAddresses',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'pythId',
                        type: 'bytes32',
                    },
                ],
                name: 'setAssetToPythID',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256[]',
                        name: '_timeThresholds',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint256[]',
                        name: '_lpFees',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint256',
                        name: '_lpFee',
                        type: 'uint256',
                    },
                ],
                name: 'setLPFeeParams',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: '_minBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_minimalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maximalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint64',
                        name: '_maximumPriceDelay',
                        type: 'uint64',
                    },
                    {
                        internalType: 'uint64',
                        name: '_maximumPriceDelayForResolving',
                        type: 'uint64',
                    },
                ],
                name: 'setLimitParams',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxRiskPerAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxRiskPerAssetAndDirection',
                        type: 'uint256',
                    },
                ],
                name: 'setMaxRisks',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bool',
                        name: '_enabled',
                        type: 'bool',
                    },
                ],
                name: 'setMultiCollateralOnOffRampEnabled',
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
                        internalType: 'uint256',
                        name: '_safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxSkewImpact',
                        type: 'uint256',
                    },
                ],
                name: 'setSafeBoxAndMaxSkewImpact',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bool',
                        name: '_supported',
                        type: 'bool',
                    },
                ],
                name: 'setSupportedAsset',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'speedMarket',
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
                        internalType: 'int64',
                        name: 'strikePrice',
                        type: 'int64',
                    },
                    {
                        internalType: 'int64',
                        name: 'finalPrice',
                        type: 'int64',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'direction',
                        type: 'uint8',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'result',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'buyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bool',
                        name: 'resolved',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lpFee',
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
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'supportedAsset',
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
                name: 'timeThresholdsForFees',
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
                name: 'totalCollateralizedAmount',
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
                inputs: [
                    {
                        internalType: 'address',
                        name: '_destination',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: '_amount',
                        type: 'uint256',
                    },
                ],
                name: 'transferAmount',
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
            {
                stateMutability: 'payable',
                type: 'receive',
            },
        ],
        [NetworkId.ZkSyncSepolia]: [
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
                name: 'AMMAddressesChanged',
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
                        internalType: 'address',
                        name: '_destination',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_amount',
                        type: 'uint256',
                    },
                ],
                name: 'AmountTransfered',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint8',
                        name: 'version',
                        type: 'uint8',
                    },
                ],
                name: 'Initialized',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_minBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_minimalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maximalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maximumPriceDelay',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maximumPriceDelayForResolving',
                        type: 'uint256',
                    },
                ],
                name: 'LimitParamsChanged',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'address',
                        name: '_market',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'address',
                        name: '_user',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: '_asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_strikeTime',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'int64',
                        name: '_strikePrice',
                        type: 'int64',
                    },
                    {
                        indexed: false,
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '_direction',
                        type: 'uint8',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_buyinAmount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_lpFee',
                        type: 'uint256',
                    },
                ],
                name: 'MarketCreatedWithFees',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: '_market',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'int64',
                        name: '_finalPrice',
                        type: 'int64',
                    },
                    {
                        indexed: false,
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '_result',
                        type: 'uint8',
                    },
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: '_userIsWinner',
                        type: 'bool',
                    },
                ],
                name: 'MarketResolved',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: '_enabled',
                        type: 'bool',
                    },
                ],
                name: 'MultiCollateralOnOffRampEnabled',
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
                        name: 'refferer',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'address',
                        name: 'trader',
                        type: 'address',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'volume',
                        type: 'uint256',
                    },
                ],
                name: 'ReferrerPaid',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxSkewImpact',
                        type: 'uint256',
                    },
                ],
                name: 'SafeBoxAndMaxSkewImpactChanged',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'pythId',
                        type: 'bytes32',
                    },
                ],
                name: 'SetAssetToPythID',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256[]',
                        name: '_timeThresholds',
                        type: 'uint256[]',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256[]',
                        name: '_lpFees',
                        type: 'uint256[]',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_lpFee',
                        type: 'uint256',
                    },
                ],
                name: 'SetLPFeeParams',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxRiskPerAsset',
                        type: 'uint256',
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_maxRiskPerAssetAndDirection',
                        type: 'uint256',
                    },
                ],
                name: 'SetMaxRisks',
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: '_supported',
                        type: 'bool',
                    },
                ],
                name: 'SetSupportedAsset',
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
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                ],
                name: 'activeMarkets',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address',
                    },
                ],
                name: 'activeMarketsPerUser',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
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
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'assetToPythId',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                ],
                name: 'canResolveMarket',
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
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'direction',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'buyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
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
                name: 'createNewMarket',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
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
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'direction',
                        type: 'uint8',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                    {
                        internalType: 'address',
                        name: 'collateral',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'collateralAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bool',
                        name: 'isEth',
                        type: 'bool',
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
                name: 'createNewMarketWithDifferentCollateral',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'currentRiskPerAsset',
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
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '',
                        type: 'uint8',
                    },
                ],
                name: 'currentRiskPerAssetAndDirection',
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
                name: 'getAvailableAmountForNewMarkets',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'availableAmount',
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
                        name: 'user',
                        type: 'address',
                    },
                ],
                name: 'getLengths',
                outputs: [
                    {
                        internalType: 'uint256[5]',
                        name: '',
                        type: 'uint256[5]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                ],
                name: 'getParams',
                outputs: [
                    {
                        components: [
                            {
                                internalType: 'bool',
                                name: 'supportedAsset',
                                type: 'bool',
                            },
                            {
                                internalType: 'bytes32',
                                name: 'pythId',
                                type: 'bytes32',
                            },
                            {
                                internalType: 'uint256',
                                name: 'safeBoxImpact',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint64',
                                name: 'maximumPriceDelay',
                                type: 'uint64',
                            },
                        ],
                        internalType: 'struct ISpeedMarkets.Params',
                        name: '',
                        type: 'tuple',
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
                        internalType: 'contract IERC20Upgradeable',
                        name: '_sUSD',
                        type: 'address',
                    },
                ],
                name: 'initialize',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                ],
                name: 'isUserWinnerForMarket',
                outputs: [
                    {
                        internalType: 'bool',
                        name: 'isWinner',
                        type: 'bool',
                    },
                ],
                stateMutability: 'view',
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
                name: 'lpFee',
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
                inputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256',
                    },
                ],
                name: 'lpFees',
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
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                ],
                name: 'maturedMarkets',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'index',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pageSize',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address',
                    },
                ],
                name: 'maturedMarketsPerUser',
                outputs: [
                    {
                        internalType: 'bytes32[]',
                        name: '',
                        type: 'bytes32[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'maxBuyinAmount',
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
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'maxRiskPerAsset',
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
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: '',
                        type: 'uint8',
                    },
                ],
                name: 'maxRiskPerAssetAndDirection',
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
                name: 'maxSkewImpact',
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
                name: 'maximalTimeToMaturity',
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
                name: 'maximumPriceDelay',
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
                inputs: [],
                name: 'maximumPriceDelayForResolving',
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
                inputs: [],
                name: 'minBuyinAmount',
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
                name: 'minimalTimeToMaturity',
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
                name: 'multicollateralEnabled',
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
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                ],
                name: 'resolveMarket',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '_market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'int64',
                        name: '_finalPrice',
                        type: 'int64',
                    },
                ],
                name: 'resolveMarketAsOwner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '_market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'int64',
                        name: '_finalPrice',
                        type: 'int64',
                    },
                ],
                name: 'resolveMarketManually',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32[]',
                        name: 'markets',
                        type: 'bytes32[]',
                    },
                    {
                        internalType: 'int64[]',
                        name: 'finalPrices',
                        type: 'int64[]',
                    },
                ],
                name: 'resolveMarketManuallyBatch',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'market',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                    {
                        internalType: 'address',
                        name: 'collateral',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'toEth',
                        type: 'bool',
                    },
                ],
                name: 'resolveMarketWithOfframp',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32[]',
                        name: 'markets',
                        type: 'bytes32[]',
                    },
                    {
                        internalType: 'bytes[]',
                        name: 'priceUpdateData',
                        type: 'bytes[]',
                    },
                ],
                name: 'resolveMarketsBatch',
                outputs: [],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [],
                name: 'sUSD',
                outputs: [
                    {
                        internalType: 'contract IERC20Upgradeable',
                        name: '',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'safeBoxImpact',
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
                inputs: [
                    {
                        internalType: 'address',
                        name: '_addressManager',
                        type: 'address',
                    },
                ],
                name: 'setAMMAddresses',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'pythId',
                        type: 'bytes32',
                    },
                ],
                name: 'setAssetToPythID',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256[]',
                        name: '_timeThresholds',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint256[]',
                        name: '_lpFees',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint256',
                        name: '_lpFee',
                        type: 'uint256',
                    },
                ],
                name: 'setLPFeeParams',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: '_minBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxBuyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_minimalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maximalTimeToMaturity',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint64',
                        name: '_maximumPriceDelay',
                        type: 'uint64',
                    },
                    {
                        internalType: 'uint64',
                        name: '_maximumPriceDelayForResolving',
                        type: 'uint64',
                    },
                ],
                name: 'setLimitParams',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxRiskPerAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxRiskPerAssetAndDirection',
                        type: 'uint256',
                    },
                ],
                name: 'setMaxRisks',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bool',
                        name: '_enabled',
                        type: 'bool',
                    },
                ],
                name: 'setMultiCollateralOnOffRampEnabled',
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
                        internalType: 'uint256',
                        name: '_safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: '_maxSkewImpact',
                        type: 'uint256',
                    },
                ],
                name: 'setSafeBoxAndMaxSkewImpact',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: 'asset',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bool',
                        name: '_supported',
                        type: 'bool',
                    },
                ],
                name: 'setSupportedAsset',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'speedMarket',
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
                        internalType: 'int64',
                        name: 'strikePrice',
                        type: 'int64',
                    },
                    {
                        internalType: 'int64',
                        name: 'finalPrice',
                        type: 'int64',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'direction',
                        type: 'uint8',
                    },
                    {
                        internalType: 'enum SpeedMarkets.Direction',
                        name: 'result',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'buyinAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bool',
                        name: 'resolved',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'safeBoxImpact',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lpFee',
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
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                name: 'supportedAsset',
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
                name: 'timeThresholdsForFees',
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
                name: 'totalCollateralizedAmount',
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
                inputs: [
                    {
                        internalType: 'address',
                        name: '_destination',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: '_amount',
                        type: 'uint256',
                    },
                ],
                name: 'transferAmount',
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
            {
                stateMutability: 'payable',
                type: 'receive',
            },
        ],
    },
};

export default speedMarketsAMMContract;
