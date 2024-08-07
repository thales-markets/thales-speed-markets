import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput/NumericInput';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { Coins, bigNumberFormatter, coinParser } from 'thales-utils';
import { RootState } from 'types/ui';
import { maxUint256 } from 'viem';
import { useAccount, useChainId } from 'wagmi';

type ApprovalModalProps = {
    defaultAmount: number | string;
    tokenSymbol: string;
    isAllowing: boolean;
    onSubmit: (approveAmount: bigint) => void;
    onClose: () => void;
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({ defaultAmount, tokenSymbol, isAllowing, onSubmit, onClose }) => {
    const { t } = useTranslation();
    const { isConnected } = useAccount();
    const networkId = useChainId();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [amount, setAmount] = useState<number | string>(defaultAmount);
    const [approveAll, setApproveAll] = useState<boolean>(true);
    const [isAmountValid, setIsAmountValid] = useState<boolean>(true);

    const { openConnectModal } = useConnectModal();

    const maxApproveAmount = bigNumberFormatter(maxUint256);
    const isAmountEntered = Number(amount) > 0;
    const isButtonDisabled = !isConnected || isAllowing || (!approveAll && (!isAmountEntered || !isAmountValid));

    const amountConverted = coinParser(Number(amount).toString(), networkId, tokenSymbol as Coins);

    const getSubmitButton = () => {
        if (!isConnected) {
            return <Button onClick={() => openConnectModal?.()}>{t('common.wallet.connect-your-wallet')}</Button>;
        }
        if (!approveAll && !isAmountEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-amount`)}</Button>;
        }
        return (
            <Button
                disabled={isButtonDisabled}
                onClick={() => onSubmit(approveAll ? maxUint256 : amountConverted)}
                additionalStyles={{ textTransform: 'none' }}
            >
                {!isAllowing
                    ? t('common.enable-wallet-access.approve').toUpperCase() + ' ' + tokenSymbol
                    : t('common.enable-wallet-access.approve-progress').toUpperCase() + ' ' + tokenSymbol + '...'}
            </Button>
        );
    };

    useEffect(() => {
        setIsAmountValid(Number(amount) === 0 || (Number(amount) > 0 && Number(amount) <= maxApproveAmount));
    }, [amount, maxApproveAmount]);

    return (
        <Modal
            title={t('common.enable-wallet-access.approve', { currencyKey: tokenSymbol })}
            onClose={onClose}
            shouldCloseOnOverlayClick
            width={isMobile ? '100%' : 'auto'}
        >
            <Container>
                <CheckboxContainer>
                    <Checkbox
                        disabled={isAllowing}
                        checked={approveAll}
                        value={approveAll.toString()}
                        onChange={(e: any) => setApproveAll(e.target.checked || false)}
                        label={t('common.enable-wallet-access.approve-all-label')}
                    />
                </CheckboxContainer>
                <TextContainer>
                    <Text>{t('common.or')}</Text>
                </TextContainer>
                <NumericInput
                    value={amount}
                    onChange={(_, value) => setAmount(value)}
                    disabled={approveAll || isAllowing}
                    label={t('common.enable-wallet-access.custom-amount-label')}
                    currencyLabel={tokenSymbol}
                    placeholder={t('common.enter-amount')}
                    showValidation={!approveAll && !isAmountValid}
                    validationMessage={t('common.errors.invalid-amount-max', { max: maxApproveAmount })}
                />
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 306px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: auto;
    }
`;

const CheckboxContainer = styled(FlexDivRow)`
    margin: 20px 0;
`;

const TextContainer = styled(FlexDivCentered)`
    margin-bottom: 20px;
`;

const Text = styled.span`
    font-size: 15px;
    line-height: 18px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 10px 0;
`;

export default ApprovalModal;
