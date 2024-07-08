import { NetworkId } from 'thales-utils';

export type NetworkParams = {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    iconUrls: string[];
    fraudProofWindow?: number;
    nativeCurrency: {
        symbol: string;
        decimals: number;
    };
};

export type QueryConfig = {
    networkId: SupportedNetwork;
    client: any;
};

export type SupportedNetwork = Exclude<
    NetworkId,
    NetworkId.Mainnet | NetworkId.ZkSync | NetworkId.ZkSyncSepolia | NetworkId.BlastSepolia
>;
