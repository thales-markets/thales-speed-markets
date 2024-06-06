import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { SPEED_MARKETS_OVERVIEW_SECTIONS as SECTIONS } from 'constants/market';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useActiveChainedSpeedMarketsDataQuery';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import { UserChainedPosition } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getCollateral } from 'utils/currency';
import { getIsMultiCollateralSupported, isOnlySpeedMarketsSupported } from 'utils/network';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint, getSupportedAssetsAsObject } from 'utils/pyth';
import { refetchActiveSpeedMarkets, refetchPythPrice } from 'utils/queryConnector';
import { isUserWinner, resolveAllChainedMarkets } from 'utils/speedAmm';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import CardPositions from '../../../SpeedMarkets/components/CardPositions/';
import {
    ButtonWrapper,
    Container,
    NoPositions,
    NoPositionsText,
    PositionsWrapper,
    Row,
    Title,
} from '../styled-components';
import TableChainedPositions from './components/TableChainedPositions';

const OpenChainedPositions: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));

    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingSection, setIsSubmittingSection] = useState('');
    const [isLoadingEnabled, setIsLoadingEnabled] = useState(true);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress = isMultiCollateralSupported
        ? multipleCollateral[selectedCollateral].addresses[networkId]
        : erc20Contract.addresses[networkId];

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress,
        {
            enabled: isAppReady,
        }
    );

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const isNetworkSupportedForChained = !isOnlySpeedMarketsSupported(networkId);

    const activeChainedSpeedMarketsDataQuery = useActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        {
            enabled: isAppReady && isConnected && isNetworkSupportedForChained,
        }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            activeChainedSpeedMarketsDataQuery.isSuccess && activeChainedSpeedMarketsDataQuery.data
                ? activeChainedSpeedMarketsDataQuery.data
                : [],
        [activeChainedSpeedMarketsDataQuery]
    );

    const chainedWithoutMaturedPositions: UserChainedPosition[] = userOpenChainedSpeedMarketsData
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
    const partiallyMaturedWithPrices: UserChainedPosition[] = partiallyMaturedChainedMarkets.map((marketData) => {
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

    const userWinnerSpeedMarketsData = partiallyMaturedWithPrices
        .filter((marketData) => marketData.isClaimable)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const ammWinnerSpeedMarketsData = partiallyMaturedWithPrices
        .filter((marketData) => marketData.canResolve && !marketData.isClaimable)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const unknownPriceSpeedMarketsData = partiallyMaturedWithPrices
        .filter((marketData) => !marketData.canResolve && marketData.isMatured)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const openSpeedMarketsData = chainedWithoutMaturedPositions
        .filter((marketData) => !marketData.canResolve && !marketData.isMatured)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const isLoading =
        isLoadingEnabled &&
        (ammSpeedMarketsLimitsQuery.isLoading ||
            activeChainedSpeedMarketsDataQuery.isLoading ||
            chainedPythPricesQueries.some((query) => query.isLoading));

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const priceConnection = useMemo(() => {
        return new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), { timeout: CONNECTION_TIMEOUT_MS });
    }, [networkId]);

    useInterval(async () => {
        // Check if there are new matured markets from open markets and refresh it
        const openMatured = openSpeedMarketsData.filter((marketData) =>
            marketData.strikeTimes.some((strikeTime, i) => !marketData.finalPrices[i] && strikeTime < Date.now())
        );
        if (openMatured.length) {
            if (!mountedRef.current) return null;
            setIsLoadingEnabled(false);
            refetchActiveSpeedMarkets(true, networkId);
        }
        // Refresh current prices
        if (openSpeedMarketsData.length) {
            const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkId, asset));
            const prices: typeof currentPrices = await getCurrentPrices(priceConnection, networkId, priceIds);
            setCurrentPrices({
                ...currentPrices,
                [CRYPTO_CURRENCY_MAP.BTC]: prices[CRYPTO_CURRENCY_MAP.BTC],
                [CRYPTO_CURRENCY_MAP.ETH]: prices[CRYPTO_CURRENCY_MAP.ETH],
            });
        }
        // Check if missing price is available
        if (unknownPriceSpeedMarketsData.length) {
            unknownPriceSpeedMarketsData.forEach((marketData) => {
                const priceId = getPriceId(networkId, marketData.currencyKey);
                marketData.finalPrices.forEach((finalPrice, i) => {
                    if (finalPrice === 0) {
                        const publishTime = millisecondsToSeconds(marketData.strikeTimes[i]);
                        refetchPythPrice(priceId, publishTime);
                    }
                });
            });
        }
    }, secondsToMilliseconds(10));

    useEffect(() => {
        setIsLoadingEnabled(true);
    }, [networkId]);

    const handleResolveAll = async (positions: UserChainedPosition[], isAdmin: boolean) => {
        setIsSubmitting(true);
        await resolveAllChainedMarkets(
            positions,
            isAdmin,
            { networkId, client: walletClient.data },
            isBiconomy,
            collateralAddress
        );
        if (!mountedRef.current) return null;
        setIsSubmitting(false);
        setIsSubmittingSection('');
    };

    const getButton = (
        positions: UserChainedPosition[],
        sectionName: typeof SECTIONS[keyof typeof SECTIONS],
        isAdmin: boolean
    ) => {
        return (
            !isLoading &&
            !!positions.length && (
                <Button
                    disabled={isSubmitting || !positions.length}
                    onClick={() => {
                        setIsSubmittingSection(sectionName);
                        handleResolveAll(positions, isAdmin);
                    }}
                    fontSize="13px"
                >
                    {isSubmittingSection === sectionName
                        ? t(`speed-markets.overview.resolve-progress`)
                        : isAdmin
                        ? `${t('common.admin')} ${t('speed-markets.overview.resolve-all')}`
                        : t('speed-markets.overview.resolve-all')}
                </Button>
            )
        );
    };

    const getSection = (section: typeof SECTIONS[keyof typeof SECTIONS], positions: UserChainedPosition[]) => {
        let titleKey = '';
        switch (section) {
            case SECTIONS.userWinner:
                titleKey = 'speed-markets.overview.user-title';
                break;
            case SECTIONS.ammWinner:
                titleKey = 'speed-markets.overview.amm-title';
                break;
            case SECTIONS.unknownPrice:
                titleKey = 'speed-markets.overview.unknown-price-title';
                break;
            case SECTIONS.openPositions:
                titleKey = 'speed-markets.overview.open-positions-title';
                break;
            default:
        }

        const isAdmin = !!ammSpeedMarketsLimitsData?.whitelistedAddress && section === SECTIONS.ammWinner;

        return (
            <>
                <Row>
                    <Title>{`${t(titleKey)} (${positions.length})`}</Title>
                    <ButtonWrapper $isChained>
                        {[SECTIONS.userWinner, SECTIONS.ammWinner].includes(section) &&
                            getButton(positions, section, isAdmin)}
                    </ButtonWrapper>
                </Row>
                {
                    <PositionsWrapper>
                        {isLoading ? (
                            <SimpleLoader />
                        ) : positions.length > 0 ? (
                            isMobile ? (
                                <CardPositions
                                    isHorizontal
                                    positions={positions as UserChainedPosition[]}
                                    isChained
                                    maxPriceDelayForResolvingSec={
                                        ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec || 0
                                    }
                                    isAdmin={isAdmin}
                                    isSubmittingBatch={isSubmitting}
                                />
                            ) : (
                                <TableChainedPositions
                                    data={positions}
                                    maxPriceDelayForResolvingSec={
                                        ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec || 0
                                    }
                                    isAdmin={isAdmin}
                                    isSubmittingBatch={isSubmitting}
                                />
                            )
                        ) : (
                            <NoPositions>
                                <NoPositionsText>{t('speed-markets.overview.no-positions')}</NoPositionsText>
                            </NoPositions>
                        )}
                    </PositionsWrapper>
                }
            </>
        );
    };

    return (
        <Container>
            {getSection(SECTIONS.userWinner, userWinnerSpeedMarketsData)}
            {getSection(SECTIONS.ammWinner, ammWinnerSpeedMarketsData)}
            {getSection(SECTIONS.unknownPrice, unknownPriceSpeedMarketsData)}
            {getSection(SECTIONS.openPositions, openSpeedMarketsData)}
        </Container>
    );
};

export default OpenChainedPositions;
