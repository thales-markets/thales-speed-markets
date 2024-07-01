import { DEFAULT_SESSION_KEY_MANAGER_MODULE, createSessionKeyManagerModule } from '@biconomy/account';
import { PaymasterMode } from '@biconomy/paymaster';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { addMonths } from 'date-fns';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import {
    Client,
    createPublicClient,
    createWalletClient,
    encodeFunctionData,
    erc20Abi,
    getContract,
    http,
    maxUint256,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import biconomyConnector from './biconomyWallet';
import { getContractAbi } from './contracts/abi';
import chainedSpeedMarketsAMMContract from './contracts/chainedSpeedMarketsAMMContract';
import erc20Contract from './contracts/collateralContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import speedMarketsAMMContract from './contracts/speedMarketsAMMContract';

export const executeBiconomyTransactionWithConfirmation = async (
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

        const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
            paymasterServiceData: {
                mode: PaymasterMode.ERC20,
                preferredToken: collateral,
            },
        });

        const {
            receipt: { transactionHash },
            success,
        } = await wait();

        if (success === 'false') {
            throw new Error('tx failed');
        } else return transactionHash;
    }
};

export const executeBiconomyTransaction = async (
    networkId: SupportedNetwork,
    collateral: string,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any,
    isEth?: boolean,
    buyInAmountParam?: bigint
): Promise<any | undefined> => {
    if (biconomyConnector.wallet && contract) {
        console.log('networkID: ', networkId);
        console.log('collateral: ', collateral);
        console.log('methodName: ', methodName);
        console.log('contract: ', contract);
        console.log('value: ', value);
        console.log('isEth: ', isEth);
        console.log('buyInAmountParam: ', buyInAmountParam);

        const encodedCall = encodeFunctionData({
            abi: getContractAbi(contract, networkId),
            functionName: methodName,
            args: data ? data : ([] as any),
        });

        const transaction = {
            to: contract.address,
            data: encodedCall,
            value,
        };

        const validUntil = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);
        const dateUntilValid = new Date(Number(validUntil) * 1000);
        const nowDate = new Date();

        const createSessionAndExecuteTxs = async () => {
            if (biconomyConnector.wallet) {
                biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
                const transactionArray = await getCreateSessionTxs(
                    biconomyConnector.wallet.biconomySmartAccountConfig.chainId,
                    collateral
                );
                if (isEth) {
                    // swap eth to weth
                    const client = createPublicClient({
                        chain: networkId as any,
                        transport: http(biconomyConnector.wallet?.rpcProvider.transport.url),
                    });

                    const wethContractWithSigner = getContract({
                        abi: multipleCollateral.WETH.abi,
                        address: multipleCollateral.WETH.addresses[networkId],
                        client: client as Client,
                    });

                    const encodedCallWrapEth = encodeFunctionData({
                        abi: wethContractWithSigner.abi,
                        functionName: 'deposit',
                        args: [],
                    });

                    const wrapEthTx = {
                        to: wethContractWithSigner.address,
                        data: encodedCallWrapEth,
                        value: buyInAmountParam,
                    };
                    transactionArray.push(wrapEthTx);
                }
                transactionArray.push(transaction);

                const { wait } = await biconomyConnector.wallet.sendTransaction(
                    transactionArray,
                    isEth
                        ? {}
                        : {
                              paymasterServiceData: {
                                  mode: PaymasterMode.ERC20,
                                  preferredToken: collateral,
                              },
                          }
                );

                const {
                    receipt: { transactionHash },
                    success,
                } = await wait();

                console.log('tx hash: ', transactionHash);
                console.log('success: ', success);

                if (success === 'false') {
                    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);
                    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);
                    throw new Error('tx failed');
                } else {
                    console.log('Transaction receipt', transactionHash);
                    return transactionHash;
                }
            }
        };

        if (!validUntil || Number(nowDate) > Number(dateUntilValid)) {
            const txHash = await createSessionAndExecuteTxs();
            return txHash;
        } else {
            try {
                const sessionSigner = await getSessionSigner(networkId);
                const transactionArray = [];
                if (isEth) {
                    // swap eth to weth
                    const client = createPublicClient({
                        chain: networkId as any,
                        transport: http(biconomyConnector.wallet?.rpcProvider.transport.url),
                    });

                    const wethContractWithSigner = getContract({
                        abi: multipleCollateral.WETH.abi,
                        address: multipleCollateral.WETH.addresses[networkId],
                        client: client as Client,
                    });

                    const encodedCallWrapEth = encodeFunctionData({
                        abi: wethContractWithSigner.abi,
                        functionName: 'deposit',
                        args: [],
                    });

                    const wrapEthTx = {
                        to: wethContractWithSigner.address,
                        data: encodedCallWrapEth,
                        value: buyInAmountParam,
                    };
                    transactionArray.push(wrapEthTx);
                }
                transactionArray.push(transaction);
                const { wait } = await biconomyConnector.wallet.sendTransaction(
                    transactionArray,
                    isEth
                        ? {
                              params: {
                                  sessionSigner: sessionSigner,
                                  sessionValidationModule: import.meta.env['VITE_APP_SVM_ADDRESS_' + networkId],
                              },
                          }
                        : {
                              paymasterServiceData: {
                                  mode: PaymasterMode.ERC20,
                                  preferredToken: collateral,
                              },
                              params: {
                                  sessionSigner: sessionSigner,
                                  sessionValidationModule: import.meta.env['VITE_APP_SVM_ADDRESS_' + networkId],
                              },
                          }
                );

                const {
                    receipt: { transactionHash },
                    success,
                } = await wait();

                console.log('tx hash: ', transactionHash);
                console.log('success: ', success);

                if (success === 'false') {
                    throw new Error('tx failed');
                } else {
                    console.log('Transaction receipt', transactionHash);
                    return transactionHash;
                }
            } catch (e) {
                console.log(e);
                const txHash = await createSessionAndExecuteTxs();
                return txHash;
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

        const dateAfter = new Date();
        const dateUntil = new Date();
        const sixMonths = addMonths(Number(dateUntil), 6);

        const sessionTxData = await sessionModule.createSessionData([
            {
                validUntil: Math.floor(sixMonths.getTime() / 1000),
                validAfter: Math.floor(dateAfter.getTime() / 1000),
                sessionValidationModule: import.meta.env['VITE_APP_SVM_ADDRESS_' + networkId],
                sessionPublicKey: sessionKeyEOA.address as `0x${string}`,
                sessionKeyData: sessionKeyEOA.address as `0x${string}`,
            },
        ]);

        // tx to set session key
        const setSessiontrx = {
            to: DEFAULT_SESSION_KEY_MANAGER_MODULE, // session manager module address
            data: sessionTxData.data,
        };

        const transactionArray = [];

        // enableModule session manager module
        try {
            const enabled = await biconomyConnector.wallet.isModuleEnabled(DEFAULT_SESSION_KEY_MANAGER_MODULE);
            if (!enabled) {
                const enableModuleTrx = await biconomyConnector.wallet.getEnableModuleData(
                    DEFAULT_SESSION_KEY_MANAGER_MODULE
                );

                transactionArray.push(enableModuleTrx);
            }
        } catch (e) {
            const enableModuleTrx = await biconomyConnector.wallet.getEnableModuleData(
                DEFAULT_SESSION_KEY_MANAGER_MODULE
            );

            transactionArray.push(enableModuleTrx);
        }

        window.localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId], privateKey);
        window.localStorage.setItem(
            LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId],
            Math.floor(sixMonths.getTime() / 1000).toString()
        );

        const encodedCall = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [speedMarketsAMMContract.addresses[networkId], maxUint256],
        });

        const encodedCallChained = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [chainedSpeedMarketsAMMContract.addresses[networkId], maxUint256],
        });

        const approvalTxSingle = {
            to: collateralAddress,
            data: encodedCall,
        };

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

        transactionArray.push(
            ...[setSessiontrx, approvalTxSingle, approvalTxChained, approvalTxSingleClaim, approvalTxChainedClaim]
        );

        return transactionArray;
    }
    return [];
};

