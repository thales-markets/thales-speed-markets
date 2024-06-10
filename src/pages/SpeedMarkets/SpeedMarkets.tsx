import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import banner from 'assets/images/speed-markets-banner.png';
import PageLinkBanner from 'components/PageLinkBanner';
import SPAAnchor from 'components/SPAAnchor/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';
import { LINKS } from 'constants/links';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import { Positions, TradingSteps } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import LightweightChart from 'pages/SpeedMarkets/components/PriceChart/LightweightChart';
import UserOpenPositions from 'pages/SpeedMarkets/components/UserOpenPositions';
import useAmmChainedSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmChainedSpeedMarketsLimitsQuery';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import queryString from 'query-string';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { BoldText, PAGE_MAX_WIDTH } from 'styles/common';
import { roundNumberToDecimals } from 'thales-utils';
import { RootState } from 'types/ui';
import { getSupportedNetworksByRoute } from 'utils/network';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint, getSupportedAssetsAsObject } from 'utils/pyth';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';
import AmmSpeedTrading from './components/AmmSpeedTrading';
import SelectAsset from './components/SelectAsset';
import SelectBuyin from './components/SelectBuyin';
import SelectPosition from './components/SelectPosition';
import { SelectedPosition } from './components/SelectPosition/SelectPosition';
import SelectTime from './components/SelectTime';
import MobileMenu from 'layouts/DappLayout/components/MobileMenu';
import Modal from 'components/Modal';
import { getIsMobile } from 'redux/modules/ui';

