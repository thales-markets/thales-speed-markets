import { NetworkId } from 'thales-utils';
import { CRYPTO_CURRENCY_MAP } from './currency';
import { Address } from 'viem';

export const PRICE_SERVICE_ENDPOINTS = {
    testnet: 'https://hermes.pyth.network',
    mainnet: 'https://hermes.pyth.network',
};

// You can find the ids of prices at https://pyth.network/developers/price-feed-ids#pyth-evm-mainnet
export const PRICE_ID = {
    testnet: {
        [CRYPTO_CURRENCY_MAP.ETH]: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD price id in testnet
        [CRYPTO_CURRENCY_MAP.BTC]: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD price id in testnet
    },
    mainnet: {
        [CRYPTO_CURRENCY_MAP.ETH]: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD price id in mainnet
        [CRYPTO_CURRENCY_MAP.BTC]: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD price id in mainnet
    },
};

export const CONNECTION_TIMEOUT_MS = 15000;

// You can find at https://docs.pyth.network/price-feeds/contract-addresses/evm
export const PYTH_CONTRACT_ADDRESS = {
    [NetworkId.OptimismMainnet]: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C' as Address,
    [NetworkId.Arbitrum]: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C' as Address,
    [NetworkId.Base]: '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a' as Address,
    [NetworkId.PolygonMainnet]: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C' as Address,
    [NetworkId.ZkSync]: '0xf087c864AEccFb6A2Bf1Af6A0382B0d0f6c5D834' as Address,
    [NetworkId.ZkSyncSepolia]: '0x056f829183Ec806A78c26C98961678c24faB71af' as Address,
    [NetworkId.BlastSepolia]: '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729' as Address,
    [NetworkId.OptimismSepolia]: '0x0708325268dF9F66270F1401206434524814508b' as Address,
};

export const PYTH_CURRENCY_DECIMALS = 8;

export const SUPPORTED_ASSETS = [CRYPTO_CURRENCY_MAP.BTC, CRYPTO_CURRENCY_MAP.ETH];
