import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/market';

const MarketPrice: React.FC<{ position: UserPosition }> = ({ position }) => {
    const { t } = useTranslation();

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);

    useInterval(() => {
        // when becomes matured
        if (Date.now() > position.maturityDate) {
            setIsMatured(true);
        }
    }, secondsToMilliseconds(1));

    // when new position is added, refresh maturity status
    useEffect(() => {
        setIsMatured(Date.now() > position.maturityDate);
    }, [position.maturityDate]);

    return (
        <>
            {isMatured ? (
                position.finalPrice > 0 ? (
                    formatCurrencyWithSign(USD_SIGN, position.finalPrice)
                ) : (
                    <>
                        {'. . .'}
                        <Tooltip overlay={t('speed-markets.tooltips.final-price-missing')} />
                    </>
                )
            ) : (
                formatCurrencyWithSign(USD_SIGN, position.currentPrice)
            )}
        </>
    );
};

export default MarketPrice;
