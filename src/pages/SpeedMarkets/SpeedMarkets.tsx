import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import banner from 'assets/images/speed-markets-banner.png';
import PageLinkBanner from 'components/PageLinkBanner';
import SPAAnchor from 'components/SPAAnchor/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { LINKS } from 'constants/links';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import { Positions, TradingSteps } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import OpenPositions from 'pages/SpeedMarkets/components/OpenPositions';
import LightweightChart from 'pages/SpeedMarkets/components/PriceChart/LightweightChart';
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
import ClosedPositions from './components/ClosedPositions';
import SelectAsset from './components/SelectAsset';
import SelectBuyin from './components/SelectBuyin';
import SelectPosition from './components/SelectPosition';
import { SelectedPosition } from './components/SelectPosition/SelectPosition';
import SelectTime from './components/SelectTime';

const SpeedMarkets: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useChainId();
    const client = useClient();
    const { isConnected } = useAccount();

    const isChainedSupported = getSupportedNetworksByRoute(ROUTES.Markets.ChainedSpeedMarkets).includes(networkId);
    const isChainedMarkets = isChainedSupported && queryString.parse(location.search).isChained === 'true';

    const [isChained, setIsChained] = useState(isChainedMarkets);
    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());
    const [currencyKey, setCurrencyKey] = useState(SUPPORTED_ASSETS[0]);
    const [positionType, setPositionType] = useState<SelectedPosition>(undefined);
    const [chainedPositions, setChainedPositions] = useState<SelectedPosition[]>([undefined, undefined]);
    const [deltaTimeSec, setDeltaTimeSec] = useState(0);
    const [selectedStableBuyinAmount, setSelectedStableBuyinAmount] = useState(0);
    const [isResetTriggered, setIsResetTriggered] = useState(false);
    const [skew, setSkew] = useState({ [Positions.UP]: 0, [Positions.DOWN]: 0 });

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
        setSelectedStableBuyinAmount(0);
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
        setSelectedStableBuyinAmount(0);
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
                        ammChainedSpeedMarketsLimits={ammChainedSpeedMarketsLimitsData}
                        skew={skew}
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
                        onChange={setSelectedStableBuyinAmount}
                        isChained={isChained}
                        chainedPositions={chainedPositions}
                        ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                        ammChainedSpeedMarketsLimits={ammChainedSpeedMarketsLimitsData}
                        currencyKey={currencyKey}
                    />
                )}
            </>
        );
    };

    return (
        <>
            {ammSpeedMarketsLimitsQuery.isLoading || ammChainedSpeedMarketsLimitsQuery.isLoading ? (
                <SimpleLoader />
            ) : (
                <Container>
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
                                <Tooltip overlay={t('speed-markets.tooltips.buyin-fees')} />
                            </Info>
                            <LightweightChart
                                position={isChained ? undefined : positionType}
                                asset={currencyKey}
                                selectedPrice={
                                    !isChained && positionType !== undefined ? currentPrices[currencyKey] : undefined
                                }
                                selectedDate={getTimeStampForDelta(deltaTimeSec)}
                                deltaTimeSec={deltaTimeSec}
                                selectedRightPrice={undefined}
                                explicitCurrentPrice={currentPrices[currencyKey]}
                                prevExplicitPrice={prevPrice.current}
                                chainedRisk={isChained ? ammChainedSpeedMarketsLimitsData?.risk : undefined}
                                risksPerAsset={isChained ? undefined : ammSpeedMarketsLimitsData?.risksPerAsset}
                                risksPerAssetAndDirection={
                                    isChained ? undefined : ammSpeedMarketsLimitsData?.risksPerAssetAndDirection
                                }
                            ></LightweightChart>
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
                        selectedStableBuyinAmount={selectedStableBuyinAmount}
                        setSelectedStableBuyinAmount={setSelectedStableBuyinAmount}
                        ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                        ammChainedSpeedMarketsLimits={ammChainedSpeedMarketsLimitsData}
                        currentPrice={currentPrices[currencyKey]}
                        setSkewImpact={setSkew}
                        resetData={resetData}
                    />
                    <PageLinkBanner link={LINKS.Markets.Thales} />
                    {isConnected && (
                        <>
                            <OpenPositions
                                isChained={isChained}
                                maxPriceDelayForResolvingSec={ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec}
                                currentPrices={currentPrices}
                            />
                            <ClosedPositions isChained={isChained} />
                        </>
                    )}
                    <OverviewLinkWrapper>
                        <SPAAnchor href={buildHref(`${ROUTES.Markets.SpeedMarketsOverview}?isChained=${isChained}`)}>
                            <OverviewLinkText>
                                {isChained
                                    ? t('speed-markets.overview.navigate-chained')
                                    : t('speed-markets.overview.navigate')}
                            </OverviewLinkText>
                            <ArrowRight className="icon icon--arrow" />
                        </SPAAnchor>
                    </OverviewLinkWrapper>
                </Container>
            )}
        </>
    );
};

const getTimeStampForDelta = (seconds: number) => {
    if (seconds) {
        const reuslt = Number(Date.now() + seconds * 1000);
        return reuslt;
    }
};

const Container = styled.div`
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    min-height: 799px;
`;

const HeaderImage = styled.div`
    height: 120px;
    background-image: url(${banner});
    background-position: center;
    border: 1px solid ${(props) => props.theme.borderColor.secondary};
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
    gap: 20px;
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
    color: ${(props) => props.theme.textColor.primary};
`;

const OverviewLinkWrapper = styled.div`
    margin-top: 20px;
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
