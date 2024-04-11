import Modal from 'components/Modal';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

import { executeBiconomyTransaction, getGasFeesForTx } from 'utils/biconomy';
import { Coins, NetworkId, coinParser, formatCurrencyWithKey } from 'thales-utils';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getErrorToastOptions, getSuccessToastOptions } from 'components/ToastMessage/ToastMessage';
import { useChainId, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { ViemContract } from 'types/viem';

type WithdrawalConfirmationModalProps = {
    amount: number;
    token: Coins;
    withdrawalAddress: string;
    network: NetworkId;
    onClose: () => void;
};

const WithdrawalConfirmationModal: React.FC<WithdrawalConfirmationModalProps> = ({
    amount,
    token,
    withdrawalAddress,
    network,
    onClose,
}) => {
    const { t } = useTranslation();
    const [gas, setGas] = useState(0);

    const walletClient = useWalletClient();
    const networkId = useChainId();

    const networkName = useMemo(() => {
        return getNetworkNameByNetworkId(network);
    }, [network]);

    const parsedAmount = useMemo(() => {
        return coinParser('' + amount, network, token);
    }, [amount, network, token]);

    useEffect(() => {
        if (multipleCollateral && walletClient.data) {
            const collateralContractWithSigner = getContract({
                abi: multipleCollateral[token].abi,
                address: multipleCollateral[token].addresses[networkId] as any,
                client: walletClient.data as any,
            }) as ViemContract;
            getGasFeesForTx(collateralContractWithSigner?.address as string, collateralContractWithSigner, 'transfer', [
                withdrawalAddress,
                parsedAmount,
            ]).then((estimateGas) => {
                setGas(estimateGas as number);
            });
        }
    }, [token, parsedAmount, withdrawalAddress, networkId, walletClient.data]);

    const handleSubmit = async () => {
        const id = toast.loading(t('withdraw.toast-messages.pending'));

        try {
            if (multipleCollateral && walletClient.data) {
                const collateralContractWithSigner = getContract({
                    abi: multipleCollateral[token].abi,
                    address: multipleCollateral[token].addresses[networkId] as any,
                    client: walletClient.data as any,
                }) as ViemContract;

                await executeBiconomyTransaction(
                    collateralContractWithSigner?.address as string,
                    collateralContractWithSigner,
                    'transfer',
                    [withdrawalAddress, parsedAmount]
                );
                toast.update(id, getSuccessToastOptions(t('withdraw.toast-messages.success'), ''));
            }
            toast.update(id, getErrorToastOptions(t('withdraw.toast-messages.error'), ''));
        } catch (e) {
            console.log('Error ', e);
            toast.update(id, getErrorToastOptions(t('withdraw.toast-messages.error'), ''));
        }
    };

    return (
        <Modal title={t('withdraw.confirmation-modal.title')} onClose={() => onClose()}>
            <MainContainer>
                <ListContainer>
                    <List>
                        <li>
                            {t('withdraw.confirmation-modal.correct-address', {
                                token,
                                network: networkName,
                            })}
                        </li>
                        <li>{t('withdraw.confirmation-modal.withdrawal-transaction-warning')}</li>
                    </List>
                </ListContainer>
                <DetailsContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.amount')}:</ItemLabel>
                        <ItemDescription>
                            {<TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />}

                            {formatCurrencyWithKey(token, amount)}
                            {` (${t('withdraw.confirmation-modal.withdrawal-fee')}: ${formatCurrencyWithKey(
                                token,
                                gas,
                                4
                            )})`}
                        </ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.address')}:</ItemLabel>
                        <ItemDescription>{withdrawalAddress}</ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.network')}:</ItemLabel>
                        <ItemDescription>{networkName}</ItemDescription>
                    </ItemContainer>
                </DetailsContainer>
                <ButtonContainer>
                    <Button onClick={() => handleSubmit()}>{t('withdraw.confirmation-modal.confirm')}</Button>
                </ButtonContainer>
            </MainContainer>
        </Modal>
    );
};

const MainContainer = styled(FlexDiv)`
    padding-top: 30px;
    flex-direction: column;
    max-width: 550px;
    align-items: center;
    justify-content: center;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

const ListContainer = styled(FlexDiv)`
    font-size: 18px;
    font-weight: 400;
    text-transform: capitalize;
    word-wrap: break-word;
    color: ${(props) => props.theme.textColor.primary};
`;

const List = styled.ol`
    list-style-type: decimal;
    line-height: 24px;
    list-style-position: inside;
    li {
        margin: 5px 0;
    }
`;

const TokenIcon = styled.i`
    font-size: 25px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 575px) {
        margin-right: 0px;
    }
`;

const DetailsContainer = styled(FlexDiv)`
    width: 100%;
    margin-top: 24px;
    flex-direction: column;
    gap: 20px;
    background-color: ${(props) => props.theme.button.background.primary};
    padding: 18px;
    border-radius: 5px;
`;

const ItemContainer = styled(FlexDiv)`
    width: fit-content;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: flex-start;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 575px) {
        height: 50px;
        overflow-wrap: break-word;
    }
`;

const ItemLabel = styled(FlexDiv)`
    font-family: 'Roboto';
    align-items: center;
    font-size: 18px;
    font-weight: 700;
    text-transform: capitalize;
    margin-right: 15px;
    @media (max-width: 575px) {
        word-wrap: break-word;
    }
`;

const ItemDescription = styled.div`
    display: flex;
    align-items: center;
    overflow-wrap: break-word;
    width: fit-content;
    @media (max-width: 575px) {
        max-width: 150px;
        text-align: right;
    }
`;

const ButtonContainer = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 24px;
`;

const Button = styled(FlexDiv)`
    cursor: pointer;
    padding: 8px 20px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.button.background.primary};
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    border-radius: 5px;
`;

export default WithdrawalConfirmationModal;