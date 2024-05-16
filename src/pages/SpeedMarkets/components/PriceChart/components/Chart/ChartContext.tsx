import Button from 'components/Button';
import { ChartContext } from 'constants/chart';
import { Positions } from 'enums/market';
import { ColorType, IChartApi, createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { AreaSeriesComponent } from './components/AreaSerierComponent';
import { CandlestickComponent } from './components/CandlestickComponent';
import { UserPositionAreaSeries } from './components/UserSeriesComponent';

type ChartContextProps = {
    children: React.ReactNode;
    chart: IChartApi | null;
};

type ChartProps = {
    data: any;
    position: Positions | undefined;
    asset: string;
    selectedPrice?: number;
    selectedDate?: number;
    resolution?: string;
};

const ChartProvider: React.FC<ChartContextProps> = ({ children, chart }) => (
    <ChartContext.Provider value={chart}>{children}</ChartContext.Provider>
);

export const ChartComponent: React.FC<ChartProps> = ({
    data,
    position,
    asset,
    selectedPrice,
    selectedDate,
    resolution,
}) => {
    const theme: ThemeInterface = useTheme();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chart, setChart] = useState<IChartApi | undefined>();
    const [displayPositions, setDisplayPositions] = useState(false);

    useEffect(() => {
        const chart = createChart(chartContainerRef.current ?? '', {
            layout: {
                background: { type: ColorType.Solid, color: theme.background.primary },
                textColor: theme.chart.labels,
                fontFamily: theme.fontFamily.primary,
            },
            height: 285,
            grid: {
                vertLines: {
                    visible: true,
                    color: theme.borderColor.primary,
                },
                horzLines: {
                    visible: true,
                    color: theme.borderColor.primary,
                },
            },
            timeScale: {
                rightOffset: 3,
                timeVisible: true,
                fixLeftEdge: true,
                barSpacing: 10,
            },
        });
        setChart(chart);
        return () => {
            chart.remove();
        };
    }, [theme]);

    useEffect(() => {
        setDisplayPositions(Number(resolution) === 1);
    }, [resolution]);

    return (
        <ChartContainer>
            <Chart ref={chartContainerRef}>
                {chart && (
                    <ChartProvider chart={chart}>
                        <CandlestickComponent data={data} asset={asset} />

                        <AreaSeriesComponent
                            asset={asset}
                            data={data}
                            position={position}
                            selectedPrice={selectedPrice}
                            selectedDate={selectedDate}
                        />

                        {displayPositions && <UserPositionAreaSeries candlestickData={data} asset={asset} />}
                    </ChartProvider>
                )}
            </Chart>
            <ResetButton>
                <Button
                    width="50px"
                    height="30px"
                    textColor={theme.button.textColor.tertiary}
                    backgroundColor={theme.button.background.primary}
                    borderColor={theme.button.borderColor.secondary}
                    fontSize="13px"
                    borderWidth="1px"
                    borderRadius="8px"
                    additionalStyles={{
                        transition: 'all 0.2s ease-in-out',
                        textTransform: 'none',
                    }}
                    onClick={() => {
                        chart?.timeScale().resetTimeScale();
                        chart?.applyOptions({
                            rightPriceScale: {
                                autoScale: true,
                            },
                        });
                    }}
                >
                    <ReloadIcon className="icon icon--reload" />
                </Button>
            </ResetButton>
        </ChartContainer>
    );
};

const ChartContainer = styled.div`
    height: 291px;
    position: relative;
`;

const Chart = styled.div``;

const ResetButton = styled.div`
    position: absolute;
    width: 35px;
    left: 0;
    bottom: -31px;
    i {
        font-size: 16px;
    }
`;

const ReloadIcon = styled.i`
    color: ${(props) => props.theme.icon.textColor.tertiary};
`;
