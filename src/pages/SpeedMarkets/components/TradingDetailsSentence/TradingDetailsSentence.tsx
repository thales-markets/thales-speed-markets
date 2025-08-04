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
import {
    Coins,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatShortDateWithTime,
    LONG_CURRENCY_DECIMALS,
    SHORT_CURRENCY_DECIMALS,
} from 'thales-utils';
import { RootState } from 'types/ui';
import { getDefaultCollateral, isLpSupported, isStableCurrency } from 'utils/currency';
import { useChainId } from 'wagmi';
import { Cotainer, Footer, PositionText, Text, TextFooter, TextLabel, TextValue } from './styled-components';

type SpeedMarketsTrade = {
    strikePrice: number;
    positionType?: Positions | undefined;
    chainedPositions?: (Positions | undefined)[];
};

type TradingDetailsSentenceProps = {
    currencyKey: string;
    market: SpeedMarketsTrade;
    isFetchingQuote: boolean;
    payout: number;
    deltaTimeSec: number;
    selectedCollateral: Coins;
};

const TradingDetailsSentence: React.FC<TradingDetailsSentenceProps> = ({
    currencyKey,
    market,
    isFetchingQuote,
    payout,
    deltaTimeSec,
    selectedCollateral,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [dateFromDelta, setDateFromDelta] = useState(0);

    const isDefaultCollateral = selectedCollateral === getDefaultCollateral(networkId);
    const collateralHasLp = isLpSupported(selectedCollateral);

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
        : isDefaultCollateral || !collateralHasLp
        ? formatCurrencyWithSign(USD_SIGN, payout)
        : formatCurrencyWithKey(
              `$${selectedCollateral}`,
              payout,
              isStableCurrency(selectedCollateral) ? SHORT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS
          );

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
                  : secondsToMinutes(deltaTimeSec) === 1
                  ? t('common.time-remaining.minute')
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
                        <TextValue>
                            {` (${t('speed-markets.chained.starting-from')} ${formatCurrencyWithSign(
                                USD_SIGN,
                                market.strikePrice
                            )})*`}
                        </TextValue>
                    )}
                    {!isChained && (
                        <TextValue $uppercase={!!positionTypeFormatted} $lowercase={!positionTypeFormatted}>
                            {' '}
                            {positionTypeFormatted
                                ? positionTypeFormatted
                                : `( ${t('speed-markets.amm-trading.choose-direction')} )`}
                        </TextValue>
                    )}
                    {!isChained && <TextValue> {formatCurrencyWithSign(USD_SIGN, market.strikePrice)}*</TextValue>}
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
                    {!collateralHasLp && <TextLabel>{` ${t('speed-markets.amm-trading.at-least')}`}</TextLabel>}
                    <TextValue $isProfit>
                        {' '}
                        {payout > 0 ? potentialWinFormatted : '( ' + t('speed-markets.amm-trading.based-amount') + ' )'}
                    </TextValue>
                    {!collateralHasLp && payout > 0 && (
                        <Tooltip overlay={t('speed-markets.tooltips.payout-conversion')} />
                    )}
                </Text>
            </FlexDivCentered>

            <Footer isRelative={isChained || isMobile}>
                <TextFooter>
                    {
                        '*price shown is provisional, actual price will be known via Pyth oracles at the transaction mining time'
                    }
                </TextFooter>
            </Footer>
        </Cotainer>
    );
};

export default TradingDetailsSentence;
