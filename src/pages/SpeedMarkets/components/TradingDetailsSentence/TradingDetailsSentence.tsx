import Tooltip from 'components/Tooltip/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToHours, secondsToMilliseconds, secondsToMinutes } from 'date-fns';
import { Positions } from 'enums/market';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign, formatShortDateWithTime } from 'thales-utils';
import { MarketInfo } from 'types/market';
import { RootState } from 'types/ui';
import { getDefaultCollateral } from 'utils/currency';
import { ColumnSpaceBetween, Text, TextLabel, TextValue } from './styled-components';
import { useChainId } from 'wagmi';

type SpeedMarketsTrade = {
    address: string;
    strikePrice: number;
    positionType?: Positions.UP | Positions.DOWN | undefined;
    chainedPositions?: (Positions.UP | Positions.DOWN | undefined)[];
};

type TradingDetailsSentenceProps = {
    currencyKey: string;
    maturityDate: number;
    market: MarketInfo | SpeedMarketsTrade;
    isFetchingQuote: boolean;
    priceProfit: number | string;
    paidAmount: number | string;
    deltaTimeSec?: number;
    hasCollateralConversion?: boolean;
};

const TradingDetailsSentence: React.FC<TradingDetailsSentenceProps> = ({
    currencyKey,
    maturityDate,
    market,
    isFetchingQuote,
    priceProfit,
    paidAmount,
    deltaTimeSec,
    hasCollateralConversion,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [dateFromDelta, setDateFromDelta] = useState(0);

    useEffect(() => {
        if (deltaTimeSec) {
            setDateFromDelta(Date.now() + secondsToMilliseconds(deltaTimeSec));
        }
    }, [deltaTimeSec]);

    // Refresh datetime on every minute change
    useInterval(() => {
        if (deltaTimeSec) {
            const currentMinute = new Date().getMinutes();
            const maturityMinute = new Date(maturityDate).getMinutes() - secondsToMinutes(deltaTimeSec);

            if (currentMinute !== maturityMinute) {
                setDateFromDelta(Date.now() + secondsToMilliseconds(deltaTimeSec));
            }
        }
    }, secondsToMilliseconds(5));

    const potentialWinFormatted = isFetchingQuote
        ? '...'
        : `${formatCurrencyWithKey(getDefaultCollateral(networkId), (1 + Number(priceProfit)) * Number(paidAmount))}`;

    const positionTypeFormatted =
        market.positionType === Positions.UP
            ? t('common.above')
            : market.positionType === Positions.DOWN
            ? t('common.below')
            : '';

    const chainedPositions = (market as SpeedMarketsTrade).chainedPositions || [];
    const isChained = chainedPositions.length > 1;

    const deltaTimeFormatted = deltaTimeSec
        ? `${secondsToHours(deltaTimeSec) !== 0 ? secondsToHours(deltaTimeSec) : secondsToMinutes(deltaTimeSec)} ${
              secondsToHours(deltaTimeSec) !== 0
                  ? secondsToHours(deltaTimeSec) === 1
                      ? t('common.time-remaining.hour')
                      : t('common.time-remaining.hours')
                  : t('common.time-remaining.minutes')
          }`
        : `... ${t('common.time-remaining.minutes')}`;

    const fullDateFromDeltaTimeFormatted = deltaTimeSec
        ? `(${isChained ? t('common.starting') + ' ' : ''}${formatShortDateWithTime(dateFromDelta)})`
        : `( ${t('speed-markets.amm-trading.choose-time')} )`;

    const timeFormatted = deltaTimeSec
        ? `${deltaTimeFormatted} ${fullDateFromDeltaTimeFormatted}`
        : maturityDate
        ? formatShortDateWithTime(maturityDate)
        : `( ${t('speed-markets.amm-trading.choose-time')} )`;

    const getChainedPositions = () =>
        chainedPositions.map((pos, index) => (
            <PositionText $isUp={pos === Positions.UP} key={index}>{`${pos}${
                index !== chainedPositions.length - 1 ? ', ' : ''
            }`}</PositionText>
        ));

    const isAllChainedMarketsSelected = chainedPositions.every((pos) => pos !== undefined);

    return (
        <ColumnSpaceBetween>
            <FlexDivCentered>
                <Text>
                    <TextLabel>
                        {t(isChained ? 'speed-markets.chained.asset-price' : 'speed-markets.amm-trading.asset-price', {
                            asset: currencyKey,
                        })}
                    </TextLabel>
                    {isChained && (
                        <SentanceTextValue>
                            {`(${t('speed-markets.chained.starting-from')} ${formatCurrencyWithSign(
                                USD_SIGN,
                                (market as MarketInfo).strikePrice
                            )}),`}
                        </SentanceTextValue>
                    )}
                    {market.address ? (
                        <>
                            {!isMobile && !isChained && (
                                <SentanceTextValue
                                    $uppercase={!!positionTypeFormatted}
                                    $lowercase={!positionTypeFormatted}
                                >
                                    {positionTypeFormatted
                                        ? positionTypeFormatted
                                        : `( ${t('speed-markets.amm-trading.choose-direction')} )`}
                                </SentanceTextValue>
                            )}
                            {!isChained && (
                                <SentanceTextValue>
                                    {formatCurrencyWithSign(USD_SIGN, (market as MarketInfo).strikePrice)}
                                </SentanceTextValue>
                            )}
                        </>
                    ) : (
                        <SentanceTextValue>{'( ' + t('speed-markets.amm-trading.pick-price') + ' )'}</SentanceTextValue>
                    )}
                </Text>
            </FlexDivCentered>
            {isChained && (
                <FlexDivCentered>
                    <SentanceTextValue $uppercase={!!positionTypeFormatted} $lowercase={!positionTypeFormatted}>
                        <TextLabel>{t('speed-markets.chained.follows')}&nbsp;</TextLabel>
                        {isAllChainedMarketsSelected
                            ? getChainedPositions()
                            : `( ${t('speed-markets.chained.errors.choose-directions')} )`}
                    </SentanceTextValue>
                </FlexDivCentered>
            )}
            <FlexDivCentered>
                <Text>
                    <TextLabel>
                        {isChained ? t('common.with') : deltaTimeSec ? t('common.in') : t('common.on')}
                    </TextLabel>
                    {isChained ? (
                        <>
                            <SentanceTextValue $lowercase>{deltaTimeFormatted}</SentanceTextValue>
                            <TextLabel>{` ${t('speed-markets.chained.between-rounds')}`}</TextLabel>
                            {!isMobile && (
                                <SentanceTextValue $lowercase>{fullDateFromDeltaTimeFormatted}</SentanceTextValue>
                            )}
                        </>
                    ) : (
                        <SentanceTextValue $lowercase>{timeFormatted}</SentanceTextValue>
                    )}
                </Text>
            </FlexDivCentered>
            {isChained && isMobile && (
                <FlexDivCentered>
                    <SentanceTextValue $lowercase>{fullDateFromDeltaTimeFormatted}</SentanceTextValue>
                </FlexDivCentered>
            )}
            <FlexDivCentered>
                <Text>
                    <TextLabel>{t('speed-markets.amm-trading.you-win')}</TextLabel>
                    {hasCollateralConversion && <TextLabel>{` ${t('speed-markets.amm-trading.at-least')}`}</TextLabel>}
                    <SentanceTextValue $isProfit>
                        {Number(priceProfit) > 0 && Number(paidAmount) > 0
                            ? potentialWinFormatted
                            : '( ' + t('speed-markets.amm-trading.based-amount') + ' )'}
                    </SentanceTextValue>
                    {hasCollateralConversion && Number(priceProfit) > 0 && Number(paidAmount) > 0 && (
                        <Tooltip overlay={t('speed-markets.tooltips.payout-conversion')} />
                    )}
                </Text>
            </FlexDivCentered>
        </ColumnSpaceBetween>
    );
};

const SentanceTextValue = styled(TextValue)`
    padding-left: 5px;
`;

const PositionText = styled(TextValue)<{ $isUp: boolean }>`
    color: ${(props) => (props.$isUp ? props.theme.positionColor.up : props.theme.positionColor.down)};
    text-transform: uppercase;
`;

export default TradingDetailsSentence;
