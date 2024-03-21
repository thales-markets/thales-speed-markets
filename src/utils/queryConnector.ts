import { QueryClient } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';
import { QueryConfig } from 'types/network';

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

export const refetchUserProfileQueries = (walletAddress: string, queryConfig: QueryConfig) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Profile.Data(walletAddress, queryConfig) });
};

export const refetchBalances = (walletAddress: string, queryConfig: QueryConfig) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WalletBalances.StableCoinBalance(walletAddress, queryConfig),
    });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WalletBalances.MultipleCollateral(walletAddress, queryConfig),
    });
};

export const refetchSpeedMarketsLimits = (isChained: boolean, queryConfig: QueryConfig, walletAddress?: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.Markets.ChainedSpeedMarketsLimits(queryConfig, walletAddress)
            : QUERY_KEYS.Markets.SpeedMarketsLimits(queryConfig, walletAddress),
    });
};

export const refetchUserSpeedMarkets = (isChained: boolean, queryConfig: QueryConfig, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.User.ChainedSpeedMarkets(queryConfig, walletAddress)
            : QUERY_KEYS.User.SpeedMarkets(queryConfig, walletAddress),
    });
};

export const refetchUserResolvedSpeedMarkets = (
    isChained: boolean,
    queryConfig: QueryConfig,
    walletAddress: string
) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.User.ResolvedChainedSpeedMarkets(queryConfig, walletAddress)
            : QUERY_KEYS.User.ResolvedSpeedMarkets(queryConfig, walletAddress),
    });
};

export const refetchActiveSpeedMarkets = (isChained: boolean, queryConfig: QueryConfig) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: isChained
            ? QUERY_KEYS.Markets.ActiveChainedSpeedMarkets(queryConfig)
            : QUERY_KEYS.Markets.ActiveSpeedMarkets(queryConfig),
    });
};

export const refetchPythPrice = (priceId: string, publishTime: number) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Prices.PythPrices(priceId, publishTime) });
};

export default queryConnector;
