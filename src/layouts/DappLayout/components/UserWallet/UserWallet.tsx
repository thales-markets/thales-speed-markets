import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import NetworkSwitch from 'components/NetworkSwitch';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { truncateAddress } from 'thales-utils';
import UserCollaterals from '../UserCollaterals';
import { useAccount } from 'wagmi';

const TRUNCATE_ADDRESS_NUMBER_OF_CHARS = 5;

const UserWallet: React.FC = () => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();

    const { isConnected, address } = useAccount();

    const [walletText, setWalletText] = useState('');

    return (
        <Container>
            <Wrapper>
                <UserCollaterals />
                <WalletContainer
                    connected={isConnected}
                    onClick={() => {
                        isConnected ? openAccountModal?.() : openConnectModal?.();
                    }}
                    onMouseOver={() => setWalletText(t('common.wallet.wallet-options'))}
                    onMouseLeave={() => setWalletText('')}
                >
                    {address
                        ? walletText ||
                          truncateAddress(address, TRUNCATE_ADDRESS_NUMBER_OF_CHARS, TRUNCATE_ADDRESS_NUMBER_OF_CHARS)
                        : t('common.wallet.connect-your-wallet')}
                </WalletContainer>
                <NetworkSwitch />
            </Wrapper>
        </Container>
    );
};

const Container = styled.div`
    width: 408px;
    z-index: 10000;
    @media (max-width: 500px) {
        width: 100%;
    }
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${(props) => props.theme.borderColor.secondary};
    border-radius: 8px;
    @media (max-width: 500px) {
        height: 26px;
    }
`;

const WalletContainer = styled.div<{ connected: boolean }>`
    width: 100%;
    min-width: 120px;
    cursor: ${(props) => (props.connected ? 'text' : 'pointer')};
    padding: 4px 13px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-left: 2px solid ${(props) => props.theme.borderColor.secondary};
    border-right: 2px solid ${(props) => props.theme.borderColor.secondary};
    color: ${(props) => props.theme.textColor.primary};
    font-weight: normal;
    font-size: 13px;
    text-align: center;
    @media (max-width: 500px) {
        min-width: fit-content;
        max-width: ${(props) => (props.connected ? '100px' : '120px')};
        padding: 4px 7px;
    }
`;

export default UserWallet;
