import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { millisecondsToSeconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import CardPositions from 'pages/SpeedMarkets/components/CardPositions';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import useUserResolvedChainedSpeedMarketsQuery from 'queries/speedMarkets/useUserResolvedChainedSpeedMarketsQuery';
import useUserResolvedSpeedMarketsQuery from 'queries/speedMarkets/useUserResolvedSpeedMarketsQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivStart } from 'styles/common';
import { UserHistoryPosition } from 'types/profile';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { mapUserPositionToHistory } from 'utils/position';
import { getPriceId } from 'utils/pyth';
import { isUserWinner } from 'utils/speedAmm';
import { useAccount, useChainId, useClient } from 'wagmi';
import TableHistoricalPositions from './components/TableHistoricalPositions';

type UserHistoricalPositionsProps = {
    currentPrices: { [key: string]: number };
    searchAddress?: string;
    setNumberOfPositions?: React.Dispatch<number>;
};

const UserHistoricalPositions: React.FC<UserHistoricalPositionsProps> = ({
    currentPrices,
    searchAddress,
    setNumberOfPositions,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const { isConnected, address: walletAddress } = useAccount();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [isFilterSingleSelected, setIsFilterSingleSelected] = useState<boolean>(false);
    const [isFilterChainedSelected, setIsFilterChainedSelected] = useState<boolean>(false);

    // SINGLE OPEN(ACTIVE)
    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
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

    const activeSpeedNotMatured: UserHistoryPosition[] = userOpenSpeedMarketsData
        .filter((marketData) => marketData.maturityDate >= Date.now())
        .map((marketData) => ({
            ...mapUserPositionToHistory(marketData),
            currentPrice: currentPrices[marketData.currencyKey],
        }));
    const activeSpeedMatured = userOpenSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());

    const priceRequests = activeSpeedMatured.map((marketData) => ({
        priceId: getPriceId(networkId, marketData.currencyKey),
        publishTime: millisecondsToSeconds(marketData.maturityDate),
    }));
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, {
        enabled: priceRequests.length > 0,
    });

    // set final prices and claimable status
    const maturedUserSpeedMarketsWithPrices: UserHistoryPosition[] = activeSpeedMatured.map((marketData, index) => {
        const finalPrice = pythPricesQueries[index].data || 0;
        const isClaimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
        return {
            ...mapUserPositionToHistory(marketData),
            finalPrices: [finalPrice],
            isClaimable,
        };
    });

    // SINGLE RESOLVED
    const userResolvedSpeedMarketsDataQuery = useUserResolvedSpeedMarketsQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected,
        }
    );

    const userResolvedSpeedMarketsData = useMemo(
        () =>
            userResolvedSpeedMarketsDataQuery.isSuccess && userResolvedSpeedMarketsDataQuery.data
                ? userResolvedSpeedMarketsDataQuery.data
                : [],
        [userResolvedSpeedMarketsDataQuery]
    );

    const userResolvedSpeedMarketsHistoryData = userResolvedSpeedMarketsData.map((marketData) => ({
        ...mapUserPositionToHistory(marketData),
    }));

    // CHAINED OPEN(ACTIVE)
    const isNetworkSupportedForChained = !isOnlySpeedMarketsSupported(networkId);

    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
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

    const chainedWithoutMaturedPositions: UserHistoryPosition[] = userOpenChainedSpeedMarketsData
        .filter((marketData) => marketData.strikeTimes[0] >= Date.now())
        .map((marketData) => ({
            ...marketData,
            currentPrice: currentPrices[marketData.currencyKey],
        }));
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
    const partiallyMaturedWithPrices: UserHistoryPosition[] = partiallyMaturedChainedMarkets.map((marketData) => {
        const currentPrice = currentPrices[marketData.currencyKey];
        const finalPrices = marketData.strikeTimes.map(
            (_, i) =>
                chainedPythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.market)[i]?.price || 0
        );
        const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
            i > 0 ? finalPrices[i - 1] : strikePrice
        );
        const userWonStatuses = marketData.sides.map((side, i) => isUserWinner(side, strikePrices[i], finalPrices[i]));
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
    });

    // CHAINED RESOLVED

    const userResolvedChainedSpeedMarketsDataQuery = useUserResolvedChainedSpeedMarketsQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected && isNetworkSupportedForChained,
        }
    );

    const userResolvedChainedSpeedMarketsData = useMemo(
        () =>
            userResolvedChainedSpeedMarketsDataQuery.isSuccess && userResolvedChainedSpeedMarketsDataQuery.data
                ? userResolvedChainedSpeedMarketsDataQuery.data
                : [],
        [userResolvedChainedSpeedMarketsDataQuery]
    );

    // ALL: (SINGLE=open(not matured + matured) + resolved) + (CHAINED=open(not matured + matured) + resolved)

    const allSingle = activeSpeedNotMatured.concat(
        maturedUserSpeedMarketsWithPrices,
        userResolvedSpeedMarketsHistoryData
    );
    const allUserOpenSpeedMarketsData = isFilterChainedSelected ? [] : allSingle;

    const allChained = chainedWithoutMaturedPositions.concat(
        partiallyMaturedWithPrices,
        userResolvedChainedSpeedMarketsData
    );
    const allUserOpenChainedMarketsData = isFilterSingleSelected ? [] : allChained;

    const sortedUserMarketsData = allUserOpenSpeedMarketsData
        .concat(allUserOpenChainedMarketsData)
        .sort((a, b) => b.createdAt - a.createdAt);

    const isLoading = userActiveSpeedMarketsDataQuery.isLoading || userResolvedSpeedMarketsDataQuery.isLoading;
    userChainedSpeedMarketsDataQuery.isLoading || userResolvedChainedSpeedMarketsDataQuery.isLoading;
    pythPricesQueries.filter((query) => query.isLoading).length > 1;

    const noPositions =
        !isLoading && allUserOpenChainedMarketsData.length === 0 && allUserOpenSpeedMarketsData.length === 0;

    const hasSomePositions = allSingle.length > 0 || allChained.length > 0;

    const positions = noPositions ? dummyPositions : sortedUserMarketsData;

    // Update number of positions
    useEffect(() => {
        if (setNumberOfPositions) {
            setNumberOfPositions(noPositions ? 0 : positions.length);
        }
    }, [setNumberOfPositions, positions.length, noPositions]);

    return (
        <Container>
            {hasSomePositions && (
                <Filters>
                    <Filter
                        $isSelected={isFilterSingleSelected}
                        onClick={() => {
                            setIsFilterSingleSelected(!isFilterSingleSelected);
                            setIsFilterChainedSelected(false);
                        }}
                    >
                        {t('speed-markets.single')}
                    </Filter>
                    <Filter
                        $isSelected={isFilterChainedSelected}
                        onClick={() => {
                            setIsFilterSingleSelected(false);
                            setIsFilterChainedSelected(!isFilterChainedSelected);
                        }}
                    >
                        {t('speed-markets.chained.label')}
                    </Filter>
                </Filters>
            )}
            <PositionsWrapper $noPositions={noPositions}>
                {isLoading ? (
                    <SimpleLoader />
                ) : isMobile ? (
                    <CardPositions isMixedPositions isHistory isHorizontal positions={positions} />
                ) : (
                    <TableHistoricalPositions data={positions as UserHistoryPosition[]} />
                )}
            </PositionsWrapper>
            {noPositions && (
                <NoPositionsText>
                    {t('speed-markets.user-positions.no-positions', {
                        status: t('common.all').toLowerCase(),
                    })}
                </NoPositionsText>
            )}
        </Container>
    );
};

