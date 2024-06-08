import Button from 'components/Button';
import { USD_SIGN } from 'constants/currency';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumnCentered, GradientContainer } from 'styles/common';
import { Coins, formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, isStableCurrency } from 'utils/currency';
import { useAccount, useChainId, useClient } from 'wagmi';

const TotalBalance: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = isBiconomy ? biconomyConnector.address : address;

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress as any,
        { networkId, client },
        {
            enabled: isAppReady,
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
                getCollaterals(networkId).forEach((token: Coins) => {
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

    return (
        <GradientContainer>
            <BalanceWrapper>
                <TotalBalanceWrapper>
                    <SectionLabel>{t('profile.balance')}</SectionLabel>
                    <TotalBalanceSpan>{formatCurrencyWithSign(USD_SIGN, totalBalanceValue)}</TotalBalanceSpan>
                </TotalBalanceWrapper>

                <TokenBalancesWrapper>
                    {getCollaterals(networkId).map((token, index) => {
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
                <ColumnWrapper>
                    <Button fontSize="13px" height="30px">
                        Deposit{' '}
                    </Button>
                    <Button fontSize="13px" height="30px">
                        Withdraw{' '}
                    </Button>
                </ColumnWrapper>
            </BalanceWrapper>
        </GradientContainer>
    );
};

const BalanceWrapper = styled(FlexDiv)`
    background-color: ${(props) => props.theme.background.primary};
    padding: 16px 30px;
    border-radius: 8px;
    gap: 20px;
`;

const ColumnWrapper = styled(FlexDivColumnCentered)`
    gap: 10px;
`;

const TotalBalanceWrapper = styled(ColumnWrapper)`
    gap: 10px;
    min-width: 190px;
    border-right: 1px solid ${(props) => props.theme.borderColor.quaternary};
`;

const SectionLabel = styled.span`
    font-size: 14px;
    font-weight: 800;
    line-height: 90%; /* 12.6px */
    letter-spacing: 1px;
    text-transform: capitalize;
    color: ${(props) => props.theme.textColor.quinary};
    white-space: pre;
`;

const TotalBalanceSpan = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 26px;
    font-weight: 800;
    line-height: 104.8%; /* 27.248px */
    text-transform: capitalize;
    width: 100%;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const TokenBalancesWrapper = styled(FlexDiv)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
`;

const IndividualTokenBalanceWrapper = styled(FlexDiv)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: 150px;
    margin: 0 10px;
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

export default TotalBalance;
