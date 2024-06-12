import { BiconomySmartAccountV2 } from '@biconomy/account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    setWallet: (wallet: BiconomySmartAccountV2 | null, address: string) => void;
};

// @ts-ignore
const biconomyConnector: BiconomyConnector = {
    setWallet: function (wallet: BiconomySmartAccountV2 | null, address: string) {
        this.wallet = wallet;
        this.address = address;
    },
};

export default biconomyConnector;