const dummyPositions: UserHistoryPosition[] = [
    {
        user: '',
        market: '0x1',
        currencyKey: 'BTC',
        sides: [Positions.UP],
        strikePrices: [25000],
        strikeTimes: [1684483200000],
        maturityDate: 1684483200000,
        paid: 100,
        payout: 15,
        payoutMultiplier: 0,
        currentPrice: 0,
        finalPrices: [3000],
        canResolve: false,
        resolveIndex: 0,
        isMatured: false,
        isClaimable: false,
        isUserWinner: false,
        isResolved: false,
        createdAt: Date.now(),
    },
    {
        user: '',
        market: '0x2',
        currencyKey: 'BTC',
        sides: [Positions.DOWN],
        strikePrices: [35000],
        strikeTimes: [1684483200000],
        maturityDate: 1684483200000,
        paid: 200,
        payout: 10,
        payoutMultiplier: 0,
        currentPrice: 0,
        finalPrices: [3000],
        canResolve: false,
        resolveIndex: 0,
        isMatured: false,
        isClaimable: false,
        isUserWinner: false,
        isResolved: false,
        createdAt: Date.now(),
    },
];

const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const Filters = styled(FlexDivStart)`
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-bottom: 13px;
    }
`;

const Filter = styled(FlexDivCentered)<{ $isSelected: boolean }>`
    width: 100px;
    height: 40px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 800;
    line-height: 100%;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
    text-transform: uppercase;
`;

const PositionsWrapper = styled.div<{ $noPositions?: boolean }>`
    position: relative;
    min-height: 200px;
    width: 100%;
    ${(props) => (props.$noPositions ? 'filter: blur(10px);' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: unset;
    }
`;

const NoPositionsText = styled.span`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 15px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.secondary};
    min-width: max-content;
`;

export default UserHistoricalPositions;
