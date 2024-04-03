import TileTable from 'components/TileTable/TileTable';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds } from 'date-fns';
import { orderBy } from 'lodash';
import ChainedPositionAction from 'pages/SpeedMarkets/components/ChainedPositionAction';
import { ShareIcon } from 'pages/SpeedMarkets/components/OpenPosition/OpenPosition';
import SharePositionModal from 'pages/SpeedMarkets/components/SharePositionModal/SharePositionModal';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import { formatCurrency, formatCurrencyWithSign, formatShortDateWithTime } from 'thales-utils';
import { SharePositionData } from 'types/flexCards';
import { UserPosition } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { getPriceId } from 'utils/pyth';
import { isUserWinner } from 'utils/speedAmm';
import { useAccount, useChainId, useClient } from 'wagmi';
import MyPositionAction from '../MyPositionAction';
import { getDirections } from '../styled-components';

type ClaimablePositionsProps = {
    searchAddress: string;
    searchText: string;
};

const ClaimablePositions: React.FC<ClaimablePositionsProps> = ({ searchAddress, searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { isConnected, address } = useAccount();

    const [openTwitterShareModal, setOpenTwitterShareModal] = useState<boolean>(false);
    const [positionsShareData, setPositionShareData] = useState<SharePositionData | null>(null);

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || (address as string),
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
        searchAddress || (address as string),
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

    // Prepare chained speed markets that are matured
    const userMaturedChainedMarkets = userOpenChainedSpeedMarketsData
        .filter((marketData) => marketData.isMatured)
        .map((marketData) => {
            return {
                ...marketData,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const priceRequests = userMaturedChainedMarkets
        .map((data) =>
            data.strikeTimes.map((strikeTime) => ({
                priceId: data.pythPriceId,
                publishTime: millisecondsToSeconds(strikeTime),
                market: data.address,
            }))
        )
        .flat();

    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, { enabled: priceRequests.length > 0 });
    const pythPricesWithMarket = priceRequests.map((request, i) => ({
        market: request.market,
        price: pythPricesQueries[i]?.data || 0,
    }));

    // Based on Pyth prices populate strike prices
    const userOpenChainedSpeedMarketsDataWithPrices = userMaturedChainedMarkets
        .map((marketData) => {
            const finalPrices = marketData.finalPrices.map(
                (_, i) =>
                    pythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.address)[i]?.price || 0
            );
            const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
                i === 0 ? strikePrice : finalPrices[i - 1]
            );
            const userWonStatuses = marketData.sides.map((side, i) =>
                isUserWinner(side, strikePrices[i], finalPrices[i])
            );
            const canResolve =
                userWonStatuses.some((status) => status === false) ||
                userWonStatuses.every((status) => status !== undefined);
            const claimable = userWonStatuses.every((status) => status);
            return { ...marketData, strikePrices, finalPrices, canResolve, claimable };
        })
        .filter((marketData) => marketData.claimable);

    const data: UserPosition[] = useMemo(() => {
        const speedMarketsOpenPositions: UserPosition[] = userOpenSpeedMarketsData
            .filter((marketData) => marketData.claimable)
            .map((marketData) => {
                return {
                    positionAddress: marketData.positionAddress,
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
                    value: marketData.value,
                    claimable: !!marketData.claimable,
                    claimed: false,
                    isChained: false,
                };
            });

        const chainedSpeedMarketsOpenPositions: UserPosition[] = userOpenChainedSpeedMarketsDataWithPrices.map(
            (marketData) => {
                return {
                    positionAddress: marketData.address,
                    currencyKey: marketData.currencyKey,
                    strikePrice: marketData.strikePrices[marketData.strikePrices.length - 1],
                    leftPrice: 0,
                    rightPrice: 0,
                    finalPrice: marketData.finalPrices[marketData.finalPrices.length - 1],
                    payout: marketData.payout,
                    maturityDate: marketData.maturityDate,
                    expiryDate: marketData.maturityDate,
                    market: marketData.address,
                    sides: marketData.sides,
                    paid: marketData.paid,
                    value: marketData.payout,
                    claimable: marketData.claimable,
                    claimed: false,
                    isChained: true,
                };
            }
        );

        return orderBy(
            speedMarketsOpenPositions.concat(chainedSpeedMarketsOpenPositions),
            ['maturityDate', 'value'],
            ['asc', 'desc']
        );
    }, [userOpenSpeedMarketsData, userOpenChainedSpeedMarketsDataWithPrices]);

    const filteredData = useMemo(() => {
        if (searchText === '') return data;
        return data.filter(
            (position: UserPosition) => position.currencyKey.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        );
    }, [searchText, data]);

    const rows = useMemo(() => {
        const generateRows = (data: UserPosition[]) => {
            try {
                return data.map((row: UserPosition) => {
                    const chainedPosition = row.isChained
                        ? userOpenChainedSpeedMarketsDataWithPrices.find(
                              (marketData) => marketData.address === row.market
                          )
                        : undefined;

                    const cells: any = [
                        {
                            title: t(`profile.strike-price`),
                            value: `$${formatCurrency(row.strikePrice)}`,
                        },
                        {
                            title: t('profile.final-price'),
                            value: formatCurrencyWithSign(USD_SIGN, row.finalPrice),
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
                            title: t('profile.history.expired'),
                            value: formatShortDateWithTime(row.maturityDate),
                        },
                        {
                            value: chainedPosition ? (
                                <ChainedPositionAction
                                    position={chainedPosition}
                                    isOverview={false}
                                    isAdmin={false}
                                    isSubmittingBatch={false}
                                    isProfileAction
                                />
                            ) : (
                                <MyPositionAction position={row} isProfileAction />
                            ),
                        },
                        {
                            value: (
                                <ShareIcon
                                    className="icon-home icon-home--twitter-x"
                                    disabled={false}
                                    onClick={() => {
                                        setOpenTwitterShareModal(true);
                                        if (row.isChained && chainedPosition) {
                                            setPositionShareData({
                                                type: 'chained-speed-won',
                                                positions: chainedPosition.sides,
                                                currencyKey: chainedPosition.currencyKey,
                                                strikeDate: chainedPosition.maturityDate,
                                                strikePrices: chainedPosition.strikePrices,
                                                finalPrices: chainedPosition.finalPrices,
                                                buyIn: chainedPosition.paid,
                                                payout: chainedPosition.payout,
                                                payoutMultiplier: chainedPosition.payoutMultiplier,
                                            });
                                        } else {
                                            setPositionShareData({
                                                type: 'resolved-speed',
                                                positions: row.sides,
                                                currencyKey: row.currencyKey,
                                                strikePrices: [row.strikePrice],
                                                strikeDate: row.maturityDate,
                                                buyIn: row.paid,
                                                payout: row.payout,
                                            });
                                        }
                                    }}
                                />
                            ),
                            width: isMobile ? undefined : '20px',
                        },
                    ];

                    return {
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
    }, [filteredData, isMobile, t, theme, userOpenChainedSpeedMarketsDataWithPrices]);

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
                    finalPrices={positionsShareData.finalPrices}
                    buyIn={positionsShareData.buyIn}
                    payout={positionsShareData.payout}
                    payoutMultiplier={positionsShareData.payoutMultiplier}
                    onClose={() => setOpenTwitterShareModal(false)}
                />
            )}
        </>
    );
};

export default ClaimablePositions;
