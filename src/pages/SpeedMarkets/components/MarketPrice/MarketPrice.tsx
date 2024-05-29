import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { getPriceId } from 'utils/pyth';
import { refetchPythPrice } from 'utils/queryConnector';
import { useChainId } from 'wagmi';

const MarketPrice: React.FC<{ position: UserOpenPositions }> = ({ position }) => {
    const { t } = useTranslation();

    const networkId = useChainId();

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);

    useInterval(() => {
        // when becomes matured
        if (Date.now() > position.maturityDate) {
            setIsMatured(true);

            if (!position.finalPrice) {
                refetchPythPrice(
                    getPriceId(networkId, position.currencyKey),
                    millisecondsToSeconds(position.maturityDate)
                );
            }
        }
    }, secondsToMilliseconds(10));

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
                formatCurrencyWithSign(USD_SIGN, position.currentPrice || 0)
            )}
        </>
    );
};

export default MarketPrice;
