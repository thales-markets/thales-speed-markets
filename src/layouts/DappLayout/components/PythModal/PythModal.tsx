import { useConnectModal } from '@rainbow-me/rainbowkit';
import RewardsImg from 'assets/images/pyth/pyth-rewards.png';
import Button from 'components/Button';
import Modal from 'components/Modal';
import ToastMessage from 'components/ToastMessage';
import { getErrorToastOptions, getSuccessToastOptions } from 'components/ToastMessage/ToastMessage';
import TextInput from 'components/fields/TextInput';
import { LINKS } from 'constants/links';
import totalRewardsByAddressAndRound from 'constants/pythRewards/total-rewards.json';
import missingSolanaAddressByRound from 'constants/pythRewards/without-solana-address.json';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useSolanaAddressForWalletQuery from 'queries/solana/useSolanaAddressForWalletQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { BoldText, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { refetchSolanaAddress } from 'utils/queryConnector';
import { isValidSolanaAddress } from 'utils/solana';
import { useAccount, useSignMessage } from 'wagmi';

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
    const [solanaAddressFromAPI, setSolanaAddressFromAPI] = useState('');

    const solanaAddressQuery = useSolanaAddressForWalletQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        {
            enabled: isConnected,
        }
    );

    useEffect(() => {
        if (solanaAddressQuery.isSuccess && solanaAddressQuery.data) {
            setSolanaAddress(solanaAddressQuery.data);
            setSolanaAddressFromAPI(solanaAddressQuery.data);
        } else {
            setSolanaAddress('');
            setSolanaAddressFromAPI('');
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
            refetchSolanaAddress((isBiconomy ? biconomyConnector.address : walletAddress) as string);
            onClose();
        }
    }, [solanaAddress, walletAddress, isBiconomy, t, signMessageAsync, onClose]);

    // Get total rewards for all rounds by address, excluding those addresses which are missing solana address at the end of each round
    const pythRewards = useMemo(() => {
        let totalRewards = 0;
        if (walletAddress) {
            totalRewardsByAddressAndRound.forEach((rewardsByRound, i) => {
                const currentRoundMissingSolanaAddresses: { address: string }[] = Object.values(
                    missingSolanaAddressByRound[i]
                )[0];
                const hasSolanaAddress =
                    currentRoundMissingSolanaAddresses.filter(
                        ({ address }) => address.toLowerCase() === walletAddress.toLowerCase()
                    ).length === 0;

                const currentRoundRewards: { address: string; amount: number }[] = Object.values(rewardsByRound)[0];

                totalRewards +=
                    currentRoundRewards.find(
                        ({ address }) => address.toLowerCase() === walletAddress.toLowerCase() && hasSolanaAddress
                    )?.amount || 0;
            });
        }
        return totalRewards;
    }, [walletAddress]);

    return (
        <Modal title={t('pyth-rewards.title')} onClose={onClose} shouldCloseOnOverlayClick width="auto">
            <Wrapper>
                <Container>
                    <TotalReceived>
                        <Info>
                            {t('pyth-rewards.total-received')} {pythRewards.toFixed(2)}
                            <Icon className="icon icon--pyth-rewards" />
                        </Info>
                    </TotalReceived>

                    <Info>
                        <Trans i18nKey={'pyth-rewards.rewards-info'} components={{ bold: <BoldText /> }} />
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
                            disabled={
                                isConnected &&
                                (!isValidSolanaAddress(solanaAddress) || solanaAddress === solanaAddressFromAPI)
                            }
                            onClick={isConnected ? generateLinkHandler : openConnectModal}
                        >
                            {isConnected
                                ? solanaAddress === ''
                                    ? t('pyth-rewards.submit')
                                    : !isValidSolanaAddress(solanaAddress)
                                    ? t('pyth-rewards.invalid-solana-address')
                                    : t('pyth-rewards.submit')
                                : t('common.wallet.connect-your-wallet')}
                        </Button>
                    </RowWrapper>
                </Container>
                <img src={RewardsImg} />
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled(FlexDivRowCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
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

const TotalReceived = styled(FlexDivRowCentered)`
    height: 50px;
`;

const Icon = styled.i`
    color: ${(props) => props.theme.dropDown.textColor.primary};
    font-size: 14px;
    margin-left: 4px;
`;

export default PythModal;