const SpeedMarkets: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const networkId = useChainId();
    const client = useClient();
    const { isConnected } = useAccount();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isChainedSupported = getSupportedNetworksByRoute(ROUTES.Markets.ChainedSpeedMarkets).includes(networkId);
    const isChainedMarkets = isChainedSupported && queryString.parse(location.search).isChained === 'true';

    const [isChained, setIsChained] = useState(isChainedMarkets);
    const [isChainedLinkSelected, setIsChainedLinkSelected] = useState(isChainedMarkets);
    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());
    const [currencyKey, setCurrencyKey] = useState(SUPPORTED_ASSETS[0]);
    const [positionType, setPositionType] = useState<SelectedPosition>(undefined);
    const [chainedPositions, setChainedPositions] = useState<SelectedPosition[]>([undefined, undefined]);
    const [deltaTimeSec, setDeltaTimeSec] = useState(0);
    const [buyinAmount, setBuyinAmount] = useState(0);
    const [isResetTriggered, setIsResetTriggered] = useState(false);
    const [profitAndSkewPerPosition, setProfitAndSkewPerPosition] = useState({
        profit: { [Positions.UP]: 0, [Positions.DOWN]: 0 },
        skew: { [Positions.UP]: 0, [Positions.DOWN]: 0 },
    });
    const [hasError, setHasError] = useState(false);
    const [showChartModal, setShowChartModal] = useState(false);

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, undefined, {
        enabled: isAppReady,
    });

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const ammChainedSpeedMarketsLimitsQuery = useAmmChainedSpeedMarketsLimitsQuery({ networkId, client }, undefined, {
        enabled: isAppReady && isChainedSupported,
    });

    const ammChainedSpeedMarketsLimitsData = useMemo(() => {
        return ammChainedSpeedMarketsLimitsQuery.isSuccess ? ammChainedSpeedMarketsLimitsQuery.data : null;
    }, [ammChainedSpeedMarketsLimitsQuery]);

    const priceConnection = useMemo(() => {
        return new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), { timeout: CONNECTION_TIMEOUT_MS });
    }, [networkId]);

    const prevPrice = useRef(0);
    const fetchCurrentPrices = useCallback(async () => {
        const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkId, asset));
        const prices: typeof currentPrices = await getCurrentPrices(priceConnection, networkId, priceIds);
        if (!mountedRef.current) return null;
        setCurrentPrices((prev) => {
            if (prev[currencyKey] !== prices[currencyKey]) {
                prevPrice.current = prev[currencyKey];
            }
            return prices;
        });
    }, [networkId, priceConnection, currencyKey]);

    // Set isChained when query param is changed after initialization
    useEffect(() => {
        setIsChained(isChainedMarkets);
    }, [isChainedMarkets]);

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Set initial current prices
    useEffect(() => {
        fetchCurrentPrices();
    }, [currencyKey, fetchCurrentPrices]);

    // Set initial chained positions
    useEffect(() => {
        if (ammChainedSpeedMarketsLimitsData?.minChainedMarkets) {
            setChainedPositions(Array(ammChainedSpeedMarketsLimitsData.minChainedMarkets).fill(undefined));
        }
    }, [ammChainedSpeedMarketsLimitsData?.minChainedMarkets]);

    // Update current prices on every 5 seconds
    useInterval(async () => {
        fetchCurrentPrices();
    }, secondsToMilliseconds(5));

    const resetData = useCallback(() => {
        setIsResetTriggered(true);
        setPositionType(undefined);
        if (ammChainedSpeedMarketsLimitsData?.minChainedMarkets) {
            setChainedPositions(Array(ammChainedSpeedMarketsLimitsData.minChainedMarkets).fill(undefined));
        }
        setDeltaTimeSec(0);
        setBuyinAmount(0);
    }, [ammChainedSpeedMarketsLimitsData?.minChainedMarkets]);

    useEffect(() => {
        if (!isConnected) {
            resetData();
        }
    }, [isConnected, resetData]);

    useEffect(() => {
        resetData();
    }, [networkId, resetData]);

    useEffect(() => {
        if (isResetTriggered) {
            setIsResetTriggered(false);
        }
    }, [isResetTriggered]);

    useEffect(() => {
        setBuyinAmount(0);
    }, [isChained]);

    const getStep = (stepNumber: number) => {
        const isAssetStep = stepNumber === TradingSteps.ASSET;
        const isDirectionsStep = stepNumber === TradingSteps.DIRECTION;
        const isTimeStep = stepNumber === TradingSteps.TIME;
        const isBuyinStep = stepNumber === TradingSteps.BUYIN;
        return (
            <>
                {isChained && isTimeStep && (
                    <SelectTime
                        selectedDeltaSec={deltaTimeSec}
                        onDeltaChange={setDeltaTimeSec}
                        ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                        isResetTriggered={isResetTriggered}
                        isChained={isChained}
                    />
                )}

                {isAssetStep && (
                    <SelectAsset selectedAsset={currencyKey} allAssets={SUPPORTED_ASSETS} onChange={setCurrencyKey} />
                )}
                {isDirectionsStep && (
                    <SelectPosition
                        setIsChained={setIsChained}
                        selected={isChained ? chainedPositions : [positionType]}
                        onChange={setPositionType}
                        onChainedChange={setChainedPositions}
                        resetData={resetData}
                        profitAndSkewPerPosition={profitAndSkewPerPosition}
                    />
                )}
                {isTimeStep && !isChained && (
                    <SelectTime
                        selectedDeltaSec={deltaTimeSec}
                        onDeltaChange={setDeltaTimeSec}
                        ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                        isResetTriggered={isResetTriggered}
                        isChained={isChained}
                    />
                )}
                {isBuyinStep && (
                    <SelectBuyin
                        onChange={setBuyinAmount}
                        isChained={isChained}
                        chainedPositions={chainedPositions}
                        ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                        ammChainedSpeedMarketsLimits={ammChainedSpeedMarketsLimitsData}
                        currencyKey={currencyKey}
                        isResetTriggered={isResetTriggered}
                        setHasError={setHasError}
                    />
                )}
            </>
        );
    };

    return (
        <Container>
            {!isAppReady || ammSpeedMarketsLimitsQuery.isLoading || ammChainedSpeedMarketsLimitsQuery.isLoading ? (
                <SimpleLoader />
            ) : (
                <>
                    <HeaderImage />
                    <ContentWrapper>
                        <LeftSide>
                            <Info>
                                <Trans
                                    i18nKey={isChained ? 'speed-markets.chained.info' : 'speed-markets.info'}
                                    components={{
                                        bold: <BoldText />,
                                    }}
                                    values={{
                                        minMarkets: ammChainedSpeedMarketsLimitsData?.minChainedMarkets,
                                        maxMarkets: ammChainedSpeedMarketsLimitsData?.maxChainedMarkets,
                                        maxRoi: ammChainedSpeedMarketsLimitsData
                                            ? roundNumberToDecimals(
                                                  ammChainedSpeedMarketsLimitsData?.payoutMultipliers[
                                                      ammChainedSpeedMarketsLimitsData.maxChainedMarkets -
                                                          ammChainedSpeedMarketsLimitsData.minChainedMarkets
                                                  ] ** ammChainedSpeedMarketsLimitsData?.maxChainedMarkets,
                                                  0
                                              )
                                            : '...',
                                    }}
                                />
                            </Info>
                            <LightweightChart
                                position={isChained ? undefined : positionType}
                                asset={currencyKey}
                                selectedPrice={
                                    !isChained && positionType !== undefined ? currentPrices[currencyKey] : undefined
                                }
                                selectedDate={Date.now() + secondsToMilliseconds(deltaTimeSec)}
                                deltaTimeSec={deltaTimeSec}
                                explicitCurrentPrice={currentPrices[currencyKey]}
                                prevExplicitPrice={prevPrice.current}
                                chainedRisk={isChained ? ammChainedSpeedMarketsLimitsData?.risk : undefined}
                                risksPerAsset={isChained ? undefined : ammSpeedMarketsLimitsData?.risksPerAsset}
                                risksPerAssetAndDirection={
                                    isChained ? undefined : ammSpeedMarketsLimitsData?.risksPerAssetAndDirection
                                }
                                hideChart={isMobile}
                            />
                        </LeftSide>
                        <RightSide>
                            {getStep(TradingSteps.ASSET)}
                            {getStep(TradingSteps.DIRECTION)}
                            {getStep(TradingSteps.TIME)}
                            {getStep(TradingSteps.BUYIN)}
                        </RightSide>
                    </ContentWrapper>

                    <AmmSpeedTrading
                        isChained={isChained}
                        currencyKey={currencyKey}
                        positionType={positionType}
                        chainedPositions={chainedPositions}
                        deltaTimeSec={deltaTimeSec}
                        enteredBuyinAmount={buyinAmount}
                        ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                        ammChainedSpeedMarketsLimits={ammChainedSpeedMarketsLimitsData}
                        currentPrice={currentPrices[currencyKey]}
                        setProfitAndSkewPerPosition={setProfitAndSkewPerPosition}
                        resetData={resetData}
                        hasError={hasError}
                    />
                    <PageLinkBanner link={LINKS.Markets.Thales} />
                    {isConnected && (
                        <UserOpenPositions
                            isChained={isChained}
                            currentPrices={currentPrices}
                            maxPriceDelayForResolvingSec={ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec}
                            onChainedSelectedChange={setIsChainedLinkSelected}
                            showTabs
                        />
                    )}
                    <OverviewLinkWrapper $isTableAbove={isConnected}>
                        <SPAAnchor
                            href={buildHref(
                                `${ROUTES.Markets.SpeedMarketsOverview}?isChained=${
                                    isConnected ? isChainedLinkSelected : isChained
                                }`
                            )}
                        >
                            <OverviewLinkText>
                                {(isConnected ? isChainedLinkSelected : isChained)
                                    ? t('speed-markets.overview.navigate-chained')
                                    : t('speed-markets.overview.navigate')}
                            </OverviewLinkText>
                            <ArrowRight className="icon icon--arrow" />
                        </SPAAnchor>
                    </OverviewLinkWrapper>

                    <MobileMenu onChartClick={() => setShowChartModal(!showChartModal)} />
                </>
            )}
            <Modal
                isOpen={showChartModal}
                onClose={() => setShowChartModal(false)}
                title={t('speed-markets.chart-title', { currencyKey })}
                width="100%"
            >
                <LightweightChart
                    position={isChained ? undefined : positionType}
                    asset={currencyKey}
                    selectedPrice={!isChained && positionType !== undefined ? currentPrices[currencyKey] : undefined}
                    selectedDate={Date.now() + secondsToMilliseconds(deltaTimeSec)}
                    deltaTimeSec={deltaTimeSec}
                    explicitCurrentPrice={currentPrices[currencyKey]}
                    prevExplicitPrice={prevPrice.current}
                    chainedRisk={isChained ? ammChainedSpeedMarketsLimitsData?.risk : undefined}
                    risksPerAsset={isChained ? undefined : ammSpeedMarketsLimitsData?.risksPerAsset}
                    risksPerAssetAndDirection={
                        isChained ? undefined : ammSpeedMarketsLimitsData?.risksPerAssetAndDirection
                    }
                    hideLiquidity
                />
            </Modal>
        </Container>
    );
};

