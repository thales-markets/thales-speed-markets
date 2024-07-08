import { ZERO_ADDRESS } from 'constants/network';
import { NetworkId } from 'thales-utils';
import { Address } from 'viem';

const sessionValidationContract = {
    addresses: {
        [NetworkId.OptimismMainnet]: '0x2Ef105720df33672120ecDD9CBaeE1D699C62085' as Address,
        [NetworkId.OptimismSepolia]: ZERO_ADDRESS,
        [NetworkId.PolygonMainnet]: '0x2aA3952b82848112638FF5797feC22d74898f75E' as Address,
        [NetworkId.Arbitrum]: '0xAcCEA3a3c1975E94cAed2FE7a4a86C2790898439' as Address,
        [NetworkId.Base]: '0x0f4B636648E0071Afdb8E3c5f97e9F40F80479f9' as Address,
    },
    abi: [
        {
            inputs: [],
            name: 'ECDSAInvalidSignature',
            type: 'error',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'length',
                    type: 'uint256',
                },
            ],
            name: 'ECDSAInvalidSignatureLength',
            type: 'error',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 's',
                    type: 'bytes32',
                },
            ],
            name: 'ECDSAInvalidSignatureS',
            type: 'error',
        },
        {
            inputs: [],
            name: 'chainedSpeedMarkets',
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
            name: 'creatorContract',
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
                    internalType: 'address',
                    name: '_creatorContract',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_speedMarketsAMM',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_chainedSpeedMarkets',
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
            name: 'speedMarketsAMM',
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
                    components: [
                        {
                            internalType: 'address',
                            name: 'sender',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'nonce',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bytes',
                            name: 'initCode',
                            type: 'bytes',
                        },
                        {
                            internalType: 'bytes',
                            name: 'callData',
                            type: 'bytes',
                        },
                        {
                            internalType: 'uint256',
                            name: 'callGasLimit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'verificationGasLimit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'preVerificationGas',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxFeePerGas',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxPriorityFeePerGas',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bytes',
                            name: 'paymasterAndData',
                            type: 'bytes',
                        },
                        {
                            internalType: 'bytes',
                            name: 'signature',
                            type: 'bytes',
                        },
                    ],
                    internalType: 'struct SessionValidationModule.UserOperation',
                    name: '_op',
                    type: 'tuple',
                },
                {
                    internalType: 'bytes32',
                    name: '_userOpHash',
                    type: 'bytes32',
                },
                {
                    internalType: 'bytes',
                    name: '_sessionKeyData',
                    type: 'bytes',
                },
                {
                    internalType: 'bytes',
                    name: '_sessionKeySignature',
                    type: 'bytes',
                },
            ],
            name: 'validateSessionUserOp',
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

export default sessionValidationContract;
