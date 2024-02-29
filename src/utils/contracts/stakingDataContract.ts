import { Network } from 'enums/network';

const stakingDataContract = {
    addresses: {
        [Network.Mainnet]: 'TBD',
        [Network.OptimismMainnet]: '0xCc134245424fe9E10A011961451D5AD6Cd0C087C',
        [Network.OptimismGoerli]: '0x87005978e76C7356D1e0a8118DC82eaF52D49FB1',
        [Network.OptimismSepolia]: 'TBD',
        [Network.PolygonMainnet]: 'TBD',
        [Network.Arbitrum]: '0x0D72F9DB9efD3cbd91Ec4C296A01e3Cd5155Cc31',
        [Network.Base]: '0xEB4fBF2C6939787e2b9e00C45115eF90631F637c',
        [Network.ZkSync]: 'TBD',
        [Network.ZkSyncSepolia]: 'TBD',
        [Network.BlastSepolia]: 'TBD',
    },
    abi: [
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: '_escrowThales', type: 'address' }],
            name: 'EscrowThalesChnaged',
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
            inputs: [{ indexed: false, internalType: 'address', name: '_stakingThales', type: 'address' }],
            name: 'StakingThalesChnaged',
            type: 'event',
        },
        {
            constant: false,
            inputs: [],
            name: 'acceptOwnership',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'escrowThales',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'getStakingData',
            outputs: [
                {
                    components: [
                        { internalType: 'bool', name: 'paused', type: 'bool' },
                        { internalType: 'uint256', name: 'periodsOfStaking', type: 'uint256' },
                        { internalType: 'uint256', name: 'lastPeriodTimeStamp', type: 'uint256' },
                        { internalType: 'uint256', name: 'durationPeriod', type: 'uint256' },
                        { internalType: 'uint256', name: 'unstakeDurationPeriod', type: 'uint256' },
                        { internalType: 'uint256', name: 'baseRewardsPool', type: 'uint256' },
                        { internalType: 'uint256', name: 'bonusRewardsPool', type: 'uint256' },
                        { internalType: 'uint256', name: 'totalStakedAmount', type: 'uint256' },
                        { internalType: 'bool', name: 'canClosePeriod', type: 'bool' },
                        { internalType: 'bool', name: 'mergeAccountEnabled', type: 'bool' },
                        { internalType: 'uint256', name: 'totalEscrowBalanceNotIncludedInStaking', type: 'uint256' },
                        { internalType: 'uint256', name: 'totalEscrowedRewards', type: 'uint256' },
                    ],
                    internalType: 'struct StakingData.StakingData',
                    name: '',
                    type: 'tuple',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
            name: 'getUserStakingData',
            outputs: [
                {
                    components: [
                        { internalType: 'uint256', name: 'thalesStaked', type: 'uint256' },
                        { internalType: 'bool', name: 'unstaking', type: 'bool' },
                        { internalType: 'uint256', name: 'lastUnstakeTime', type: 'uint256' },
                        { internalType: 'uint256', name: 'unstakingAmount', type: 'uint256' },
                        { internalType: 'address', name: 'delegatedVolume', type: 'address' },
                        { internalType: 'uint256', name: 'rewards', type: 'uint256' },
                        { internalType: 'uint256', name: 'baseRewards', type: 'uint256' },
                        { internalType: 'uint256', name: 'totalBonus', type: 'uint256' },
                        { internalType: 'uint256', name: 'lastPeriodOfClaimedRewards', type: 'uint256' },
                        { internalType: 'uint256', name: 'escrowedBalance', type: 'uint256' },
                        { internalType: 'uint256', name: 'claimable', type: 'uint256' },
                    ],
                    internalType: 'struct StakingData.UserStakingData',
                    name: '',
                    type: 'tuple',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
            name: 'getUserVestingData',
            outputs: [
                {
                    components: [
                        { internalType: 'uint256', name: 'numberOfPeriods', type: 'uint256' },
                        { internalType: 'uint256', name: 'currentVestingPeriod', type: 'uint256' },
                        { internalType: 'uint256', name: 'lastPeriodTimeStamp', type: 'uint256' },
                        { internalType: 'uint256', name: 'claimable', type: 'uint256' },
                        {
                            components: [
                                { internalType: 'uint256', name: 'amount', type: 'uint256' },
                                { internalType: 'uint256', name: 'vesting_period', type: 'uint256' },
                            ],
                            internalType: 'struct EscrowThales.VestingEntry[]',
                            name: 'vestingEntries',
                            type: 'tuple[]',
                        },
                    ],
                    internalType: 'struct StakingData.UserVestingData',
                    name: '',
                    type: 'tuple',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'initialize',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'lastPauseTime',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'nominateNewOwner',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'nominatedOwner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'owner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'paused',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'address', name: '_escrowThales', type: 'address' }],
            name: 'setEscrowThales',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'setOwner',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'bool', name: '_paused', type: 'bool' }],
            name: 'setPaused',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'address', name: '_stakingThales', type: 'address' }],
            name: 'setStakingThales',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'stakingThales',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: false,
            inputs: [{ internalType: 'address', name: 'proxyAddress', type: 'address' }],
            name: 'transferOwnershipAtInit',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export default stakingDataContract;
