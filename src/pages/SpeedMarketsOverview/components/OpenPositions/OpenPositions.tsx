import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { SPEED_MARKETS_OVERVIEW_SECTIONS as SECTIONS } from 'constants/market';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useActiveSpeedMarketsDataQuery';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import { UserPosition } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getCollateral } from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint, getSupportedAssetsAsObject } from 'utils/pyth';
import { refetchActiveSpeedMarkets, refetchPythPrice } from 'utils/queryConnector';
import { isUserWinner, resolveAllSpeedPositions } from 'utils/speedAmm';
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
import TablePositions from './components/TablePositions';

const OpenPositions: React.FC = () => {
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

    const activeSpeedMarketsDataQuery = useActiveSpeedMarketsDataQuery(
        { networkId, client },
        {
            enabled: isAppReady && isConnected,
        }
    );

    const activeSpeedMarketsData = useMemo(
        () =>
            activeSpeedMarketsDataQuery.isSuccess && activeSpeedMarketsDataQuery.data
                ? activeSpeedMarketsDataQuery.data
                : [],
        [activeSpeedMarketsDataQuery]
    );

    const activeSpeedNotMatured: UserPosition[] = activeSpeedMarketsData.filter(
        (marketData) => marketData.maturityDate >= Date.now()
    );
    const activeSpeedMatured = activeSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());

    const priceRequests = activeSpeedMatured.map((marketData) => ({
        priceId: getPriceId(networkId, marketData.currencyKey),
        publishTime: millisecondsToSeconds(marketData.maturityDate),
    }));
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, {
        enabled: priceRequests.length > 0,
    });

    // set final prices and claimable status
    const maturedUserSpeedMarketsWithPrices: UserPosition[] = activeSpeedMatured.map((marketData, index) => {
        const finalPrice = pythPricesQueries[index].data || 0;
        const isClaimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
        return {
            ...marketData,
            finalPrice,
            isClaimable,
        };
    });

    const userWinnerSpeedMarketsData = maturedUserSpeedMarketsWithPrices
        .filter((marketData) => marketData.isClaimable && !!marketData.finalPrice)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const ammWinnerSpeedMarketsData = maturedUserSpeedMarketsWithPrices
        .filter((marketData) => !marketData.isClaimable && !!marketData.finalPrice)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const unknownPriceSpeedMarketsData = maturedUserSpeedMarketsWithPrices
        .filter((marketData) => !marketData.isClaimable && !marketData.finalPrice)
        .sort((a, b) => b.maturityDate - a.maturityDate);

    const openSpeedMarketsData = activeSpeedNotMatured.sort((a, b) => b.maturityDate - a.maturityDate);

    const isLoading =
        isLoadingEnabled &&
        (ammSpeedMarketsLimitsQuery.isLoading ||
            activeSpeedMarketsDataQuery.isLoading ||
            pythPricesQueries.some((query) => query.isLoading));

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

    const handleResolveAll = async (positions: UserPosition[], isAdmin: boolean) => {
        setIsSubmitting(true);
        await resolveAllSpeedPositions(
            positions,
            isAdmin,
            { networkId, client: walletClient.data },
            isBiconomy,
            collateralAddress
        );
        setIsSubmitting(false);
        setIsSubmittingSection('');
    };

    const getButton = (
        positions: UserPosition[],
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

    const getSection = (section: typeof SECTIONS[keyof typeof SECTIONS], positions: UserPosition[]) => {
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
                    <ButtonWrapper>
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
                                    positions={positions as UserPosition[]}
                                    maxPriceDelayForResolvingSec={
                                        ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec || 0
                                    }
                                    isAdmin={isAdmin}
                                    isSubmittingBatch={isSubmitting}
                                />
                            ) : (
                                <TablePositions
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

export default OpenPositions;
