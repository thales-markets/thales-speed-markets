import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import BalanceDetails from 'pages/AARelatedPages/Deposit/components/BalanceDetails';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { RootState } from 'types/ui';
import { getNetworkNameByNetworkId } from 'utils/network';
import queryString from 'query-string';
import {
    BalanceSection,
    FormContainer,
    InputContainer,
    InputLabel,
    Link,
    PrimaryHeading,
    SectionLabel,
    TutorialLinksContainer,
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
import CollateralDropdown from '../Deposit/components/CollateralDropdown';

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

const Withdraw: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const walletAddress = biconomyConnector.address;
    const { isConnected: isWalletConnected } = useAccount();
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
        if (selectedTokenFromUrl && selectedTokenFromUrl != selectedToken.toString()) {
            setSelectedToken(Number(selectedTokenFromUrl));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTokenFromUrl]);

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

                    <div>
                        <InputLabel>{t('deposit.select-token')}</InputLabel>
                        <CollateralDropdown
                            onChangeCollateral={handleChangeCollateral}
                            collateralArray={COLLATERALS[networkId]}
                            selectedItem={selectedToken}
                        />
                    </div>

                    <div>
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
                                width="100%"
                            />
                        </InputContainer>
                    </div>
                    <div>
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
                    </div>

                    <ButtonContainer>
                        <Button
                            disabled={!validation.amount || !validation.walletAddress}
                            fontSize={'22px'}
                            width="220px"
                            onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                        >
                            {t('withdraw.button-label-withdraw')}
                        </Button>
                    </ButtonContainer>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                    <TutorialLinksContainer>
                        <SectionLabel>{'Tutorials'}</SectionLabel>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                    </TutorialLinksContainer>
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
