import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/market';
import { UserHistoryPosition } from 'types/profile';
import { getPriceId } from 'utils/pyth';
import { refetchPythPrice } from 'utils/queryConnector';
import { useChainId } from 'wagmi';

const MarketPrice: React.FC<{ position: UserPosition | UserHistoryPosition }> = ({ position }) => {
    const { t } = useTranslation();

    const networkId = useChainId();

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);

    const finalPrice = (position as UserHistoryPosition).finalPrices
        ? (position as UserHistoryPosition).finalPrices[0]
        : (position as UserPosition).finalPrice;

    useInterval(() => {
        // when becomes matured
        if (Date.now() > position.maturityDate) {
            setIsMatured(true);

            if (finalPrice === 0) {
                refetchPythPrice(getPriceId(networkId, position.currencyKey), position.maturityDate);
            }
        }
    }, secondsToMilliseconds(1));

    // when new position is added, refresh maturity status
    useEffect(() => {
        setIsMatured(Date.now() > position.maturityDate);
    }, [position.maturityDate]);

    return (
        <>
            {isMatured ? (
                finalPrice > 0 ? (
                    formatCurrencyWithSign(USD_SIGN, finalPrice)
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
