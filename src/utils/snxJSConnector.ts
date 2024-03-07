import { Signer } from 'ethers';
import { Coins } from 'thales-utils';
import chainedSpeedMarketsAMMContract from './contracts/chainedSpeedMarketsAMMContract';
import collateralContract from './contracts/collateralContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import priceFeedContract from './contracts/priceFeedContract';
import speedMarketsAMMContract from './contracts/speedMarketsAMMContract';
import speedMarketsDataContract from './contracts/speedMarketsAMMDataContract';
import { getContract } from 'viem';

type ViemContract = { abi: any; address: string; read: any; write: any };

type SnxJSConnector = {
    initialized: boolean;
    client: any | undefined;
    signer: Signer | undefined;
    collateral?: ViemContract;
    multipleCollateral?: Record<Coins, ViemContract | undefined>;
    priceFeedContract?: ViemContract;
    speedMarketsAMMContract?: ViemContract;
    chainedSpeedMarketsAMMContract?: ViemContract;
    speedMarketsDataContract?: ViemContract;
    setContractSettings: (contractSettings: any) => void;
};

// @ts-ignore
const snxJSConnector: SnxJSConnector = {
    initialized: false,

    setContractSettings: function (contractSettings: any) {
        this.initialized = true;
        this.signer = contractSettings.signer;
        this.client = contractSettings.client;
        this.collateral = conditionalInitializeContract(collateralContract, contractSettings);
        this.multipleCollateral = {
            sUSD: conditionalInitializeContract(multipleCollateral.sUSD, contractSettings),
            DAI: conditionalInitializeContract(multipleCollateral.DAI, contractSettings),
            USDC: conditionalInitializeContract(multipleCollateral.USDC, contractSettings),
            USDCe: conditionalInitializeContract(multipleCollateral.USDCe, contractSettings),
            USDbC: conditionalInitializeContract(multipleCollateral.USDbC, contractSettings),
            USDT: conditionalInitializeContract(multipleCollateral.USDT, contractSettings),
            OP: conditionalInitializeContract(multipleCollateral.OP, contractSettings),
            WETH: conditionalInitializeContract(multipleCollateral.WETH, contractSettings),
            ETH: conditionalInitializeContract(multipleCollateral.ETH, contractSettings),
            ARB: conditionalInitializeContract(multipleCollateral.ARB, contractSettings),
            BUSD: conditionalInitializeContract(multipleCollateral.BUSD, contractSettings),
        };

        this.priceFeedContract = conditionalInitializeContract(priceFeedContract, contractSettings);
        this.speedMarketsAMMContract = conditionalInitializeContract(speedMarketsAMMContract, contractSettings);
        this.chainedSpeedMarketsAMMContract = conditionalInitializeContract(
            chainedSpeedMarketsAMMContract,
            contractSettings
        );
        this.speedMarketsDataContract = conditionalInitializeContract(speedMarketsDataContract, contractSettings);
    },
};

const conditionalInitializeContract = (contract: any, contractSettings: any) => {
    const networkId = contractSettings.networkId || 1;
    const abi = contract.abi;
    return contract.addresses[networkId] !== 'TBD'
        ? (getContract({
              abi: abi,
              address: contract.addresses[networkId],
              client: contractSettings.client,
          }) as ViemContract)
        : undefined;
};

export default snxJSConnector;
