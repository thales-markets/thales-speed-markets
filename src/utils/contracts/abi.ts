import { SupportedNetwork } from 'types/network';

export const getContarctAbi = (contract: any, networkId: SupportedNetwork) => {
    return contract.abis && contract.abis[networkId] ? contract.abis[networkId] : contract.abi;
};
