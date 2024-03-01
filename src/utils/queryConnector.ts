import QUERY_KEYS from 'constants/queryKeys';
import { QueryClient } from 'react-query';
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
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.User.Notifications(walletAddress, networkId));
};

export const refetchUserProfileQueries = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Profile.Data(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Profile.OpenPositions(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Profile.ClaimablePositions(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Profile.ClosedPositions(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Profile.Trades(walletAddress, networkId));
};

export const refetchBalances = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.WalletBalances.StableCoinBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(
        QUERY_KEYS.WalletBalances.MultipleCollateral(walletAddress, networkId)
    );
};

export const refetchSpeedMarketsLimits = (isChained: boolean, networkId: NetworkId, walletAddress?: string) => {
    queryConnector.queryClient.invalidateQueries(
        isChained
            ? QUERY_KEYS.BinaryOptions.ChainedSpeedMarketsLimits(networkId, walletAddress)
            : QUERY_KEYS.BinaryOptions.SpeedMarketsLimits(networkId, walletAddress)
    );
};

export const refetchUserSpeedMarkets = (isChained: boolean, networkId: NetworkId, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries(
        isChained
            ? QUERY_KEYS.BinaryOptions.UserChainedSpeedMarkets(networkId, walletAddress)
            : QUERY_KEYS.BinaryOptions.UserSpeedMarkets(networkId, walletAddress)
    );
};

export const refetchUserResolvedSpeedMarkets = (isChained: boolean, networkId: NetworkId, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries(
        isChained
            ? QUERY_KEYS.BinaryOptions.UserResolvedChainedSpeedMarkets(networkId, walletAddress)
            : QUERY_KEYS.BinaryOptions.UserResolvedSpeedMarkets(networkId, walletAddress)
    );
};

export const refetchActiveSpeedMarkets = (isChained: boolean, networkId: NetworkId) => {
    isChained
        ? queryConnector.queryClient.invalidateQueries(QUERY_KEYS.BinaryOptions.ActiveChainedSpeedMarkets(networkId))
        : queryConnector.queryClient.invalidateQueries(QUERY_KEYS.BinaryOptions.ActiveSpeedMarkets(networkId));
};

export const refetchPythPrice = (priceId: string, publishTime: number) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Prices.PythPrices(priceId, publishTime));
};

export default queryConnector;
