import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Modal from 'components/Modal';
import ToastMessage from 'components/ToastMessage';
import { getErrorToastOptions, getSuccessToastOptions } from 'components/ToastMessage/ToastMessage';
import TextInput from 'components/fields/TextInput';
import { LINKS } from 'constants/links';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
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

type ReferralModalProps = {
    onClose: () => void;
};

const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();

    const { address: walletAddress, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { signMessageAsync } = useSignMessage();
    const [solanaAddress, setSolanaAddress] = useState('');

    const referrerIDQuery = useGetReffererIdQuery((isBiconomy ? biconomyConnector.address : walletAddress) as string, {
        enabled: isConnected,
    });

    useEffect(() => {
        if (referrerIDQuery.isSuccess && referrerIDQuery.data) {
            setSolanaAddress(referrerIDQuery.data);
        } else {
            setSolanaAddress('');
        }
    }, [referrerIDQuery.isSuccess, referrerIDQuery.data]);

    const generateLinkHandler = useCallback(async () => {
        const signature = await signMessageAsync({ message: solanaAddress });
        const response = await fetch(`${LINKS.API}/speed-markets/solana-address`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress,
                solanaAddress,
                signature,
            }),
        });
        if (!response.ok) {
            toast(
                <ToastMessage id="customId" type="error" message={t('common.referral.generate.id-exists')} />,
                getErrorToastOptions('', 'customId')
            );
        } else {
            toast(
                <ToastMessage id="customId" type="success" message={t('common.referral.generate.id-create-success')} />,
                getSuccessToastOptions('', 'customId')
            );
        }
    }, [solanaAddress, walletAddress, t, signMessageAsync]);

    // const copyLink = () => {
    //     navigator.clipboard.writeText(solanaAddress);
    //     toast(
    //         <ToastMessage id="customId" type="success" message={t('common.referral.copied')} />,
    //         getSuccessToastOptions('', 'customId')
    //     );
    // };

    return (
        <Modal title={t('common.referral.title')} onClose={onClose} shouldCloseOnOverlayClick={true} width="auto">
            <Container>
                <Info>
                    <Trans i18nKey={'common.referral.info'} components={{ bold: <BoldText /> }} />
                </Info>
                <RowWrapper>
                    <TextInput
                        value={solanaAddress}
                        onChange={(e: any) => setSolanaAddress(e.target.value)}
                        placeholder={t('common.referral.choose-referral-placeholder')}
                        width="100%"
                        height="38px"
                    />
                </RowWrapper>
                <RowWrapper marginBottom="20px">
                    <Button
                        width="100%"
                        disabled={isConnected && !solanaAddress}
                        onClick={isConnected ? generateLinkHandler : openConnectModal}
                    >
                        {isConnected ? t('common.referral.generate.link-btn') : t('common.wallet.connect-your-wallet')}
                    </Button>
                </RowWrapper>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 340px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: 325px;
    }
`;

const Info = styled.p`
    font-size: 13px;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: justify;
    margin-top: 20px;
`;

const RowWrapper = styled(FlexDivRowCentered)<{ marginBottom?: string }>`
    padding-left: 44px;
    margin-bottom: ${(props) => props.marginBottom || '0px'};
`;

export default ReferralModal;
