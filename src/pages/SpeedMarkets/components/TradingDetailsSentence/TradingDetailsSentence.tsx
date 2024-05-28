import Tooltip from 'components/Tooltip/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToHours, secondsToMilliseconds, secondsToMinutes } from 'date-fns';
import { Positions } from 'enums/market';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import { FlexDivCentered } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign, formatShortDateWithTime } from 'thales-utils';
import { MarketInfo } from 'types/market';
import { RootState } from 'types/ui';
import { getDefaultCollateral } from 'utils/currency';
import { useChainId } from 'wagmi';
import { Cotainer, PositionText, Text, TextLabel, TextValue } from './styled-components';

type SpeedMarketsTrade = {
    address: string;
    strikePrice: number;
    positionType?: Positions.UP | Positions.DOWN | undefined;
    chainedPositions?: (Positions.UP | Positions.DOWN | undefined)[];
};

type TradingDetailsSentenceProps = {
    currencyKey: string;
    market: MarketInfo | SpeedMarketsTrade;
    isFetchingQuote: boolean;
    profit: number;
    paidAmount: number;
    deltaTimeSec?: number;
    hasCollateralConversion?: boolean;
};

const TradingDetailsSentence: React.FC<TradingDetailsSentenceProps> = ({
    currencyKey,
    market,
    isFetchingQuote,
    profit,
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
            setDateFromDelta(Date.now() + secondsToMilliseconds(deltaTimeSec));
        }
    }, secondsToMilliseconds(5));

    const potentialWinFormatted = isFetchingQuote
        ? '...'
        : `${formatCurrencyWithKey(getDefaultCollateral(networkId), profit * paidAmount)}`;

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
        : `( ${t('speed-markets.amm-trading.choose-time')} ) ${t('common.time-remaining.minutes')}`;

    const fullDateFromDeltaTimeFormatted = deltaTimeSec
        ? `(${formatShortDateWithTime(dateFromDelta)})`
        : `( ${t('speed-markets.amm-trading.choose-time')} )`;

    const timeFormatted = deltaTimeSec
        ? `${deltaTimeFormatted} ${fullDateFromDeltaTimeFormatted}`
        : `( ${t('speed-markets.amm-trading.choose-time')} )`;

    const getChainedPositions = () =>
        chainedPositions.map((pos, index) => (
            <PositionText $isUp={pos === Positions.UP} key={index}>{`${pos}${
                index !== chainedPositions.length - 1 ? ', ' : ''
            }`}</PositionText>
        ));

    const isAllChainedMarketsSelected = chainedPositions.every((pos) => pos !== undefined);

    return (
        <Cotainer>
            {/* First line */}
            <FlexDivCentered>
                <Text>
                    <TextLabel>
                        {t(isChained ? 'speed-markets.chained.asset-price' : 'speed-markets.amm-trading.asset-price', {
                            asset: currencyKey,
                        })}
                    </TextLabel>
                    {isChained && (
                        <>
                            <br />
                            <TextValue>
                                {`(${t('speed-markets.chained.starting-from')} ${formatCurrencyWithSign(
                                    USD_SIGN,
                                    (market as MarketInfo).strikePrice
                                )})`}
                            </TextValue>
                        </>
                    )}
                    {market.address ? (
                        <>
                            {!isMobile && !isChained && (
                                <TextValue $uppercase={!!positionTypeFormatted} $lowercase={!positionTypeFormatted}>
                                    {' '}
                                    {positionTypeFormatted
                                        ? positionTypeFormatted
                                        : `( ${t('speed-markets.amm-trading.choose-direction')} )`}
                                </TextValue>
                            )}
                            {!isChained && (
                                <TextValue>
                                    {' '}
                                    {formatCurrencyWithSign(USD_SIGN, (market as MarketInfo).strikePrice)}
                                </TextValue>
                            )}
                        </>
                    ) : (
                        <TextValue>{' ( ' + t('speed-markets.amm-trading.pick-price') + ' )'}</TextValue>
                    )}
                </Text>
            </FlexDivCentered>
            {isChained && (
                <FlexDivCentered>
                    <TextValue $uppercase={!!positionTypeFormatted} $lowercase={!positionTypeFormatted}>
                        {' '}
                        <TextLabel>{t('speed-markets.chained.follows')}&nbsp;</TextLabel>
                        {isAllChainedMarketsSelected
                            ? getChainedPositions()
                            : `( ${t('speed-markets.chained.errors.choose-directions')} )`}
                    </TextValue>
                </FlexDivCentered>
            )}

            {/* Second line */}
            <FlexDivCentered>
                <Text>
                    <TextLabel>
                        {isChained ? t('common.with') : deltaTimeSec ? t('common.in') : t('common.on')}
                    </TextLabel>
                    {isChained ? (
                        <>
                            <TextValue $lowercase> {deltaTimeFormatted}</TextValue>
                            <TextLabel>{` ${t('speed-markets.chained.between-rounds')}`}</TextLabel>
                        </>
                    ) : (
                        <TextValue $lowercase> {timeFormatted}</TextValue>
                    )}
                </Text>
            </FlexDivCentered>

            {/* Third line */}
            <FlexDivCentered>
                <Text>
                    <TextLabel>{t('speed-markets.amm-trading.you-win')}</TextLabel>
                    {hasCollateralConversion && <TextLabel>{` ${t('speed-markets.amm-trading.at-least')}`}</TextLabel>}
                    <TextValue $isProfit>
                        {' '}
                        {profit > 0 && paidAmount > 0
                            ? potentialWinFormatted
                            : '( ' + t('speed-markets.amm-trading.based-amount') + ' )'}
                    </TextValue>
                    {hasCollateralConversion && profit > 0 && paidAmount > 0 && (
                        <Tooltip overlay={t('speed-markets.tooltips.payout-conversion')} />
                    )}
                </Text>
            </FlexDivCentered>
        </Cotainer>
    );
};

export default TradingDetailsSentence;
