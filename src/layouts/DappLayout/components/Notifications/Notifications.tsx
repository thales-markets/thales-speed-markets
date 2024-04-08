import SPAAnchor from 'components/SPAAnchor/SPAAnchor';
import Tooltip from 'components/Tooltip';
import ROUTES from 'constants/routes';
import { millisecondsToSeconds } from 'date-fns';
import { Positions } from 'enums/market';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { RootState } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { getPriceId } from 'utils/pyth';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';
import { getIsBiconomy } from 'redux/modules/wallet';
import biconomyConnector from 'utils/biconomyWallet';

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { address: walletAddress, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const isNetworkSupported = !isOnlySpeedMarketsSupported(networkId);

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        {
            enabled: isAppReady && isConnected,
        }
    );
    const speedMarketsNotifications = useMemo(() => {
        if (userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data) {
            return userActiveSpeedMarketsDataQuery.data.filter((marketData) => marketData.claimable).length;
        }
        return 0;
    }, [userActiveSpeedMarketsDataQuery]);

    const userActiveChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        {
            enabled: isAppReady && isConnected && isNetworkSupported,
        }
    );
    const userActiveChainedSpeedMarketsData = useMemo(
        () =>
            userActiveChainedSpeedMarketsDataQuery.isSuccess && userActiveChainedSpeedMarketsDataQuery.data
                ? userActiveChainedSpeedMarketsDataQuery.data
                : [],
        [userActiveChainedSpeedMarketsDataQuery]
    );

    // Prepare active chained speed markets that become matured to fetch Pyth prices
    const maturedChainedMarkets = userActiveChainedSpeedMarketsData
        .filter((marketData) => marketData.isMatured)
        .map((marketData) => {
            const strikeTimes = marketData.strikeTimes.map((strikeTime) => millisecondsToSeconds(strikeTime));
            return {
                ...marketData,
                strikeTimes,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const priceRequests = maturedChainedMarkets
        .map((data) =>
            data.strikeTimes.map((strikeTime) => ({
                priceId: data.pythPriceId,
                publishTime: strikeTime,
                market: data.address,
            }))
        )
        .flat();
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, { enabled: priceRequests.length > 0 });
    const pythPricesWithMarket = priceRequests.map((request, i) => ({
        market: request.market,
        price: pythPricesQueries[i]?.data || 0,
    }));

    // Based on Pyth prices determine if chained position is claimable
    const chainedSpeedMarketsNotifications = maturedChainedMarkets
        .map((marketData) => {
            const finalPrices = marketData.strikeTimes.map(
                (_, i) => pythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.address)[i].price
            );
            const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
                i > 0 ? finalPrices[i - 1] : strikePrice
            );
            const userWonStatuses = marketData.sides.map((side, i) =>
                finalPrices[i] > 0 && strikePrices[i] > 0
                    ? (side === Positions.UP && finalPrices[i] > strikePrices[i]) ||
                      (side === Positions.DOWN && finalPrices[i] < strikePrices[i])
                    : undefined
            );
            const claimable = userWonStatuses.every((status) => status);

            return { ...marketData, finalPrices, claimable };
        })
        .filter((marketData) => marketData.claimable).length;

    const totalNotifications = speedMarketsNotifications + chainedSpeedMarketsNotifications;

    const hasNotifications = totalNotifications > 0;

    return isConnected ? (
        <SPAAnchor href={buildHref(ROUTES.Markets.Profile)}>
            <Container>
                {hasNotifications ? (
                    <Tooltip overlay={t('common.header.notification.tooltip', { count: totalNotifications })}>
                        <Wrapper>
                            <Bell className="icon icon--bell" />
                            <Number>{totalNotifications}</Number>
                        </Wrapper>
                    </Tooltip>
                ) : (
                    <Icon className={`icon icon--user-avatar`} />
                )}
            </Container>
        </SPAAnchor>
    ) : (
        <></>
    );
};

const Container = styled(FlexDivCentered)`
    height: 26px;
    margin-left: 10px;
`;

const Wrapper = styled(FlexDivCentered)`
    width: 42px;
    height: inherit;
    gap: 2px;
    background: ${(props) => props.theme.background.quaternary};
    border-radius: 24px;
`;

const Number = styled.span`
    color: ${(props) => props.theme.background.primary};
    font-size: 13px;
    font-weight: 600;
`;

const Bell = styled.i`
    color: ${(props) => props.theme.background.primary};
    font-size: 13px;
    animation: shake 1s linear infinite;
`;

const Icon = styled.i`
    font-size: 22px;
    color: ${(props) => props.theme.textColor.primary};
`;

export default Notifications;
