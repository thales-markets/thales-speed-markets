import Button from 'components/Button';
import OutsideClick from 'components/OutsideClick';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import { COLLATERALS, USD_SIGN } from 'constants/currency';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'components/Modal';
import {
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { coinParser, formatCurrencyWithSign } from 'thales-utils';
import { RootState } from 'types/ui';
import { ViemContract } from 'types/viem';
import { executeBiconomyTransactionWithConfirmation, getPaymasterData } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getCollaterals } from 'utils/currency';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getContract, isAddress } from 'viem';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import {
    ButtonWrapper,
    FormContainer,
    GasIcon,
    GasText,
    InputContainer,
    InputLabel,
    WarningContainer,
    WarningIcon,
    Wrapper,
} from '../styled-components';
import CollateralDropdown from './components/CollateralDropdown';
import { ZERO_ADDRESS } from 'constants/network';
import Tooltip from 'components/Tooltip';

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

type DepositProps = {
    onClose: () => void;
};

const Withdraw: React.FC<DepositProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const walletAddress = biconomyConnector.address;
    const { isConnected: isWalletConnected } = useAccount();
    const client = useClient();
    const walletClient = useWalletClient();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [validation, setValidation] = useState<FormValidation>({ walletAddress: false, amount: false });

    const selectedTokenFromUrl = queryString.parse(location.search)['coin-index'];
    const [selectedToken, setSelectedToken] = useState<number>(selectedTokenFromUrl || 0);
    const [gasFee, setGasFee] = useState(0);

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

    const handleSubmit = async () => {
        const id = toast.loading(t('withdraw.toast-messages.pending'), getLoadingToastOptions());

        try {
            if (multipleCollateral && walletClient.data) {
                const collateralContractWithSigner = getContract({
                    abi: multipleCollateral[getCollaterals(networkId)[selectedToken]].abi,
                    address: multipleCollateral[getCollaterals(networkId)[selectedToken]].addresses[networkId] as any,
                    client: walletClient.data as any,
                }) as ViemContract;

                await executeBiconomyTransactionWithConfirmation(
                    collateralContractWithSigner?.address as string,
                    collateralContractWithSigner,
                    'transfer',
                    [
                        withdrawalWalletAddress,
                        coinParser('' + amount, networkId, getCollaterals(networkId)[selectedToken]),
                    ]
                );
                toast.update(id, getSuccessToastOptions(t('withdraw.toast-messages.success'), id));
            }
        } catch (e) {
            console.log('Error ', e);
            toast.update(id, getErrorToastOptions(t('withdraw.toast-messages.error'), id));
        }
    };

    const onMaxButton = async () => {
        if (multipleCollateral && walletClient.data) {
            const collateralContractWithSigner = getContract({
                abi: multipleCollateral[getCollaterals(networkId)[selectedToken]].abi,
                address: multipleCollateral[getCollaterals(networkId)[selectedToken]].addresses[networkId] as any,
                client: walletClient.data as any,
            }) as ViemContract;

            const gasFees = await getPaymasterData(
                collateralContractWithSigner?.address as string,
                collateralContractWithSigner,
                'transfer',
                [
                    isAddress(withdrawalWalletAddress) ? withdrawalWalletAddress : ZERO_ADDRESS,
                    coinParser(
                        '' + Number(0.9 * paymentTokenBalance),
                        networkId,
                        getCollaterals(networkId)[selectedToken]
                    ),
                ]
            );

            if (gasFees) {
                if (gasFees.maxGasFeeUSD) setGasFee(gasFees?.maxGasFeeUSD);
                if (gasFees.maxGasFee) setAmount(paymentTokenBalance - gasFees?.maxGasFee);
            }
        }
    };

    return (
        <Modal title={t('withdraw.heading-withdraw')} onClose={onClose} shouldCloseOnOverlayClick>
            <OutsideClick onOutsideClick={onClose}>
                <Wrapper>
                    <FormContainer>
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
                                    onMaxButton={async () => await onMaxButton()}
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
                        <ButtonWrapper>
                            <Button
                                disabled={!validation.amount || !validation.walletAddress}
                                fontSize={'22px'}
                                width="100%"
                                additionalStyles={{ alignSelf: 'center' }}
                                onClick={() => handleSubmit()}
                            >
                                {t('withdraw.button-label-withdraw')}
                            </Button>
                            {gasFee > 0 && (
                                <Tooltip overlay={t('speed-markets.estimate-gas')}>
                                    <GasText>
                                        <GasIcon className={`network-icon network-icon--gas`} />
                                        {formatCurrencyWithSign(USD_SIGN, gasFee, 2)}
                                    </GasText>
                                </Tooltip>
                            )}
                        </ButtonWrapper>
                    </FormContainer>
                </Wrapper>
            </OutsideClick>
        </Modal>
    );
};

export default Withdraw;
