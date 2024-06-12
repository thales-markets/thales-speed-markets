import SPAAnchor from 'components/SPAAnchor/SPAAnchor';
import Tooltip from 'components/Tooltip';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { SUPPORTED_ASSETS } from 'constants/pyth';
import ROUTES from 'constants/routes';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { setUserNotifications } from 'redux/modules/user';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { UserChainedPosition, UserPosition } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { getCurrentPrices, getPriceConnection, getPriceId, getSupportedAssetsAsObject } from 'utils/pyth';
import { buildHref } from 'utils/routes';
import { isUserWinner } from 'utils/speedAmm';
import { useAccount, useChainId, useClient } from 'wagmi';

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const networkId = useChainId();
    const client = useClient();
    const { address: walletAddress, isConnected } = useAccount();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());

    const isNetworkSupportedForChained = !isOnlySpeedMarketsSupported(networkId);

    // SINGLE
    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected,
        }
    );

    const userOpenSpeedMarketsData = useMemo(
        () =>
            userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data
                ? userActiveSpeedMarketsDataQuery.data
                : [],
        [userActiveSpeedMarketsDataQuery]
    );

    const activeSpeedMatured = userOpenSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());

    const priceRequests = activeSpeedMatured.map((marketData) => ({
        priceId: getPriceId(networkId, marketData.currencyKey),
        publishTime: millisecondsToSeconds(marketData.maturityDate),
    }));
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, {
        enabled: priceRequests.length > 0,
    });

    // set final prices and claimable status
    const claimableUserSpeedMarkets: UserPosition[] = activeSpeedMatured
        .map((marketData, index) => {
            const finalPrice = pythPricesQueries[index].data || 0;
            const isClaimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
            return {
                ...marketData,
                finalPrice,
                isClaimable,
            };
        })
        .filter((marketData) => marketData.isClaimable);

    // CHAINED
    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected && isNetworkSupportedForChained,
        }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            userChainedSpeedMarketsDataQuery.isSuccess && userChainedSpeedMarketsDataQuery.data
                ? userChainedSpeedMarketsDataQuery.data
                : [],
        [userChainedSpeedMarketsDataQuery]
    );

    // Prepare chained speed markets that are partially matured to fetch Pyth prices
    const partiallyMaturedChainedMarkets = userOpenChainedSpeedMarketsData
        .filter((marketData) => marketData.strikeTimes.some((strikeTime) => strikeTime < Date.now()))
        .map((marketData) => {
            return {
                ...marketData,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const chainedPriceRequests = partiallyMaturedChainedMarkets
        .map((data) =>
            data.strikeTimes
                .filter(
                    (strikeTime, i) => strikeTime < Date.now() && i <= (data.resolveIndex || data.strikeTimes.length)
                )
                .map((strikeTime) => ({
                    priceId: data.pythPriceId,
                    publishTime: millisecondsToSeconds(strikeTime),
                    market: data.market,
                }))
        )
        .flat();
    const chainedPythPricesQueries = usePythPriceQueries(networkId, chainedPriceRequests, {
        enabled: chainedPriceRequests.length > 0,
    });
    const chainedPythPricesWithMarket = chainedPriceRequests.map((request, i) => ({
        market: request.market,
        price: chainedPythPricesQueries[i].data || 0,
    }));

    // Based on Pyth prices set finalPrices, strikePrices, canResolve, isMatured, isClaimable, isUserWinner
    const claimableChainedUserMarkets: UserChainedPosition[] = partiallyMaturedChainedMarkets
        .map((marketData) => {
            const currentPrice = currentPrices[marketData.currencyKey];
            const finalPrices = marketData.strikeTimes.map(
                (_, i) =>
                    chainedPythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.market)[i]
                        ?.price || 0
            );
            const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
                i > 0 ? finalPrices[i - 1] : strikePrice
            );
            const userWonStatuses = marketData.sides.map((side, i) =>
                isUserWinner(side, strikePrices[i], finalPrices[i])
            );
            const canResolve =
                userWonStatuses.some((status) => status === false) ||
                userWonStatuses.every((status) => status !== undefined);

            const lossIndex = userWonStatuses.findIndex((status) => status === false);
            const resolveIndex = canResolve ? (lossIndex > -1 ? lossIndex : marketData.sides.length - 1) : undefined;

            const isClaimable = userWonStatuses.every((status) => status);
            const isMatured = marketData.maturityDate < Date.now();

            return {
                ...marketData,
                strikePrices,
                currentPrice,
                finalPrices,
                canResolve,
                resolveIndex,
                isMatured,
                isClaimable,
                isUserWinner: isClaimable,
            };
        })
        .filter((marketData) => marketData.isClaimable);

    const priceConnection = useMemo(() => getPriceConnection(networkId), [networkId]);

    // Refresh current prices
    useInterval(async () => {
        const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkId, asset));
        const prices: typeof currentPrices = await getCurrentPrices(priceConnection, networkId, priceIds);
        setCurrentPrices({
            ...currentPrices,
            [CRYPTO_CURRENCY_MAP.BTC]: prices[CRYPTO_CURRENCY_MAP.BTC],
            [CRYPTO_CURRENCY_MAP.ETH]: prices[CRYPTO_CURRENCY_MAP.ETH],
        });
    }, secondsToMilliseconds(30));

    useEffect(() => {
        dispatch(
            setUserNotifications({
                single: claimableUserSpeedMarkets.length,
                chained: claimableChainedUserMarkets.length,
            })
        );
    }, [claimableUserSpeedMarkets.length, claimableChainedUserMarkets.length, dispatch]);

    const totalNotifications = claimableUserSpeedMarkets.length + claimableChainedUserMarkets.length;

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
                    <Icon className={`network-icon network-icon--avatar`} />
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
    background: ${(props) => props.theme.button.background.secondary};
    border-radius: 24px;
`;

const Number = styled.span`
    color: ${(props) => props.theme.background.primary};
    font-size: 13px;
    font-weight: 600;
`;

const Bell = styled.i`
    color: ${(props) => props.theme.background.primary};
    font-size: 18px;
    animation: shake 1s linear infinite;

    @keyframes shake {
        0% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(10deg);
        }
        50% {
            transform: rotate(0deg);
        }
        75% {
            transform: rotate(-10deg);
        }
    }
`;

const Icon = styled.i`
    font-size: 26px;
    color: ${(props) => props.theme.textColor.quinary};
`;

export default Notifications;
