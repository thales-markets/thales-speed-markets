import { BiconomySmartAccountV2 } from '@biconomy/account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    solanaAddress: string;
    setWallet: (wallet: BiconomySmartAccountV2 | null, address: string, solanaAddress: string) => void;
};

// @ts-ignore
const biconomyConnector: BiconomyConnector = {
    setWallet: function (wallet: BiconomySmartAccountV2 | null, address: string, solanaAddress: string) {
        this.wallet = wallet;
        this.address = address;
        this.solanaAddress = solanaAddress;
    },
};

export default biconomyConnector;
