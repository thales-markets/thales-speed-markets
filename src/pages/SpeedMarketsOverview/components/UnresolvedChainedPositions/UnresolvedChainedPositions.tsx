import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { SPEED_MARKETS_OVERVIEW_SECTIONS as SECTIONS } from 'constants/market';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import {
    LoaderContainer,
    NoPositionsText,
    PositionsWrapper,
    Row,
    Title,
    Wrapper,
    getAdditionalButtonStyle,
    getDefaultButtonProps,
} from 'pages/SpeedMarketsOverview/styled-components';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useActiveChainedSpeedMarketsDataQuery';
import useAmmChainedSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmChainedSpeedMarketsLimitsQuery';
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
import { getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId } from 'utils/pyth';
import { refetchActiveSpeedMarkets, refetchPythPrice } from 'utils/queryConnector';
import { isUserWinner, resolveAllChainedMarkets } from 'utils/speedAmm';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

const UnresolvedChainedPositions: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingSection, setIsSubmittingSection] = useState('');
    const [isLoadingEnabled, setIsLoadingEnabled] = useState(true);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress = isMultiCollateralSupported
        ? multipleCollateral[selectedCollateral].addresses[networkId]
        : erc20Contract.addresses[networkId];

    const ammChainedSpeedMarketsLimitsQuery = useAmmChainedSpeedMarketsLimitsQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress,
        {
            enabled: isAppReady,
        }
    );

    const ammChainedSpeedMarketsLimitsData = useMemo(() => {
        return ammChainedSpeedMarketsLimitsQuery.isSuccess ? ammChainedSpeedMarketsLimitsQuery.data : null;
    }, [ammChainedSpeedMarketsLimitsQuery]);

    const activeChainedSpeedMarketsDataQuery = useActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    const activeChainedSpeedMarketsData = useMemo(
        () =>
            activeChainedSpeedMarketsDataQuery.isSuccess && activeChainedSpeedMarketsDataQuery.data
                ? activeChainedSpeedMarketsDataQuery.data
                : [],

        [activeChainedSpeedMarketsDataQuery]
    );

    // Prepare chained speed markets that are partially matured to fetch Pyth prices
    const partiallyMaturedChainedMarkets = activeChainedSpeedMarketsData
        .filter((marketData) => marketData.strikeTimes.some((strikeTime) => strikeTime < Date.now()))
        .map((marketData) => {
            return {
                ...marketData,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const priceRequests = partiallyMaturedChainedMarkets
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
        price: Number(pythPricesQueries[i]?.data || 0),
    }));

    // Based on Pyth prices determine if chained position is claimable
    const partiallyMaturedUnresolvedWithPrices = partiallyMaturedChainedMarkets.map((marketData) => {
        const finalPrices = marketData.strikeTimes.map(
            (_, i) => pythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.market)[i]?.price || 0
        );
        const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
            i > 0 ? finalPrices[i - 1] : strikePrice
        );
        const userWonStatuses = marketData.sides.map((side, i) => isUserWinner(side, strikePrices[i], finalPrices[i]));
        const canResolve =
            userWonStatuses.some((status) => status === false) ||
            userWonStatuses.every((status) => status !== undefined);
        const isClaimable = userWonStatuses.every((status) => status);
        const isUnknownPrice = marketData.isMatured && userWonStatuses.some((status) => status === undefined);

        return { ...marketData, strikePrices, finalPrices, canResolve, isClaimable, isUnknownPrice };
    });

    const userWinnerSpeedMarketsData = partiallyMaturedUnresolvedWithPrices.filter(
        (marketData) => marketData.isClaimable
    );
    const ammWinnerSpeedMarketsData = partiallyMaturedUnresolvedWithPrices.filter(
        (marketData) => marketData.canResolve && !marketData.isClaimable
    );
    const unknownPriceSpeedMarketsData = partiallyMaturedUnresolvedWithPrices.filter(
        (marketData) => !marketData.canResolve && marketData.isUnknownPrice
    );
    const openSpeedMarketsData = activeChainedSpeedMarketsData
        .filter(
            (marketData) =>
                !partiallyMaturedUnresolvedWithPrices.some(
                    (maturedMarket) => maturedMarket.market === marketData.market
                )
        )
        .concat(
            partiallyMaturedUnresolvedWithPrices.filter(
                (marketData) =>
                    !userWinnerSpeedMarketsData.some((maturedMarket) => maturedMarket.market === marketData.market) &&
                    !ammWinnerSpeedMarketsData.some((maturedMarket) => maturedMarket.market === marketData.market) &&
                    !unknownPriceSpeedMarketsData.some((maturedMarket) => maturedMarket.market === marketData.market)
            )
        );

    const isLoading =
        isLoadingEnabled &&
        (activeChainedSpeedMarketsDataQuery.isLoading || pythPricesQueries.some((query) => query.isLoading));

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

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
                    {...getDefaultButtonProps(isMobile, positions.length > 5)}
                    disabled={isSubmitting || !positions.length}
                    additionalStyles={getAdditionalButtonStyle()}
                    onClick={() => {
                        setIsSubmittingSection(sectionName);
                        handleResolveAll(positions, isAdmin);
                    }}
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

        const isAdmin = !!ammChainedSpeedMarketsLimitsData?.whitelistedAddress && section === SECTIONS.ammWinner;

        return (
            <>
                <Row>
                    <Title>{`${t(titleKey)} (${positions.length})`}</Title>
                    {[SECTIONS.userWinner, SECTIONS.ammWinner].includes(section) &&
                        getButton(positions, section, isAdmin)}
                </Row>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : (
                    <PositionsWrapper $hasPositions={positions.length > 0} $isChained>
                        {positions.length > 0 ? (
                            positions.map((position, index) => (
                                <ChainedPosition
                                    position={position}
                                    maxPriceDelayForResolvingSec={
                                        ammChainedSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec
                                    }
                                    isOverview
                                    isAdmin={isAdmin}
                                    isSubmittingBatch={isSubmitting}
                                    key={`${section}${index}`}
                                />
                            ))
                        ) : (
                            <NoPositionsText>{t('speed-markets.overview.no-positions')}</NoPositionsText>
                        )}
                    </PositionsWrapper>
                )}
            </>
        );
    };

    return (
        <Wrapper>
            {getSection(
                SECTIONS.userWinner,
                userWinnerSpeedMarketsData.sort((a, b) => b.maturityDate - a.maturityDate)
            )}
            {getSection(
                SECTIONS.ammWinner,
                ammWinnerSpeedMarketsData.sort((a, b) => b.maturityDate - a.maturityDate)
            )}
            {getSection(
                SECTIONS.unknownPrice,
                unknownPriceSpeedMarketsData.sort((a, b) => b.maturityDate - a.maturityDate)
            )}
            {getSection(
                SECTIONS.openPositions,
                openSpeedMarketsData.sort((a, b) => a.maturityDate - b.maturityDate)
            )}
        </Wrapper>
    );
};

export default UnresolvedChainedPositions;
