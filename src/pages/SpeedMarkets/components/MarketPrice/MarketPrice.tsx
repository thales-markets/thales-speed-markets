import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { refetchUserSpeedMarkets } from 'utils/queryConnector';
import { useAccount, useChainId } from 'wagmi';

const MarketPrice: React.FC<{ position: UserOpenPositions; currentPrices?: { [key: string]: number } }> = ({
    position,
    currentPrices,
}) => {
    const { t } = useTranslation();

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);
    const networkId = useChainId();
    const { address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    useInterval(() => {
        if (Date.now() > position.maturityDate) {
            if (!isMatured) {
                setIsMatured(true);
            }
            if (!position.finalPrice) {
                refetchUserSpeedMarkets(
                    false,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
            }
        }
    }, secondsToMilliseconds(10));

    return (
        <>
            {isMatured ? (
                position.finalPrice ? (
                    formatCurrencyWithSign(USD_SIGN, position.finalPrice)
                ) : (
                    <>
                        {'. . .'}
                        <Tooltip overlay={t('speed-markets.tooltips.final-price-missing')} />
                    </>
                )
            ) : (
                formatCurrencyWithSign(USD_SIGN, currentPrices ? currentPrices[position.currencyKey] : 0)
            )}
        </>
    );
};

export default MarketPrice;
