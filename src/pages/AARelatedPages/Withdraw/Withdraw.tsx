import Button from 'components/Button';
import OutsideClick from 'components/OutsideClick';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import { COLLATERALS } from 'constants/currency';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { RootState, ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/currency';
import { getNetworkNameByNetworkId } from 'utils/network';
import { isAddress } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import CollateralDropdown from '../Deposit/components/CollateralDropdown';
import {
    FormContainer,
    InputContainer,
    InputLabel,
    PrimaryHeading,
    WarningContainer,
    WarningIcon,
    Wrapper,
} from '../styled-components';
import WithdrawalConfirmationModal from './components/WithdrawalConfirmationModal';

ReactModal.setAppElement('#root');

const getDefaultStyle = (theme: ThemeInterface) => ({
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        padding: '2px',
        background: theme.borderColor.tertiary,
        width: '720px',
        borderRadius: '15px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'none',
        height: 'auto',
        border: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 200,
    },
});

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

type DepositProps = {
    isOpen: boolean;
    onClose: () => void;
};

const Withdraw: React.FC<DepositProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

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
        <ReactModal isOpen={isOpen} shouldCloseOnOverlayClick={true} style={getDefaultStyle(theme)}>
            <OutsideClick onOutsideClick={onClose}>
                <Wrapper>
                    <FormContainer>
                        <PrimaryHeading>{t('withdraw.heading-withdraw')}</PrimaryHeading>
                        <CloseIconContainer>
                            <CloseIcon onClick={onClose} />
                        </CloseIconContainer>
                        <div>
                            <InputLabel>{t('deposit.select-token')}</InputLabel>
                            <CollateralDropdown
                                onChangeCollateral={handleChangeCollateral}
                                collateralArray={COLLATERALS[networkId]}
                                selectedItem={selectedToken}
                            />
                        </div>

                        <div>
                            <InputLabel>
                                {t('withdraw.address-input-label', {
                                    token: getCollaterals(networkId)[selectedToken],
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
                                    margin="0"
                                />
                            </InputContainer>
                        </div>
                        <div>
                            <InputLabel>{t('withdraw.amount')}</InputLabel>
                            <InputContainer>
                                <NumericInput
                                    value={amount}
                                    width="100%"
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
                        <Button
                            disabled={!validation.amount || !validation.walletAddress}
                            fontSize={'22px'}
                            width="220px"
                            additionalStyles={{ alignSelf: 'center' }}
                            onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                        >
                            {t('withdraw.button-label-withdraw')}
                        </Button>
                    </FormContainer>
                </Wrapper>
            </OutsideClick>
            {showWithdrawalConfirmationModal && (
                <WithdrawalConfirmationModal
                    amount={amount}
                    token={getCollaterals(networkId)[selectedToken]}
                    withdrawalAddress={withdrawalWalletAddress}
                    network={networkId}
                    onClose={() => setWithdrawalConfirmationModalVisibility(false)}
                />
            )}
        </ReactModal>
    );
};

const CloseIconContainer = styled(FlexDiv)`
    position: absolute;
    top: 20px;
    right: 20px;
`;

const CloseIcon = styled.i`
    font-size: 16px;
    margin-top: 1px;
    cursor: pointer;

    &:before {
        font-family: Icons !important;
        content: '\\0042';
        color: ${(props) => props.theme.textColor.quinary};
    }
    @media (max-width: 575px) {
        padding: 15px;
    }
`;

export default Withdraw;