const getSessionSigner = async (networkId: SupportedNetwork) => {
    // try executing via Session module, if its not passing then enable session and execute with signing
    // generate sessionModule
    const sessionModule = await createSessionKeyManagerModule({
        moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        smartAccountAddress: biconomyConnector.address,
    });
    biconomyConnector.wallet?.setActiveValidationModule(sessionModule);
    const sessionKeyPrivKey = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);

    const sessionAccount = privateKeyToAccount(sessionKeyPrivKey as any);
    const sessionSigner = createWalletClient({
        account: sessionAccount,
        chain: networkId as any,
        transport: http(biconomyConnector.wallet?.rpcProvider.transport.url),
    });
    return sessionSigner;
};

// const hasAllowance = async (networkId: SupportedNetwork, collateralAddress: `0x${string}`) => {
//     // get client to check allowance
//     const client = createPublicClient({
//         chain: networkId as any,
//         transport: http(biconomyConnector.wallet?.rpcProvider.transport.url),
//     });

//     const erc20Instance = getContract({
//         abi: erc20Contract.abi,
//         address: collateralAddress,
//         client: client,
//     });

//     const hasAllowance = await checkAllowance(
//         maxUint256,
//         erc20Instance,
//         biconomyConnector.address,
//         speedMarketsAMMContract.addresses[networkId]
//     );
//     return hasAllowance;
// };

// const getSupportedPaymasterTokensForNetwork = (networkId: SupportedNetwork) => {
//     const collaterals = getCollaterals(networkId);
//     return collaterals.map((coin) => {
//         return multipleCollateral[coin].addresses[networkId];
//     });
// };
