import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import BalanceDetails from 'pages/AARelatedPages/Deposit/components/BalanceDetails';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { RootState, ThemeInterface } from 'types/ui';
import { getNetworkNameByNetworkId } from 'utils/network';
import queryString from 'query-string';
import {
    BalanceSection,
    CollateralContainer,
    FormContainer,
    InputContainer,
    InputLabel,
    PrimaryHeading,
    WarningContainer,
    WarningIcon,
    Wrapper,
} from '../styled-components';
import WithdrawalConfirmationModal from './components/WithdrawalConfirmationModal';
import { useTranslation } from 'react-i18next';
import { getCollaterals } from 'utils/currency';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import { useAccount, useChainId, useClient } from 'wagmi';
import { getIsBiconomy } from 'redux/modules/wallet';
import biconomyConnector from 'utils/biconomyWallet';
import { isAddress } from 'viem';
import { COLLATERALS } from 'constants/currency';

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

const Withdraw: React.FC = () => {
    const theme: ThemeInterface = useTheme();
    const { t } = useTranslation();
    const networkId = useChainId();
    const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
    const client = useClient();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [showWithdrawalConfirmationModal, setWithdrawalConfirmationModalVisibility] = useState<boolean>(false);
    const [validation, setValidation] = useState<FormValidation>({ walletAddress: false, amount: false });

    const selectedTokenFromUrl = queryString.parse(location.search)['coin-index'];
    const [selectedToken, setSelectedToken] = useState<number>(selectedTokenFromUrl || 0);

    useEffect(() => {
        if (selectedTokenFromUrl != selectedToken.toString()) {
            setSelectedToken(Number(selectedTokenFromUrl));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTokenFromUrl]);

    useEffect(() => {
        if (selectedTokenFromUrl != selectedToken.toString()) {
            setSelectedToken(Number(selectedTokenFromUrl));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTokenFromUrl]);

    const inputRef = useRef<HTMLDivElement>(null);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        { networkId, client },
        {
            enabled: isAppReady && isWalletConnected,
            refetchInterval: 5000,
        }
    );

    const paymentTokenBalance: number = useMemo(() => {
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[getCollaterals(networkId)[selectedToken]];
        }
        return 0;
    }, [multipleCollateralBalances.data, multipleCollateralBalances.isSuccess, networkId, selectedToken]);

    const exchangeRatesQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    useEffect(() => {
        let walletValidation = false;
        let amountValidation = false;

        if (withdrawalWalletAddress != '' && isAddress(withdrawalWalletAddress)) {
            walletValidation = true;
        }

        if (amount > 0 && !(amount > paymentTokenBalance)) {
            amountValidation = true;
        }

        setValidation({ walletAddress: walletValidation, amount: amountValidation });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, paymentTokenBalance, withdrawalWalletAddress]);

    const handleChangeCollateral = (index: number) => {
        setSelectedToken(index);
    };

    return (
        <>
            <Wrapper>
                <FormContainer>
                    <PrimaryHeading>{t('withdraw.heading-withdraw')}</PrimaryHeading>
                    <InputLabel>{t('deposit.select-token')}</InputLabel>
                    <CollateralContainer ref={inputRef}>
                        <CollateralSelector
                            collateralArray={COLLATERALS[networkId]}
                            selectedItem={selectedToken}
                            onChangeCollateral={(index) => handleChangeCollateral(index)}
                            disabled={false}
                            collateralBalances={[multipleCollateralBalances.data]}
                            exchangeRates={exchangeRates}
                            dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                            isDetailedView
                        />
                    </CollateralContainer>
                    <InputLabel marginTop="20px">
                        {t('withdraw.address-input-label', {
                            token: selectedToken,
                            network: getNetworkNameByNetworkId(networkId),
                        })}
                    </InputLabel>
                    <InputContainer>
                        <TextInput
                            value={withdrawalWalletAddress}
                            onChange={(el: { target: { value: React.SetStateAction<string> } }) =>
                                setWithdrawalWalletAddress(el.target.value)
                            }
                            placeholder={t('withdraw.paste-address')}
                        />
                    </InputContainer>
                    <InputLabel marginTop="10px">{t('withdraw.amount')}</InputLabel>
                    <InputContainer>
                        <NumericInput
                            value={amount}
                            onChange={(el) => setAmount(Number(el.target.value))}
                            placeholder={t('withdraw.paste-address')}
                            onMaxButton={() => setAmount(paymentTokenBalance)}
                            currencyLabel={getCollaterals(networkId)[selectedToken]}
                            showValidation={!validation.amount && amount > 0}
                            validationMessage={t('withdraw.validation.amount')}
                        />
                    </InputContainer>
                    <WarningContainer>
                        <WarningIcon className={'icon icon--warning'} />
                        {t('deposit.send', {
                            token: getCollaterals(networkId)[selectedToken],
                            network: getNetworkNameByNetworkId(networkId),
                        })}
                    </WarningContainer>
                    <ButtonContainer>
                        <Button
                            backgroundColor={theme.button.background.primary}
                            disabled={!validation.amount || !validation.walletAddress}
                            textColor={theme.button.textColor.primary}
                            borderColor={theme.button.borderColor.secondary}
                            padding={'5px 60px'}
                            fontSize={'22px'}
                            onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                        >
                            {t('withdraw.button-label-withdraw')}
                        </Button>
                    </ButtonContainer>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                </BalanceSection>
            </Wrapper>
            {showWithdrawalConfirmationModal && (
                <WithdrawalConfirmationModal
                    amount={amount}
                    token={getCollaterals(networkId)[selectedToken]}
                    withdrawalAddress={withdrawalWalletAddress}
                    network={networkId}
                    onClose={() => setWithdrawalConfirmationModalVisibility(false)}
                />
            )}
        </>
    );
};

const ButtonContainer = styled(FlexDiv)`
    width: 100%;
    padding: 40px 0px;
    align-items: center;
    justify-content: center;
`;

export default Withdraw;
