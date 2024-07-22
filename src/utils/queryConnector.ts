import { QueryClient } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';

type QueryConnector = {
    queryClient: QueryClient;
    setQueryClient: () => void;
};

// @ts-ignore
const queryConnector: QueryConnector = {
    setQueryClient: function () {
        if (this.queryClient === undefined) {
            this.queryClient = new QueryClient();
        }
    },
};

export const refetchUserNotifications = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.User.Notifications(walletAddress, networkId) });
};

export const refetchUserProfileQueries = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Profile.Data(walletAddress, networkId) });
};

export const refetchBalances = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WalletBalances.StableCoinBalance(walletAddress, networkId),
    });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WalletBalances.MultipleCollateral(walletAddress, networkId),
    });
};

export const refetchSpeedMarketsLimits = (isChained: boolean, networkId: NetworkId, walletAddress?: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.Markets.ChainedSpeedMarketsLimits(networkId, walletAddress)
            : QUERY_KEYS.Markets.SpeedMarketsLimits(networkId, walletAddress),
    });
};

export const refetchUserSpeedMarkets = (isChained: boolean, networkId: NetworkId, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.User.ChainedSpeedMarkets(networkId, walletAddress)
            : QUERY_KEYS.User.SpeedMarkets(networkId, walletAddress),
    });
};

export const refetchUserResolvedSpeedMarkets = (isChained: boolean, networkId: NetworkId, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.User.ResolvedChainedSpeedMarkets(networkId, walletAddress)
            : QUERY_KEYS.User.ResolvedSpeedMarkets(networkId, walletAddress),
    });
};

export const refetchActiveSpeedMarkets = (isChained: boolean, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.Markets.ActiveChainedSpeedMarkets(networkId)
            : QUERY_KEYS.Markets.ActiveSpeedMarkets(networkId),
    });
};

export const refetchPythPrice = (priceId: string, publishTime: number) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Prices.PythPrices(priceId, publishTime) });
};

export const refetchSolanaAddress = (walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.User.Solana(walletAddress) });
};

export default queryConnector;
