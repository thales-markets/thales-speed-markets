import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Modal from 'components/Modal';
import ToastMessage from 'components/ToastMessage';
import { getErrorToastOptions, getSuccessToastOptions } from 'components/ToastMessage/ToastMessage';
import TextInput from 'components/fields/TextInput';
import useSolanaAddressForWalletQuery from 'queries/solana/useSolanaAddressForWalletQuery';
import React, { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { BoldText, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { useAccount, useSignMessage } from 'wagmi';
import RewardsImg from 'assets/images/pyth/pyth-rewards.png';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { LINKS } from 'constants/links';

type PythModalProps = {
    onClose: () => void;
};

const PythModal: React.FC<PythModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();

    const { address: walletAddress, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { signMessageAsync } = useSignMessage();
    const [solanaAddress, setSolanaAddress] = useState('');

    const solanaAddressQuery = useSolanaAddressForWalletQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        {
            enabled: isConnected,
        }
    );

    useEffect(() => {
        if (solanaAddressQuery.isSuccess && solanaAddressQuery.data) {
            setSolanaAddress(solanaAddressQuery.data);
        } else {
            setSolanaAddress('');
        }
    }, [solanaAddressQuery.isSuccess, solanaAddressQuery.data]);

    const generateLinkHandler = useCallback(async () => {
        const signature = await signMessageAsync({ message: solanaAddress });
        const response = await fetch(`${LINKS.API}/speed-markets/solana-address`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress,
                smartAccountAddress: isBiconomy ? biconomyConnector.address : undefined,
                solanaAddress,
                signature,
            }),
        });
        if (!response.ok) {
            toast(
                <ToastMessage id="customId" type="error" message={t('common.errors.unknown-error-try-again')} />,
                getErrorToastOptions('', 'customId')
            );
        } else {
            toast(
                <ToastMessage id="customId" type="success" message={t('pyth-rewards.success')} />,
                getSuccessToastOptions('', 'customId')
            );
        }
    }, [solanaAddress, walletAddress, isBiconomy, t, signMessageAsync]);

    return (
        <Modal title={t('pyth-rewards.title')} onClose={onClose} shouldCloseOnOverlayClick={true} width="auto">
            <Wrapper>
                <Container>
                    <Info>
                        <Trans i18nKey={'pyth-rewards.airdrop-info'} components={{ bold: <BoldText /> }} />
                    </Info>
                    <div>
                        <InputLabel>{t('pyth-rewards.input-label')}</InputLabel>
                        <TextInput
                            value={solanaAddress}
                            onChange={(e: any) => setSolanaAddress(e.target.value)}
                            placeholder={t('pyth-rewards.input-label')}
                            width="100%"
                            height="38px"
                        />
                    </div>

                    <RowWrapper marginBottom="20px">
                        <Button
                            width="100%"
                            disabled={isConnected && !solanaAddress}
                            onClick={isConnected ? generateLinkHandler : openConnectModal}
                        >
                            {isConnected ? t('pyth-rewards.submit') : t('common.wallet.connect-your-wallet')}
                        </Button>
                    </RowWrapper>
                </Container>
                <img src={RewardsImg} />
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled(FlexDivRowCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin-top: 20px;
        flex-direction: column;
    }
`;

const Container = styled(FlexDivColumnCentered)`
    max-width: 620px;
    gap: 20px;
`;

const Info = styled.p`
    font-size: 14px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: justify;
`;

const RowWrapper = styled(FlexDivRowCentered)<{ marginBottom?: string }>`
    margin-bottom: ${(props) => props.marginBottom || '0px'};
`;

const InputLabel = styled.p`
    font-family: ${(props) => props.theme.fontFamily.primary};
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.28px;
    line-height: normal;
    text-transform: uppercase;
    margin-bottom: 2px;
`;

export default PythModal;
