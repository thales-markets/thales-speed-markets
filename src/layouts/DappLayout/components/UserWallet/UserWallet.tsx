import { getUserInfo } from '@particle-network/auth-core';
import {
    getErrorToastOptions,
    getInfoToastOptions,
    getLoadingToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { truncateAddress } from 'thales-utils';
import { RootState } from 'types/ui';
import { useAccount } from 'wagmi';
import UserCollaterals from '../UserCollaterals';

const TRUNCATE_ADDRESS_NUMBER_OF_CHARS = 5;

const UserWallet: React.FC = () => {
    const { t } = useTranslation();

    const { address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [walletText, setWalletText] = useState('');

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'), getLoadingToastOptions());
        try {
            navigator.clipboard.writeText(walletAddress as string);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), id));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', id));
        }
    };

    return (
        <Container>
            <Wrapper>
                <WalletContainer
                    $isAddress={!isBiconomy}
                    onClick={() => {
                        !isBiconomy && handleCopy();
                    }}
                    onMouseOver={() => !isBiconomy && setWalletText(t('common.wallet.copy-address'))}
                    onMouseLeave={() => !isBiconomy && setWalletText('')}
                >
                    <WalletText $isAddress={!isBiconomy}>
                        {isBiconomy
                            ? getUserInfo()?.name
                            : walletText ||
                              truncateAddress(
                                  walletAddress as string,
                                  TRUNCATE_ADDRESS_NUMBER_OF_CHARS,
                                  TRUNCATE_ADDRESS_NUMBER_OF_CHARS
                              )}
                    </WalletText>
                </WalletContainer>
                <Separator />
                <UserCollaterals />
            </Wrapper>
        </Container>
    );
};

const Container = styled.div`
    z-index: 10000;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
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

const WalletContainer = styled.div<{ $isAddress: boolean }>`
    width: 120px;
    height: 100%;
    min-width: 120px;
    cursor: ${(props) => (props.$isAddress ? 'pointer' : 'text')};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;

    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        min-width: fit-content;
        max-width: 100px;
        padding: 4px 7px;
    }
`;

const WalletText = styled.span<{ $isAddress: boolean }>`
    color: ${(props) => props.theme.textColor.quinary};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 700;
    font-size: 12px;
    ${(props) => (props.$isAddress ? 'text-transform: lowercase;' : '')};
    text-align: center;
    ${(props) => (!props.$isAddress ? 'overflow: hidden;' : '')};
    ${(props) => (!props.$isAddress ? 'white-space: nowrap;' : '')};
    ${(props) => (!props.$isAddress ? 'text-overflow: ellipsis;' : '')};
`;

const Separator = styled.div`
    width: 4px;
    height: 12px;
    background: ${(props) => props.theme.borderColor.quaternary};
`;

export default UserWallet;
