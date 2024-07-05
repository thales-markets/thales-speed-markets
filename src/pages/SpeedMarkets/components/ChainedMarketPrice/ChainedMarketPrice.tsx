import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserChainedPosition } from 'types/market';

const ChainedMarketPrice: React.FC<{ position: UserChainedPosition; isStrikePrice?: boolean }> = ({
    position,
    isStrikePrice,
}) => {
    const { t } = useTranslation();

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);

    const strikeTimeIndex = position.strikeTimes.findIndex((t) => t > Date.now());

    useInterval(() => {
        // when becomes matured
        if (Date.now() > position.maturityDate) {
            setIsMatured(true);
        }
    }, secondsToMilliseconds(10));

    // when new position is added, refresh maturity status
    useEffect(() => {
        setIsMatured(Date.now() > position.maturityDate);
    }, [position.maturityDate]);

    return (
        <>
            {isStrikePrice ? (
                position.resolveIndex !== undefined ? (
                    formatCurrencyWithSign(USD_SIGN, position.strikePrices[position.resolveIndex])
                ) : position.strikePrices[strikeTimeIndex] > 0 ? (
                    formatCurrencyWithSign(USD_SIGN, position.strikePrices[strikeTimeIndex])
                ) : (
                    '. . .'
                )
            ) : position.resolveIndex !== undefined ? (
                formatCurrencyWithSign(USD_SIGN, position.finalPrices[position.resolveIndex])
            ) : isMatured ? (
                <>
                    {'. . .'}
                    <Tooltip overlay={t('speed-markets.tooltips.final-price-missing')} />
                </>
            ) : position.currentPrice > 0 ? (
                formatCurrencyWithSign(USD_SIGN, position.currentPrice)
            ) : (
                <>{'. . .'}</>
            )}
        </>
    );
};

export default ChainedMarketPrice;
