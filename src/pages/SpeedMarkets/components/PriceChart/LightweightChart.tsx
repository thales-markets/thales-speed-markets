import TooltipInfo from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { LINKS } from 'constants/links';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';

import usePythCandlestickQuery from 'queries/prices/usePythCandlestickQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivRowCentered, FlexDivSpaceBetween } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { Risk, RiskPerAsset, RiskPerAssetAndPosition } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';

import SimpleLoader from 'components/SimpleLoader';
import { hoursToSeconds, minutesToSeconds, subDays } from 'date-fns';
import { ChartComponent } from './components/Chart/ChartContext';
import CurrentPrice from './components/CurrentPrice';
import Toggle from './components/DateToggle';
import { useChainId, useClient } from 'wagmi';
import { useTheme } from 'styled-components';
import { getIsMobile } from 'redux/modules/ui';

const now = new Date();

type LightweightChartProps = {
    asset: string;
    position: Positions | undefined;
    selectedPrice?: number;
    selectedDate?: number;
    explicitCurrentPrice?: number;
    prevExplicitPrice?: number;
    chainedRisk?: Risk;
    risksPerAsset?: RiskPerAsset[];
    deltaTimeSec?: number;
    risksPerAssetAndDirection?: RiskPerAssetAndPosition[];
};

const SpeedMarketsToggleButtons = [
    { label: '1m', resolution: '1', value: 1, startDate: Number(subDays(now, 1)) },
    { label: '5m', resolution: '5', value: 1, startDate: Number(subDays(now, 1)) },
    { label: '15m', resolution: '15', value: 2, startDate: Number(subDays(now, 2)) },
    { label: '30m', resolution: '30', value: 4, startDate: Number(subDays(now, 4)) },
    { label: '1H', resolution: '60', value: 30, startDate: Number(subDays(now, 30)) },
    { label: '1D', resolution: '1D', value: 365, startDate: Number(subDays(now, 365)) },
];

const SPEED_DEFAULT_TOGGLE_BUTTON_INDEX = 0;