const Container = styled.div`
    position: relative;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    min-height: 580px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: 190px;
    }
`;

const HeaderImage = styled.div`
    height: 130px;
    background-image: url(${banner});
    background-position: center;
    border: 1px solid ${(props) => props.theme.borderColor.quinary};
    border-radius: 11px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

const ContentWrapper = styled.div`
    width: 100%;
    display: flex;
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 11px;
    justify-content: space-between;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        gap: 10px;
        margin-top: 0;
    }
`;

const LeftSide = styled.div`
    height: 100%;
    width: 100%;
    max-width: 780px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        max-width: initial;
    }
`;
const RightSide = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 17px;
    max-width: 340px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        max-width: initial;
    }
`;

const Info = styled.span`
    display: block;
    text-align: justify;
    font-size: 18px;
    font-weight: 300;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.quinary};
    min-height: 40px;
`;

const OverviewLinkWrapper = styled.div<{ $isTableAbove: boolean }>`
    position: relative;
    width: max-content;
    margin-top: ${(props) => (props.$isTableAbove ? '-39px' : '20px')};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-top: 10px;
    }
`;

const OverviewLinkText = styled.span`
    font-size: 18px;
    line-height: 110%;
    &:hover {
        text-decoration: underline;
    }
`;

const ArrowRight = styled.i`
    font-size: 14px;
    margin-left: 6px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-bottom: 4px;
    }
`;

export default SpeedMarkets;
