import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { REFERRAL_COOKIE_LIFETIME } from 'constants/ui';
import Cookies from 'universal-cookie';
import { isAddress } from 'viem';

const cookies = new Cookies();

export const setReferralWallet = (referralWallet: string) => {
    if (!isAddress(referralWallet)) {
        return null;
    }

    cookies.set(LOCAL_STORAGE_KEYS.REFERRAL_WALLET, referralWallet, {
        path: '/',
        maxAge: REFERRAL_COOKIE_LIFETIME,
    });

    localStorage.setItem(LOCAL_STORAGE_KEYS.REFERRAL_WALLET, referralWallet);
};

export const getReferralWallet = () => {
    const referralWalletFromCookie = cookies.get(LOCAL_STORAGE_KEYS.REFERRAL_WALLET);
    const referralWalletFromLocalStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.REFERRAL_WALLET);

    if (!referralWalletFromCookie && !referralWalletFromLocalStorage) {
        return null;
    }

    const referralWallet = referralWalletFromCookie || referralWalletFromLocalStorage;

    if (!isAddress(referralWallet)) {
        return null;
    }

    return referralWallet;
};
