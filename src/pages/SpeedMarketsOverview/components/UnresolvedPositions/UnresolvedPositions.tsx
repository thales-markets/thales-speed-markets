import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { SPEED_MARKETS_OVERVIEW_SECTIONS as SECTIONS } from 'constants/market';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
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
import useActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useActiveSpeedMarketsDataQuery';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { UserOpenPositions } from 'types/market';
import { RootState } from 'types/ui';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint, getSupportedAssetsAsObject } from 'utils/pyth';
import { refetchActiveSpeedMarkets, refetchPythPrice } from 'utils/queryConnector';
import { isUserWinner, resolveAllSpeedPositions } from 'utils/speedAmm';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import UnresolvedPosition from '../UnresolvedPosition';

const UnresolvedPositions: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const { address } = useAccount();
    const client = useClient();
    const walletClient = useWalletClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingSection, setIsSubmittingSection] = useState('');
    const [isLoadingEnabled, setIsLoadingEnabled] = useState(true);

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, address, {
        enabled: isAppReady,
    });

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const activeSpeedMarketsDataQuery = useActiveSpeedMarketsDataQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    const activeSpeedMarketsData = useMemo(
        () =>
            activeSpeedMarketsDataQuery.isSuccess && activeSpeedMarketsDataQuery.data
                ? activeSpeedMarketsDataQuery.data
                : [],
        [activeSpeedMarketsDataQuery]
    );

    const activeMatured = activeSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());
    const priceRequests = activeMatured.map((marketData) => ({
        priceId: getPriceId(networkId, marketData.currencyKey),
        publishTime: millisecondsToSeconds(marketData.maturityDate),
    }));

    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, {
        enabled: activeSpeedMarketsDataQuery.isSuccess,
    });

    const maturedUnresolvedWithPrices = activeMatured.map((marketData, index) => {
        const finalPrice = pythPricesQueries[index].data || 0;
        const claimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
        return {
            ...marketData,
            claimable,
            finalPrice,
            strikePrice: marketData.strikePrice,
        };
    });

    const userWinnerSpeedMarketsData = maturedUnresolvedWithPrices.filter(
        (marketData) => marketData.claimable && !!marketData.finalPrice
    );
    const ammWinnerSpeedMarketsData = maturedUnresolvedWithPrices.filter(
        (marketData) => !marketData.claimable && !!marketData.finalPrice
    );
    const unknownPriceSpeedMarketsData = maturedUnresolvedWithPrices.filter(
        (marketData) => !marketData.claimable && !marketData.finalPrice
    );
    const openSpeedMarketsData = activeSpeedMarketsData
        .filter((marketData) => marketData.maturityDate > Date.now())
        .map((marketData) => ({
            ...marketData,
            strikePrice: marketData.strikePrice,
            currentPrice: currentPrices[marketData.currencyKey]
                ? currentPrices[marketData.currencyKey]
                : marketData.currentPrice,
        }));

    const isLoading =
        isLoadingEnabled &&
        (activeSpeedMarketsDataQuery.isLoading || pythPricesQueries.some((price) => price.isLoading));

    const priceConnection = useMemo(() => {
        return new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), { timeout: CONNECTION_TIMEOUT_MS });
    }, [networkId]);

    useInterval(async () => {
        // Check if there are new matured markets from open markets and refresh it
        const openMatured = openSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());
        if (openMatured.length) {
            setIsLoadingEnabled(false);
            refetchActiveSpeedMarkets(false, networkId);
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
                const publishTime = millisecondsToSeconds(marketData.maturityDate);
                refetchPythPrice(priceId, publishTime);
            });
        }
    }, secondsToMilliseconds(10));

    useEffect(() => {
        setIsLoadingEnabled(true);
    }, [networkId]);

    const handleResolveAll = async (positions: UserOpenPositions[], isAdmin: boolean) => {
        setIsSubmitting(true);
        await resolveAllSpeedPositions(positions, isAdmin, { networkId, client: walletClient.data });
        setIsSubmitting(false);
        setIsSubmittingSection('');
    };

    const getButton = (
        positions: UserOpenPositions[],
        sectionName: typeof SECTIONS[keyof typeof SECTIONS],
        isAdmin: boolean
    ) => {
        return (
            !isLoading &&
            !!positions.length && (
                <Button
                    {...getDefaultButtonProps(isMobile, positions.length > 10)}
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

    const getSection = (section: typeof SECTIONS[keyof typeof SECTIONS], positions: UserOpenPositions[]) => {
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
                    {[SECTIONS.userWinner, SECTIONS.ammWinner].includes(section) &&
                        getButton(positions, section, isAdmin)}
                </Row>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : (
                    <PositionsWrapper $hasPositions={positions.length > 0}>
                        {positions.length > 0 ? (
                            positions.map((position, index) => (
                                <UnresolvedPosition
                                    position={position}
                                    maxPriceDelayForResolvingSec={
                                        ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec || 0
                                    }
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

export default UnresolvedPositions;
