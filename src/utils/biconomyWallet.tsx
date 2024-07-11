import { BiconomySmartAccountV2 } from '@biconomy/account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    solanaAddress: string;
    setWallet: (wallet: BiconomySmartAccountV2 | null, address: string, solanaAddress: string) => void;
    resetWallet: () => void;
};

const biconomyConnector: BiconomyConnector = {
    wallet: null,
    address: '',
    solanaAddress: '',
    setWallet: function (wallet: BiconomySmartAccountV2 | null, address: string, solanaAddress: string) {
        this.wallet = wallet;
        this.address = address;
        this.solanaAddress = solanaAddress;
    },
    resetWallet: function () {
        this.wallet = null;
        this.address = '';
        this.solanaAddress = '';
    },
};

export default biconomyConnector;
