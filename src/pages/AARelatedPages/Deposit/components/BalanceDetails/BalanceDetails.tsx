import { USD_SIGN } from 'constants/currency';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';

import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { Coins, formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, isStableCurrency } from 'utils/currency';
import { useAccount, useChainId, useClient } from 'wagmi';

const BalanceDetails: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
    const client = useClient();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        { networkId, client },
        {
            enabled: isAppReady && isWalletConnected,
            refetchInterval: 5000,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total ? total : 'N/A';
        } catch (e) {
            return 'N/A';
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    const getUSDForCollateral = useCallback(
        (token: Coins) =>
            (multipleCollateralBalances.data ? multipleCollateralBalances.data[token] : 0) *
            (isStableCurrency(token as Coins) ? 1 : exchangeRates?.[token] || 0),
        [multipleCollateralBalances, exchangeRates]
    );

    const collateralsDetailsSorted = useMemo(() => {
        const mappedCollaterals = getCollaterals(networkId).map((collateral, index) => ({
            name: collateral as Coins,
            index,
        }));

        return mappedCollaterals.sort(
            (collateralA, collateralB) => getUSDForCollateral(collateralB.name) - getUSDForCollateral(collateralA.name)
        );
    }, [networkId, getUSDForCollateral]);

    return (
        <BalanceWrapper>
            <SectionLabel>{t('deposit.balance')}</SectionLabel>
            <TotalBalance>{formatCurrencyWithSign(USD_SIGN, totalBalanceValue)}</TotalBalance>
            <TokenBalancesWrapper>
                {collateralsDetailsSorted.map(({ name: token }, index) => {
                    return (
                        <IndividualTokenBalanceWrapper key={`ind-token-${index}`}>
                            <Token>
                                <TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />
                                <TokenName> {token}</TokenName>
                            </Token>
                            <IndividualTokenBalance>
                                {multipleCollateralBalances.data
                                    ? formatCurrency(multipleCollateralBalances.data[token])
                                    : 0}
                            </IndividualTokenBalance>
                            <IndividualTokenBalance>
                                {!exchangeRates?.[token] && !isStableCurrency(token as Coins)
                                    ? '...'
                                    : ` (${formatCurrencyWithSign(USD_SIGN, getUSDForCollateral(token as Coins))})`}
                            </IndividualTokenBalance>
                        </IndividualTokenBalanceWrapper>
                    );
                })}
            </TokenBalancesWrapper>
        </BalanceWrapper>
    );
};

const BalanceWrapper = styled(FlexDiv)`
    flex-direction: column;

    padding: 19px;
    margin-bottom: 20px;
`;

const SectionLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 3px;
    margin-bottom: 13px;
    color: ${(props) => props.theme.textColor.primary};
`;

const TotalBalance = styled.span`
    font-size: 42px;
    font-weight: 700;
    width: 100%;
    border-bottom: 2px ${(props) => props.theme.background.primary} solid;
    margin-bottom: 20px;
    padding-bottom: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

const TokenBalancesWrapper = styled(FlexDiv)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const IndividualTokenBalanceWrapper = styled(FlexDiv)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    min-width: 150px;
    margin-right: 10px;
    @media (max-width: 575px) {
        margin-right: 10px;
    }
`;

const Token = styled(FlexDiv)`
    align-items: center;
`;

const TokenName = styled.span`
    font-weight: 700;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.primary};
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 100;
`;

const IndividualTokenBalance = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-align: right;
    color: ${(props) => props.theme.textColor.primary};
`;

export default BalanceDetails;
