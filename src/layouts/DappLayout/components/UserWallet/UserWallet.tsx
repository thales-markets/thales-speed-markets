import { useAccountModal } from '@rainbow-me/rainbowkit';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { truncateAddress } from 'thales-utils';
import UserCollaterals from '../UserCollaterals';
import { useAccount } from 'wagmi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'types/ui';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';

import { getUserInfo } from '@particle-network/auth-core';

const TRUNCATE_ADDRESS_NUMBER_OF_CHARS = 5;

const UserWallet: React.FC = () => {
    const { t } = useTranslation();
    const { openAccountModal } = useAccountModal();
    const dispatch = useDispatch();

    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [walletText, setWalletText] = useState('');

    return (
        <Container>
            <Wrapper>
                <WalletContainer
                    $connected={isConnected}
                    onClick={() => {
                        if (isConnected) {
                            openAccountModal?.();
                        } else {
                            dispatch(
                                setWalletConnectModalVisibility({
                                    visibility: true,
                                })
                            );
                        }
                    }}
                    onMouseOver={() => setWalletText(t('common.wallet.wallet-options'))}
                    onMouseLeave={() => setWalletText('')}
                >
                    {isConnected ? (
                        walletText ||
                        truncateAddress(
                            (isBiconomy ? getUserInfo()?.google_email : walletAddress) as string,
                            TRUNCATE_ADDRESS_NUMBER_OF_CHARS,
                            TRUNCATE_ADDRESS_NUMBER_OF_CHARS
                        )
                    ) : (
                        <div style={{ textTransform: 'uppercase' }}>{t('common.wallet.connect-your-wallet')}</div>
                    )}
                </WalletContainer>
                {isConnected && <UserCollaterals />}
            </Wrapper>
        </Container>
    );
};

const Container = styled.div`
    z-index: 10000;
    @media (max-width: 500px) {
        width: 100%;
    }
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 20px;
    height: 30px;
`;

const WalletContainer = styled.div<{ $connected: boolean }>`
    width: 100%;
    min-width: 120px;
    cursor: ${(props) => (props.$connected ? 'text' : 'pointer')};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-right: ${(props) => (props.$connected ? ` 2px solid ${props.theme.borderColor.quaternary}` : 'none')};
    color: ${(props) => props.theme.textColor.quinary};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 700;
    font-size: 12px;
    text-transform: lowercase;
    text-align: center;
    @media (max-width: 500px) {
        min-width: fit-content;
        max-width: ${(props) => (props.$connected ? '100px' : '120px')};
        padding: 4px 7px;
    }
`;

export default UserWallet;
