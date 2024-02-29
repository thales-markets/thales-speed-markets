import { Network } from 'enums/network';

const binaryOptionsMarketManagerContract = {
    addresses: {
        [Network.Mainnet]: '0x5ed98Ebb66A929758C7Fe5Ac60c979aDF0F4040a',
        [Network.OptimismMainnet]: '0x9227334352A890e51e980BeB7A56Bbdd01499B54',
        [Network.OptimismGoerli]: '0x6a282c7E0656c3E1DAbB2fe0972e8Ea2BD109Fb3',
        [Network.OptimismSepolia]: 'TBD',
        [Network.PolygonMainnet]: '0x85f1B57A1D3Ac7605de3Df8AdA056b3dB9676eCE',
        [Network.Arbitrum]: '0x95d93c88c1b5190fA7FA4350844e0663e5a11fF0',
        [Network.Base]: '0xc62E56E756a3D14ffF838e820F38d845a16D49dE',
        [Network.ZkSync]: 'TBD',
        [Network.ZkSyncSepolia]: 'TBD',
        [Network.BlastSepolia]: 'TBD',
    },
    abi: [
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' }],
            name: 'ExpiryDurationUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'address', name: 'market', type: 'address' },
                { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
                { indexed: true, internalType: 'bytes32', name: 'oracleKey', type: 'bytes32' },
                { indexed: false, internalType: 'uint256', name: 'strikePrice', type: 'uint256' },
                { indexed: false, internalType: 'uint256', name: 'maturityDate', type: 'uint256' },
                { indexed: false, internalType: 'uint256', name: 'expiryDate', type: 'uint256' },
                { indexed: false, internalType: 'address', name: 'up', type: 'address' },
                { indexed: false, internalType: 'address', name: 'down', type: 'address' },
                { indexed: false, internalType: 'bool', name: 'customMarket', type: 'bool' },
                { indexed: false, internalType: 'address', name: 'customOracle', type: 'address' },
            ],
            name: 'MarketCreated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' }],
            name: 'MarketCreationEnabledUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'market', type: 'address' }],
            name: 'MarketExpired',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'contract PositionalMarketManager',
                    name: 'receivingManager',
                    type: 'address',
                },
                { indexed: false, internalType: 'contract PositionalMarket[]', name: 'markets', type: 'address[]' },
            ],
            name: 'MarketsMigrated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'contract PositionalMarketManager',
                    name: 'migratingManager',
                    type: 'address',
                },
                { indexed: false, internalType: 'contract PositionalMarket[]', name: 'markets', type: 'address[]' },
            ],
            name: 'MarketsReceived',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' }],
            name: 'MaxTimeToMaturityUpdated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: false, internalType: 'address', name: 'newOwner', type: 'address' },
            ],
            name: 'OwnerChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'newOwner', type: 'address' }],
            name: 'OwnerNominated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'bool', name: 'isPaused', type: 'bool' }],
            name: 'PauseChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'uint256', name: 'priceBuffer', type: 'uint256' }],
            name: 'PriceBufferChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'manager', type: 'address' }],
            name: 'SetMigratingManager',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: '_positionalMarketFactory', type: 'address' }],
            name: 'SetPositionalMarketFactory',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: '_address', type: 'address' }],
            name: 'SetPriceFeed',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: '_zeroExAddress', type: 'address' }],
            name: 'SetZeroExAddress',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: '_address', type: 'address' }],
            name: 'SetsUSD',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'uint256', name: 'timeframeBuffer', type: 'uint256' }],
            name: 'TimeframeBufferChanged',
            type: 'event',
        },
        { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [
                { internalType: 'uint256', name: 'index', type: 'uint256' },
                { internalType: 'uint256', name: 'pageSize', type: 'uint256' },
            ],
            name: 'activeMarkets',
            outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
            name: 'addWhitelistedAddress',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'oracleKey', type: 'bytes32' },
                { internalType: 'uint256', name: 'maturity', type: 'uint256' },
                { internalType: 'uint256', name: 'strikePrice', type: 'uint256' },
            ],
            name: 'canCreateMarket',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' },
                { internalType: 'string', name: '', type: 'string' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'capitalRequirement',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'oracleKey', type: 'bytes32' },
                { internalType: 'uint256', name: 'strikePrice', type: 'uint256' },
                { internalType: 'uint256', name: 'maturity', type: 'uint256' },
                { internalType: 'uint256', name: 'initialMint', type: 'uint256' },
            ],
            name: 'createMarket',
            outputs: [{ internalType: 'contract IPositionalMarket', name: '', type: 'address' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'customMarketCreationEnabled',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'delta', type: 'uint256' }],
            name: 'decrementTotalDeposited',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'disableWhitelistedAddresses',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'durations',
            outputs: [
                { internalType: 'uint256', name: 'expiryDuration', type: 'uint256' },
                { internalType: 'uint256', name: 'maxTimeToMaturity', type: 'uint256' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'enableWhitelistedAddresses',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address[]', name: 'markets', type: 'address[]' }],
            name: 'expireMarkets',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'delta', type: 'uint256' }],
            name: 'incrementTotalDeposited',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: '_owner', type: 'address' },
                { internalType: 'contract IERC20', name: '_sUSD', type: 'address' },
                { internalType: 'contract IPriceFeed', name: '_priceFeed', type: 'address' },
                { internalType: 'uint256', name: '_expiryDuration', type: 'uint256' },
                { internalType: 'uint256', name: '_maxTimeToMaturity', type: 'uint256' },
            ],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'candidate', type: 'address' }],
            name: 'isActiveMarket',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'candidate', type: 'address' }],
            name: 'isKnownMarket',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'lastPauseTime',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'marketCreationEnabled',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '', type: 'bytes32' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
            ],
            name: 'marketsPerOracleKey',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '', type: 'address' }],
            name: 'marketsStrikePrice',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'uint256', name: 'index', type: 'uint256' },
                { internalType: 'uint256', name: 'pageSize', type: 'uint256' },
            ],
            name: 'maturedMarkets',
            outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'needsTransformingCollateral',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'nominateNewOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'nominatedOwner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'numActiveMarkets',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'numMaturedMarkets',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'onlyWhitelistedAddressesCanCreateMarkets',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'owner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'paused',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'positionalMarketFactory',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'priceBuffer',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'priceFeed',
            outputs: [{ internalType: 'contract IPriceFeed', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
            name: 'removeWhitelistedAddress',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'market', type: 'address' }],
            name: 'resolveMarket',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'value', type: 'uint256' }],
            name: 'reverseTransformCollateral',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'sUSD',
            outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '_expiryDuration', type: 'uint256' }],
            name: 'setExpiryDuration',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bool', name: 'enabled', type: 'bool' }],
            name: 'setMarketCreationEnabled',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '_maxTimeToMaturity', type: 'uint256' }],
            name: 'setMaxTimeToMaturity',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bool', name: '_needsTransformingCollateral', type: 'bool' }],
            name: 'setNeedsTransformingCollateral',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'setOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bool', name: '_paused', type: 'bool' }],
            name: 'setPaused',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_positionalMarketFactory', type: 'address' }],
            name: 'setPositionalMarketFactory',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '_priceBuffer', type: 'uint256' }],
            name: 'setPriceBuffer',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
            name: 'setPriceFeed',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '_timeframeBuffer', type: 'uint256' }],
            name: 'setTimeframeBuffer',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address[]', name: '_whitelistedAddresses', type: 'address[]' }],
            name: 'setWhitelistedAddresses',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
            name: 'setsUSD',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'timeframeBuffer',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'totalDeposited',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'proxyAddress', type: 'address' }],
            name: 'transferOwnershipAtInit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'sender', type: 'address' },
                { internalType: 'address', name: 'receiver', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'transferSusdTo',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'value', type: 'uint256' }],
            name: 'transformCollateral',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '', type: 'address' }],
            name: 'whitelistedAddresses',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
    ],
};

export default binaryOptionsMarketManagerContract;