const LightweightChart: React.FC<LightweightChartProps> = ({
    asset,
    selectedPrice,
    position,
    selectedDate,
    explicitCurrentPrice,
    deltaTimeSec,
    prevExplicitPrice,
    chainedRisk,
    risksPerAsset,
    risksPerAssetAndDirection,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useChainId();
    const client = useClient();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [dateRange, setDateRange] = useState(SpeedMarketsToggleButtons[SPEED_DEFAULT_TOGGLE_BUTTON_INDEX]);
    const [selectedToggleIndex, setToggleIndex] = useState(SPEED_DEFAULT_TOGGLE_BUTTON_INDEX);

    const [candleData, setCandleData] = useState<any>();

    const [currentDeltaTimeSec, setCurrentDeltaTimeSec] = useState(deltaTimeSec);

    const exchangeRatesMarketDataQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    const pythQuery = usePythCandlestickQuery(asset, dateRange.startDate, dateRange.resolution, {
        enabled: isAppReady,
        refetchInterval: 30 * 1000,
    });

    const candleStickData = useMemo(() => {
        if (pythQuery.isSuccess && pythQuery.data) {
            return pythQuery.data;
        }
    }, [pythQuery.isSuccess, pythQuery.data]);

    const currentPrice = useMemo(() => {
        if (explicitCurrentPrice) {
            return explicitCurrentPrice;
        } else if (exchangeRatesMarketDataQuery.isSuccess && exchangeRatesMarketDataQuery.data) {
            return exchangeRatesMarketDataQuery.data[asset];
        }
    }, [exchangeRatesMarketDataQuery.isSuccess, exchangeRatesMarketDataQuery.data, asset, explicitCurrentPrice]);

    useEffect(() => {
        if (currentPrice && candleStickData && candleStickData.length) {
            const cloneData = [...candleStickData];
            cloneData[cloneData.length - 1].close = currentPrice;
            setCandleData(cloneData);
        }
    }, [currentPrice, candleStickData]);

    const handleDateRangeChange = useCallback((value: number) => {
        setDateRange(SpeedMarketsToggleButtons[value]);
        setToggleIndex(value);
    }, []);

    // save previous deltaTimeSec
    const prevDeltaTimeSecRef = useRef<number | undefined>(currentDeltaTimeSec);
    useEffect(() => {
        prevDeltaTimeSecRef.current = currentDeltaTimeSec;
        setCurrentDeltaTimeSec(deltaTimeSec);
    }, [deltaTimeSec, currentDeltaTimeSec]);

    // useEffect for changing the dateRange on chart when user clicks on speed markets buttons for time
    useEffect(() => {
        if (deltaTimeSec && deltaTimeSec !== prevDeltaTimeSecRef.current) {
            if (deltaTimeSec >= hoursToSeconds(10)) {
                if (dateRange.resolution !== SpeedMarketsToggleButtons[4].resolution) {
                    handleDateRangeChange(4);
                }
            } else {
                if (deltaTimeSec >= hoursToSeconds(4)) {
                    if (dateRange.resolution !== SpeedMarketsToggleButtons[3].resolution) {
                        handleDateRangeChange(3);
                    }
                } else {
                    if (deltaTimeSec >= hoursToSeconds(1)) {
                        if (dateRange.resolution !== SpeedMarketsToggleButtons[2].resolution) {
                            handleDateRangeChange(2);
                        }
                    } else {
                        if (deltaTimeSec >= minutesToSeconds(30)) {
                            if (dateRange.resolution !== SpeedMarketsToggleButtons[1].resolution) {
                                handleDateRangeChange(1);
                            }
                        }
                    }
                }
            }
        }
    }, [deltaTimeSec, dateRange.resolution, handleDateRangeChange]);

    const risk = chainedRisk
        ? chainedRisk
        : risksPerAsset?.filter((riskPerAsset) => riskPerAsset.currency === asset)[0];
    const liquidity = risk ? formatCurrencyWithSign(USD_SIGN, risk.max - risk.current) : 0;

    const riskPerDirectionUp = risksPerAssetAndDirection?.filter(
        (risk) => risk.currency === asset && risk.position === Positions.UP
    )[0];
    const liquidityPerUp = riskPerDirectionUp
        ? formatCurrencyWithSign(USD_SIGN, riskPerDirectionUp.max - riskPerDirectionUp.current)
        : 0;
    const riskPerDirectionDown = risksPerAssetAndDirection?.filter(
        (risk) => risk.currency === asset && risk.position === Positions.DOWN
    )[0];
    const liquidityPerDown = riskPerDirectionDown
        ? formatCurrencyWithSign(USD_SIGN, riskPerDirectionDown.max - riskPerDirectionDown.current)
        : 0;

    const isPriceUp = (explicitCurrentPrice || 0) > (prevExplicitPrice || 0);

    return (
        <Wrapper>
            <FlexDivSpaceBetween>
                <FlexDivRowCentered>
                    <CurrentPrice asset={asset} currentPrice={currentPrice} isPriceUp={isPriceUp} />
                    <TooltipInfo
                        overlay={t('speed-markets.tooltips.current-price')}
                        customIconStyling={{
                            color: isPriceUp ? theme.positionColor.up : theme.positionColor.down,
                            marginLeft: '6px',
                        }}
                    />
                </FlexDivRowCentered>
                {!!liquidity && (
                    <FlexDiv>
                        <span>
                            <Label>{t('common.liquidity')}</Label>
                            <Value margin="0 0 0 4px">{liquidity}</Value>
                        </span>
                        <TooltipInfo
                            overlay={
                                <Trans
                                    i18nKey={
                                        chainedRisk
                                            ? 'speed-markets.chained.tooltips.liquidity'
                                            : 'speed-markets.tooltips.liquidity'
                                    }
                                    components={{
                                        br: <br />,
                                    }}
                                    values={{
                                        liquidityPerUp,
                                        liquidityPerDown,
                                    }}
                                />
                            }
                            customIconStyling={{ color: theme.textColor.quaternary }}
                        />
                    </FlexDiv>
                )}
            </FlexDivSpaceBetween>
            {!isMobile && (
                <>
                    <ChartContainer>
                        {pythQuery.isLoading ? (
                            <SimpleLoader />
                        ) : (
                            <ChartComponent
                                resolution={dateRange.resolution}
                                data={candleData}
                                position={position}
                                asset={asset}
                                selectedPrice={selectedPrice}
                                selectedDate={selectedDate}
                            />
                        )}
                    </ChartContainer>

                    <Toggle
                        options={SpeedMarketsToggleButtons}
                        selectedIndex={selectedToggleIndex}
                        onChange={handleDateRangeChange}
                    />
                    <PythIconWrap>
                        <a target="_blank" rel="noreferrer" href={LINKS.Pyth.Benchmarks}>
                            <i className="icon icon--pyth" />
                        </a>
                    </PythIconWrap>
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    margin-top: 15px;
`;

const ChartContainer = styled.div`
    height: 291px;
    margin-top: 15px;
`;

const Label = styled.span<{ margin?: string }>`
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 18px;
    }
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 16px;
    }
`;

const Value = styled(Label)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const PythIconWrap = styled.div`
    position: absolute;
    height: 20px;
    right: 20px;
    bottom: 35px;
    z-index: 1;
    i {
        font-size: 40px;
        line-height: 10px;
        color: ${(props) => props.theme.textColor.quinary};
    }
`;

export default LightweightChart;
