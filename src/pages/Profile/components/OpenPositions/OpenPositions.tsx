import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import TileTable from 'components/TileTable/TileTable';
import Tooltip from 'components/Tooltip/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import { orderBy } from 'lodash';
import MaturityDate from 'pages/Profile/components/MaturityDate';
import SharePositionModal from 'pages/SpeedMarkets/components/SharePositionModal';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import { formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { SharePositionData } from 'types/flexCards';
import { UserProfilePosition } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint, getSupportedAssetsAsObject } from 'utils/pyth';
import { isUserWinner } from 'utils/speedAmm';
import { useAccount, useChainId, useClient } from 'wagmi';
import MyPositionAction from '../../../SpeedMarkets/components/MyPositionAction/MyPositionAction';
import { ShareIcon, getDirections } from '../styled-components';
import { getIsBiconomy } from 'redux/modules/wallet';
import biconomyConnector from 'utils/biconomyWallet';
import { UserPosition } from 'types/market';

type OpenPositionsProps = {
    searchAddress: string;
    searchText: string;
};

const OpenPositions: React.FC<OpenPositionsProps> = ({ searchAddress, searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [openTwitterShareModal, setOpenTwitterShareModal] = useState<boolean>(false);
    const [positionsShareData, setPositionShareData] = useState<SharePositionData | null>(null);
    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());

    const priceConnection = useMemo(() => {
        return new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), { timeout: CONNECTION_TIMEOUT_MS });
    }, [networkId]);

    const fetchCurrentPrice = useCallback(async () => {
        const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkId, asset));
        const prices: typeof currentPrices = await getCurrentPrices(priceConnection, networkId, priceIds);
        setCurrentPrices(prices);
    }, [networkId, priceConnection]);

    // Set initial current price
    useEffect(() => {
        fetchCurrentPrice();
    }, [fetchCurrentPrice]);

    // Update current price on every 10 seconds
    useInterval(async () => {
        fetchCurrentPrice();
    }, secondsToMilliseconds(10));

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
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

    const userActiveChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
        {
            enabled: isAppReady && isConnected && !isOnlySpeedMarketsSupported(networkId),
        }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            userActiveChainedSpeedMarketsDataQuery.isSuccess && userActiveChainedSpeedMarketsDataQuery.data
                ? userActiveChainedSpeedMarketsDataQuery.data
                : [],
        [userActiveChainedSpeedMarketsDataQuery]
    );

    // Prepare chained speed markets that are not matured
    const userOpenChainedMarkets = userOpenChainedSpeedMarketsData
        .filter((marketData) => !marketData.isMatured)
        .map((marketData) => {
            return {
                ...marketData,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const priceRequests = userOpenChainedMarkets
        .map((data) =>
            data.strikeTimes
                .filter((strikeTime) => strikeTime < Date.now())
                .map((strikeTime) => ({
                    priceId: data.pythPriceId,
                    publishTime: millisecondsToSeconds(strikeTime),
                    market: data.market,
                }))
        )
        .flat();

    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, { enabled: priceRequests.length > 0 });
    const pythPricesWithMarket = priceRequests.map((request, i) => ({
        market: request.market,
        price: pythPricesQueries[i]?.data || 0,
    }));

    // Based on Pyth prices populate strike prices
    const userOpenChainedSpeedMarketsDataWithPrices = userOpenChainedMarkets.map((marketData) => {
        const finalPrices = marketData.finalPrices.map(
            (_, i) => pythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.market)[i]?.price || 0
        );
        const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
            i === 0 ? strikePrice : finalPrices[i - 1]
        );
        const lastStrikePrice = [...strikePrices].reverse().find((strikePrice) => strikePrice);
        const userWonStatuses = marketData.sides.map((side, i) => isUserWinner(side, strikePrices[i], finalPrices[i]));
        const userLost = userWonStatuses.some((status) => status === false);
        return { ...marketData, strikePrices, userLost, lastStrikePrice };
    });

    const data = useMemo(() => {
        const speedMarketsOpenPositions: UserProfilePosition[] = userOpenSpeedMarketsData
            .filter((marketData) => marketData.maturityDate > Date.now())
            .map((marketData) => {
                return {
                    currencyKey: marketData.currencyKey,
                    strikePrice: marketData.strikePrice,
                    leftPrice: 0,
                    rightPrice: 0,
                    finalPrice: marketData.finalPrice || 0,
                    payout: marketData.payout,
                    maturityDate: marketData.maturityDate,
                    expiryDate: marketData.maturityDate,
                    market: marketData.market,
                    sides: [marketData.side],
                    paid: marketData.paid,
                    value: marketData.payout,
                    claimable: !!marketData.isClaimable,
                    claimed: false,
                    isChained: false,
                } as UserProfilePosition;
            });

        const chainedSpeedMarketsOpenPositions: UserProfilePosition[] = userOpenChainedSpeedMarketsDataWithPrices
            .filter((marketData) => !marketData.userLost)
            .map((marketData) => {
                return {
                    currencyKey: marketData.currencyKey,
                    strikePrice: marketData.lastStrikePrice,
                    leftPrice: 0,
                    rightPrice: 0,
                    finalPrice: 0, // won't be used
                    payout: marketData.payout,
                    maturityDate: marketData.maturityDate,
                    expiryDate: marketData.maturityDate,
                    market: marketData.market,
                    sides: marketData.sides,
                    paid: marketData.paid,
                    value: marketData.payout,
                    claimable: marketData.isClaimable,
                    claimed: false,
                    isChained: true,
                } as UserProfilePosition;
            });

        return orderBy(
            speedMarketsOpenPositions.concat(chainedSpeedMarketsOpenPositions),
            ['maturityDate', 'value'],
            ['asc', 'desc']
        );
    }, [userOpenSpeedMarketsData, userOpenChainedSpeedMarketsDataWithPrices]);

    const filteredData = useMemo(() => {
        if (searchText === '') return data;
        return data.filter(
            (position: UserProfilePosition) => position.currencyKey.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        );
    }, [searchText, data]);

    const rows = useMemo(() => {
        const generateRows = (data: UserProfilePosition[]) => {
            try {
                return data.map((row: UserProfilePosition) => {
                    const mappedRow: UserPosition = {
                        user: '',
                        market: row.market,
                        currencyKey: row.currencyKey,
                        side: row.sides[0],
                        strikePrice: row.strikePrice,
                        maturityDate: row.maturityDate,
                        paid: row.paid,
                        payout: row.payout,
                        currentPrice: currentPrices[row.currencyKey],
                        finalPrice: row.finalPrice,
                        isClaimable: row.claimable,
                        isResolved: false,
                        createdAt: 0,
                    };

                    const cells: any = [
                        {
                            title: t(`profile.strike-price`),
                            value: `$${formatCurrency(row.strikePrice)}`,
                        },
                        {
                            title: (
                                <>
                                    {t('profile.current-price')}
                                    {<Tooltip overlay={t('profile.current-price-tooltip')} />}
                                </>
                            ),
                            value: formatCurrencyWithSign(USD_SIGN, currentPrices[row.currencyKey]),
                        },
                        {
                            title: row.isChained ? t('profile.history.directions') : t('profile.history.direction'),
                            value: getDirections(row.sides, theme, row.isChained),
                        },
                        {
                            title: t('profile.history.payout'),
                            value: formatCurrencyWithSign(USD_SIGN, row.payout, 2),
                        },
                        {
                            title: t('profile.history.paid'),
                            value: `$${formatCurrency(row.paid)}`,
                        },
                        {
                            title: t('profile.history.expires'),
                            value: <MaturityDate maturityDateUnix={row.maturityDate} showFullCounter />,
                        },
                        {
                            value: <MyPositionAction position={mappedRow} />,
                        },
                        {
                            value: !row.isChained && (
                                <ShareIcon
                                    className="icon-home icon-home--twitter-x"
                                    disabled={false}
                                    onClick={() => {
                                        setOpenTwitterShareModal(true);
                                        setPositionShareData({
                                            type: 'potential-speed',
                                            positions: row.sides,
                                            currencyKey: row.currencyKey,
                                            strikePrices: [row.strikePrice],
                                            strikeDate: row.maturityDate,
                                            buyIn: row.paid,
                                            payout: row.payout,
                                        });
                                    }}
                                />
                            ),
                            width: isMobile ? undefined : '20px',
                        },
                    ];

                    return {
                        backgroundColor: theme.background.secondary,
                        asset: {
                            currencyKey: row.currencyKey,
                            displayInRowMobile: true,
                        },
                        cells: cells,
                        displayInRowMobile: true,
                        gap: '8px',
                    };
                });
            } catch (e) {
                console.log(e);
            }
        };

        if (filteredData.length > 0) {
            return generateRows(filteredData);
        }
        return [];
    }, [filteredData, isMobile, t, theme, currentPrices]);

    return (
        <>
            <TileTable
                rows={rows as any}
                isLoading={
                    userActiveSpeedMarketsDataQuery.isLoading || userActiveChainedSpeedMarketsDataQuery.isLoading
                }
                hideFlow
            />
            {positionsShareData !== null && openTwitterShareModal && (
                <SharePositionModal
                    type={positionsShareData.type}
                    positions={positionsShareData.positions}
                    currencyKey={positionsShareData.currencyKey}
                    strikeDate={positionsShareData.strikeDate}
                    strikePrices={positionsShareData.strikePrices}
                    buyIn={positionsShareData.buyIn}
                    payout={positionsShareData.payout}
                    onClose={() => setOpenTwitterShareModal(false)}
                />
            )}
        </>
    );
};

export default OpenPositions;
