import Button from 'components/Button';
import { USD_SIGN } from 'constants/currency';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import Withdraw from 'pages/AARelatedPages/Withdraw';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivStart, GradientContainer } from 'styles/common';
import { Coins, formatCurrencyWithPrecision, formatCurrencyWithSign } from 'thales-utils';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, isStableCurrency } from 'utils/currency';
import { navigateTo } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';

type TotalBalanceProps = {
    hideDepositButton?: boolean;
};

const TotalBalance: React.FC<TotalBalanceProps> = ({ hideDepositButton }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = isBiconomy ? biconomyConnector.address : address;

    const [openWithdraw, setOpenWithdraw] = useState(false);

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

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token: Coins) => {
                    total += getUSDForCollateral(token);
                });
            }

            return total ? total : 'N/A';
        } catch (e) {
            return 'N/A';
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, getUSDForCollateral]);

    return (
        <>
            <GradientContainer borderRadius="15px">
                <BalanceWrapper>
                    <TotalBalanceWrapper>
                        <FlexDivColumnCentered>
                            <SectionLabel>{t('profile.balance')}</SectionLabel>
                            <TotalBalanceSpan>{formatCurrencyWithSign(USD_SIGN, totalBalanceValue)}</TotalBalanceSpan>
                        </FlexDivColumnCentered>

                        <ColumnWrapper>
                            {!hideDepositButton && (
                                <Button
                                    width={isMobile ? '100px' : '120px'}
                                    onClick={() => {
                                        navigateTo(ROUTES.Deposit);
                                    }}
                                    fontSize="13px"
                                    height="30px"
                                >
                                    {t('profile.deposit')}
                                </Button>
                            )}

                            {isBiconomy && (
                                <Button
                                    onClick={() => {
                                        setOpenWithdraw(true);
                                    }}
                                    width={isMobile ? '100px' : '120px'}
                                    fontSize="13px"
                                    height="30px"
                                >
                                    {t('profile.withdraw')}
                                </Button>
                            )}
                        </ColumnWrapper>
                    </TotalBalanceWrapper>

                    <TokenBalancesWrapper>
                        {collateralsDetailsSorted.map((token, index) => {
                            return (
                                <IndividualTokenBalanceWrapper key={`ind-token-${index}`}>
                                    <Token>
                                        <TokenIcon
                                            className={`currency-icon currency-icon--${token.name.toLowerCase()}`}
                                        />
                                        <TokenName> {token.name}</TokenName>
                                    </Token>
                                    <IndividualBalance>
                                        <IndividualTokenBalance>
                                            {multipleCollateralBalances.data
                                                ? formatCurrencyWithPrecision(
                                                      multipleCollateralBalances.data[token.name]
                                                  )
                                                : 0}
                                        </IndividualTokenBalance>
                                        <IndividualTokenBalance>
                                            {!exchangeRates?.[token.name] && !isStableCurrency(token.name)
                                                ? '...'
                                                : ` (${formatCurrencyWithSign(
                                                      USD_SIGN,
                                                      getUSDForCollateral(token.name)
                                                  )})`}
                                        </IndividualTokenBalance>
                                    </IndividualBalance>
                                </IndividualTokenBalanceWrapper>
                            );
                        })}
                    </TokenBalancesWrapper>
                </BalanceWrapper>
            </GradientContainer>
            {openWithdraw && <Withdraw onClose={() => setOpenWithdraw(false)} />}
        </>
    );
};

const BalanceWrapper = styled(FlexDiv)`
    background-color: ${(props) => props.theme.background.primary};
    padding: 16px 30px;
    border-radius: 15px;
    gap: 20px;
    height: 100%;
    flex-direction: column;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 16px 10px;
    }
`;

const ColumnWrapper = styled(FlexDivCentered)`
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 4px;
    }
`;

const TotalBalanceWrapper = styled(FlexDivCentered)`
    gap: 10px;
    min-width: 190px;
    border-bottom: 2px solid ${(props) => props.theme.borderColor.primary};
    padding-bottom: 14px;
    align-items: flex-end;
`;

const SectionLabel = styled.span`
    font-size: 14px;
    font-weight: 800;
    line-height: 90%; /* 12.6px */
    letter-spacing: 1px;
    text-transform: capitalize;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 8px;
    white-space: pre;
`;

const TotalBalanceSpan = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 26px;
    font-weight: 800;
    line-height: 104.8%; /* 27.248px */
    text-transform: capitalize;
    width: 100%;
    color: ${(props) => props.theme.textColor.secondary};
    white-space: pre;
`;

const TokenBalancesWrapper = styled(FlexDiv)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
`;

const IndividualTokenBalanceWrapper = styled(FlexDiv)`
    align-items: center;
    min-width: 220px;
    margin: 0 10px;
    gap: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 100px;
    }
`;

const IndividualBalance = styled(FlexDivStart)`
    gap: 4px;
`;

const Token = styled(FlexDiv)`
    align-items: center;
    width: 65px;
`;

const TokenName = styled.span`
    font-weight: 700;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 100;
`;

const IndividualTokenBalance = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-align: right;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default TotalBalance;
