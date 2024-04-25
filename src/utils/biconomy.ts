import { PaymasterMode } from '@biconomy/paymaster';
import biconomyConnector from './biconomyWallet';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import {
    concat,
    encodeFunctionData,
    erc20Abi,
    maxUint256,
    pad,
    parseEther,
    slice,
    toFunctionSelector,
    toHex,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { DEFAULT_SESSION_KEY_MANAGER_MODULE, createSessionKeyManagerModule } from '@biconomy/account';

import speedMarketsAMMContract from './contracts/speedMarketsAMMContract';

const abiSVMAddress = '0x9bfe7FE082695ac3Ff1833B6f764Cc870901b042';

export const executeBiconomyTransaction = async (
    collateral: string,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any
): Promise<any | undefined> => {
    console.log('collateral: ', collateral);
    console.log('methodName: ', methodName);
    console.log('contract: ', contract);
    console.log('data: ', data);
    if (biconomyConnector.wallet && contract) {
        const encodedCall = encodeFunctionData({
            abi: contract.abi,
            functionName: methodName,
            args: data ? data : ([] as any),
        });

        const transaction = {
            to: contract.address,
            data: encodedCall,
            value,
        };

        // generate sessionModule
        // const sessionModule = await createSessionKeyManagerModule({
        //     moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        //     smartAccountAddress: biconomyConnector.address,
        // });

        // biconomyConnector.wallet.setActiveValidationModule(sessionModule);
        // const sessionAccount = privateKeyToAccount(sessionKeyPrivKey as any);

        // const sessionSigner = createWalletClient({
        //     account: sessionAccount,
        //     chain: optimism,
        //     transport: http(RPC_LIST.CHAINNODE[NetworkId.OptimismMainnet]),
        // });

        // console.log(sessionModule);

        const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
            paymasterServiceData: {
                mode: PaymasterMode.ERC20,
                preferredToken:
                    collateral === '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9'
                        ? '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
                        : collateral,
            },
            // params: {
            //     sessionSigner: sessionSigner,
            //     sessionValidationModule: abiSVMAddress,
            // },
        });

        const {
            receipt: { transactionHash },
            userOpHash,
            success,
            reason,
        } = await wait();

        console.log('TX was succesful: ', success);
        console.log('TX has failed cause of: ', reason);
        console.log('UserOp receipt', userOpHash);
        console.log('Transaction receipt', transactionHash);

        return transactionHash;
    }
};

export const createSession = async (networkId: SupportedNetwork, collateralAddress: string) => {
    try {
        if (biconomyConnector.wallet) {
            // Address of ABI Session Validation Module

            // -----> setMerkle tree tx flow
            // create dapp side session key
            const privateKey = generatePrivateKey();
            const sessionKeyEOA = privateKeyToAccount(privateKey);
            console.log('sessionKeyEOA', sessionKeyEOA);
            // BREWARE JUST FOR DEMO: update local storage with session key
            window.localStorage.setItem('sessionPKey', privateKey);

            // generate sessionModule
            const sessionModule = await createSessionKeyManagerModule({
                moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
                smartAccountAddress: biconomyConnector.address,
            });

            const isEnabled = await biconomyConnector.wallet?.isModuleEnabled(DEFAULT_SESSION_KEY_MANAGER_MODULE);
            console.log('isSessionKeyModuleEnabled', isEnabled);

            const ammAddress = '0xe16b8a01490835ec1e76babbb3cadd8921b32001';

            // get only first 4 bytes for function selector
            const functionSelector = slice(
                toFunctionSelector(
                    'createNewMarketWithDifferentCollateral(bytes32,uint64,uint64,uint8,bytes[],address,uint256,bool,address,uint256)'
                ),
                0,
                4
            );

            // create session key data
            const sessionKeyData = await getABISVMSessionKeyData(sessionKeyEOA.address, {
                destContract: ammAddress, // destination contract to call
                functionSelector: functionSelector, // function selector allowed
                valueLimit: parseEther('0'), // no native value is sent
                // In rules, we make sure that referenceValue is equal to recipient
                rules: [],
            });

            const dateAfter = new Date();
            const dateUntil = new Date();
            dateUntil.setHours(dateAfter.getHours() + 1);

            const sessionTxData = await sessionModule.createSessionData([
                {
                    validUntil: Math.floor(dateUntil.getTime() / 1000),
                    validAfter: Math.floor(dateAfter.getTime() / 1000),
                    sessionValidationModule: abiSVMAddress,
                    sessionPublicKey: sessionKeyEOA.address as `0x${string}`,
                    sessionKeyData: sessionKeyData as `0x${string}`,
                },
            ]);
            console.log('sessionTxData', sessionTxData);

            // tx to set session key
            const setSessiontrx = {
                to: DEFAULT_SESSION_KEY_MANAGER_MODULE, // session manager module address
                data: sessionTxData.data,
            };

            const transactionArray = [];

            transactionArray.push(setSessiontrx);

            const encodedCall = encodeFunctionData({
                abi: erc20Abi,
                functionName: 'approve',
                args: [speedMarketsAMMContract.addresses[networkId], maxUint256],
            });

            const transaction = {
                to: collateralAddress,
                data: encodedCall,
            };

            transactionArray.push(transaction);

            console.log(`send tx`);

            const { wait } = await biconomyConnector.wallet?.sendTransaction(setSessiontrx, {
                paymasterServiceData: {
                    mode: PaymasterMode.ERC20,
                    preferredToken: collateralAddress,
                },
            });

            const {
                receipt: { transactionHash },
                userOpHash,
                success,
                reason,
            } = await wait();

            console.log('TX was succesful: ', success);

            console.log('TX has failed cause of: ', reason);
            console.log('UserOp receipt', userOpHash);
            console.log('Transaction receipt', transactionHash);
        }
    } catch (err: any) {
        console.error(err);
    }
};

interface Rule {
    offset: number;
    condition: number;
    referenceValue: string;
}

interface Permission {
    destContract: string;
    functionSelector: string;
    valueLimit: bigint;
    rules: Rule[];
}

async function getABISVMSessionKeyData(sessionKey: `0x${string}`, permission: Permission): Promise<string> {
    let sessionKeyData = concat([
        sessionKey,
        permission.destContract as `0x${string}`,
        permission.functionSelector as `0x${string}`,
        pad(permission.valueLimit.toString() as `0x${string}`, { size: 16 }),
        pad(toHex(permission.rules.length), { size: 2 }), // this can't be more 2**11 (see below), so uint16 (2 bytes) is enough
    ]);

    for (let i = 0; i < permission.rules.length; i++) {
        sessionKeyData = concat([
            sessionKeyData,
            pad(toHex(permission.rules[i].offset), { size: 2 }), // offset is uint16, so there can't be more than 2**16/32 args = 2**11
            pad(toHex(permission.rules[i].condition), { size: 1 }), // uint8
            permission.rules[i].referenceValue as `0x${string}`,
        ]) as `0x${string}`;
    }
    return sessionKeyData;
}
