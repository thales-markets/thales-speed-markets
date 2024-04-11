import { IHybridPaymaster, PaymasterFeeQuote, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { PARTICAL_LOGINS_CLASSNAMES } from 'constants/wallet';
import { ParticalTypes } from 'types/wallet';
import { Connector } from 'wagmi';
import biconomyConnector from './biconomyWallet';
import { getNetworkNameByNetworkId } from './network';
import { getCollaterals } from './currency';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { encodeFunctionData } from 'viem';

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
        // const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;

        // // get session key from local storage
        // const sessionKeyPrivKey = window.localStorage.getItem('sessionPKey');

        // console.log('sessionKeyPrivKey', sessionKeyPrivKey);
        // if (!sessionKeyPrivKey) {
        //     console.log('errore');
        // }
        // const sessionSigner = new ethers.Wallet(sessionKeyPrivKey as string);
        // console.log('sessionSigner', sessionSigner);

        // // generate sessionModule
        // const sessionModule = await SessionKeyManagerModule.create({
        //     moduleAddress: managerModuleAddr,
        //     smartAccountAddress: biconomyConnector.wallet.accountAddress as string,
        // });

        // // set active module to sessionModule
        // biconomyConnector.wallet = biconomyConnector.wallet.setActiveValidationModule(sessionModule);
        console.log('populate transaction: ');

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

        const biconomyPaymaster = biconomyConnector.wallet.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
        const userOp = await biconomyConnector.wallet.buildUserOp([transaction]);
        const quotes = await biconomyPaymaster.getPaymasterFeeQuotesOrData(userOp, {
            mode: PaymasterMode.ERC20,
            preferredToken: collateral,
        });

        console.log('quotes: ', quotes);

        const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
            paymasterServiceData: {
                mode: PaymasterMode.ERC20,
                preferredToken: collateral,
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

        return transactionHash;
    }
};

export const getGasFeesForTx = async (
    collateral: string,
    contract: any | undefined,
    methodName: string,
    data?: ReadonlyArray<any>
): Promise<number | undefined> => {
    if (biconomyConnector.wallet && contract) {
        // // get session key from local storage
        // const sessionKeyPrivKey = window.localStorage.getItem('sessionPKey');

        // console.log('sessionKeyPrivKey', sessionKeyPrivKey);
        // if (!sessionKeyPrivKey) {
        //     console.log('errore');
        // }
        // const sessionSigner = new ethers.Wallet(sessionKeyPrivKey as string);
        // console.log('sessionSigner', sessionSigner);

        let populatedTx;
        if (data) {
            populatedTx = await contract.populateTransaction[methodName](...data);
        } else {
            populatedTx = await contract.populateTransaction[methodName]();
        }

        const transaction = {
            to: contract.address,
            data: populatedTx.data,
        };

        // {
        //     skipBundlerGasEstimation: false,
        //     params: {
        //         sessionSigner: sessionSigner,
        //         sessionValidationModule: OVERTIMEVM,
        //     },
        // }

        const userOperation = await biconomyConnector.wallet.buildUserOp([transaction]);

        const biconomyPaymaster = biconomyConnector.wallet.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        const buyFeeQuotesResponse = await biconomyPaymaster.getPaymasterFeeQuotesOrData(userOperation, {
            mode: PaymasterMode.ERC20,
            tokenList: [collateral], // collateral for paying gas
        });

        const feeQuotesBuy = buyFeeQuotesResponse.feeQuotes as PaymasterFeeQuote[];

        return feeQuotesBuy[0] ? feeQuotesBuy[0].maxGasFee : 0;
    }
};

export const getClassNameForParticalLogin = (socialId: ParticalTypes) => {
    const label = PARTICAL_LOGINS_CLASSNAMES.find((item) => item.socialId == socialId)?.className;
    return label ? label : '';
};

export const getOnRamperUrl = (
    apiKey: string,
    walletAddress: string,
    networkId: SupportedNetwork,
    selectedToken: number
) => {
    return `https://buy.onramper.com?apiKey=${apiKey}&mode=buy&onlyCryptos=${
        getCollaterals(networkId)[selectedToken]
    }_${getNetworkNameByNetworkId(networkId, true)}&networkWallets=${getNetworkNameByNetworkId(
        networkId,
        true
    )}:${walletAddress}'&themeName=dark&containerColor=181a20&primaryColor=1D976C&secondaryColor=2b3139&cardColor=2b3139&primaryTextColor=ffffff&secondaryTextColor=848e9c&borderRadius=0.5&wgBorderRadius=1'`;
};

export const getSpecificConnectorFromConnectorsArray = (
    connectors: readonly Connector[],
    name: string,
    particle?: boolean
): Connector | undefined => {
    if (particle) {
        return connectors.find((connector: any) => connector?.type == name);
    }
    return connectors.find((connector: any) => connector.id == name);
};
