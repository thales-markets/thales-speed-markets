import { PaymasterMode } from '@biconomy/paymaster';
import biconomyConnector from './biconomyWallet';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import {
    concat,
    createWalletClient,
    encodeFunctionData,
    erc20Abi,
    http,
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
import { RPC_LIST } from 'constants/network';
import chainedSpeedMarketsAMMContract from './contracts/chainedSpeedMarketsAMMContract';
import erc20Contract from './contracts/collateralContract';

export const executeBiconomyTransactionWithConfirmation = async (
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

        const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
            paymasterServiceData: {
                mode: PaymasterMode.ERC20,
                preferredToken: collateral,
            },
        });

        const {
            receipt: { transactionHash },
        } = await wait();

        return transactionHash;
    }
};

export const executeBiconomyTransaction = async (
    networkId: SupportedNetwork,
    collateral: string,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any
): Promise<any | undefined> => {
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

        const sessionKeyPrivKey = window.localStorage.getItem('sessionPKey');
        const validUntil = window.localStorage.getItem('seassionValidUntil');

        const dateUntilValid = new Date(Number(validUntil) * 1000);
        const nowDate = new Date();

        if (!validUntil || Number(nowDate) > Number(dateUntilValid)) {
            biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
            const transactionArray = await getCreateSessionTxs(
                biconomyConnector.wallet.biconomySmartAccountConfig.chainId,
                collateral
            );
            transactionArray.push(transaction);
            const { wait } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
                paymasterServiceData: {
                    mode: PaymasterMode.ERC20,
                    preferredToken: collateral,
                },
            });

            const {
                receipt: { transactionHash },
                success,
            } = await wait();

            console.log('success: ', success);

            if (!success) {
                console.log('remove');
                window.localStorage.removeItem('sessionPKey');
                window.localStorage.removeItem('seassionValidUntil');
            }

            console.log('TX was succesful: ', success);
            console.log('Transaction receipt', transactionHash);

            return transactionHash;
        } else {
            // try executing via Session module, if its not passing then enable session and execute with signing
            try {
                // generate sessionModule
                const sessionModule = await createSessionKeyManagerModule({
                    moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
                    smartAccountAddress: biconomyConnector.address,
                });
                biconomyConnector.wallet.setActiveValidationModule(sessionModule);

                const sessionAccount = privateKeyToAccount(sessionKeyPrivKey as any);

                const transport = RPC_LIST.CHAINNODE[networkId];

                const sessionSigner = createWalletClient({
                    account: sessionAccount,
                    chain: networkId as any,
                    transport: http(transport),
                });

                const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
                    paymasterServiceData: {
                        mode: PaymasterMode.ERC20,
                        preferredToken: collateral,
                    },
                    params: {
                        sessionSigner: sessionSigner,
                        sessionValidationModule: import.meta.env['VITE_APP_SVM_ADDRESS_' + networkId],
                    },
                });

                const {
                    receipt: { transactionHash },
                    success,
                } = await wait();

                console.log('TX was succesful: ', success);
                console.log('Transaction receipt', transactionHash);

                return transactionHash;
            } catch {
                biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
                const transactionArray = await getCreateSessionTxs(
                    biconomyConnector.wallet.biconomySmartAccountConfig.chainId,
                    collateral
                );
                transactionArray.push(transaction);
                const { wait } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
                    paymasterServiceData: {
                        mode: PaymasterMode.ERC20,
                        preferredToken: collateral,
                    },
                });

                const {
                    receipt: { transactionHash },
                    success,
                } = await wait();

                if (!success) {
                    window.localStorage.removeItem('sessionPKey');
                    window.localStorage.removeItem('seassionValidUntil');
                }

                console.log('TX was succesful: ', success);
                console.log('Transaction receipt', transactionHash);

                return transactionHash;
            }
        }
    }
};

const getCreateSessionTxs = async (networkId: SupportedNetwork, collateralAddress: string) => {
    if (biconomyConnector.wallet) {
        const privateKey = generatePrivateKey();
        const sessionKeyEOA = privateKeyToAccount(privateKey);

        const sessionModule = await createSessionKeyManagerModule({
            moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
            smartAccountAddress: biconomyConnector.address,
        });

        const ammAddress = speedMarketsAMMContract.addresses[networkId];

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
                sessionValidationModule: import.meta.env['VITE_APP_SVM_ADDRESS_' + networkId],
                sessionPublicKey: sessionKeyEOA.address as `0x${string}`,
                sessionKeyData: sessionKeyData as `0x${string}`,
            },
        ]);

        // tx to set session key
        const setSessiontrx = {
            to: DEFAULT_SESSION_KEY_MANAGER_MODULE, // session manager module address
            data: sessionTxData.data,
        };

        const transactionArray = [];

        const encodedCall = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [speedMarketsAMMContract.addresses[networkId], maxUint256],
        });

        const approvalTxSingle = {
            to: collateralAddress,
            data: encodedCall,
        };

        const encodedCallChained = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [chainedSpeedMarketsAMMContract.addresses[networkId], maxUint256],
        });

        const approvalTxChained = {
            to: collateralAddress,
            data: encodedCallChained,
        };

        const approvalTxSingleClaim = {
            to: erc20Contract.addresses[networkId],
            data: encodedCall,
        };

        const approvalTxChainedClaim = {
            to: erc20Contract.addresses[networkId],
            data: encodedCallChained,
        };

        // enableModule session manager module
        try {
            await biconomyConnector.wallet.isModuleEnabled(DEFAULT_SESSION_KEY_MANAGER_MODULE);
        } catch (e) {
            const enableModuleTrx = await biconomyConnector.wallet.getEnableModuleData(
                DEFAULT_SESSION_KEY_MANAGER_MODULE
            );

            transactionArray.push(enableModuleTrx);
        }

        window.localStorage.setItem('sessionPKey', privateKey);
        window.localStorage.setItem('seassionValidUntil', Math.floor(dateUntil.getTime() / 1000).toString());

        transactionArray.push(
            ...[setSessiontrx, approvalTxSingle, approvalTxChained, approvalTxSingleClaim, approvalTxChainedClaim]
        );

        return transactionArray;
    }
    return [];
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
