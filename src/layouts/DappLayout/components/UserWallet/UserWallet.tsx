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
import biconomyConnector from 'utils/biconomyWallet';
import { useAccount } from 'wagmi';
import UserCollaterals from '../UserCollaterals';

const TRUNCATE_ADDRESS_NUMBER_OF_CHARS = 5;

const UserWallet: React.FC = () => {
    const { t } = useTranslation();

    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [walletText, setWalletText] = useState('');

    const walletAddress = isBiconomy ? biconomyConnector.address : (address as string);

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'), getLoadingToastOptions());
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), id));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', id));
        }
    };

    return (
        <Container>
            <Wrapper>
                <WalletContainer
                    onClick={() => handleCopy()}
                    onMouseOver={() =>
                        setWalletText(
                            isBiconomy
                                ? (truncateAddress(
                                      walletAddress,
                                      TRUNCATE_ADDRESS_NUMBER_OF_CHARS,
                                      TRUNCATE_ADDRESS_NUMBER_OF_CHARS
                                  ) as string)
                                : ''
                        )
                    }
                    onMouseLeave={() => setWalletText('')}
                >
                    <WalletText $isAddress={!isBiconomy}>
                        {walletText ||
                            (isBiconomy
                                ? getUserInfo()?.name
                                : truncateAddress(
                                      walletAddress,
                                      TRUNCATE_ADDRESS_NUMBER_OF_CHARS,
                                      TRUNCATE_ADDRESS_NUMBER_OF_CHARS
                                  ))}
                    </WalletText>
                </WalletContainer>
                <Separator />
                <UserCollaterals />
            </Wrapper>
        </Container>
    );
};

const Container = styled.div`
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: 100%;
    }
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 20px;
    height: 30px;
`;

const WalletContainer = styled.div`
    width: 120px;
    height: 100%;
    min-width: 120px;
    cursor: pointer;
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
    color: ${(props) => props.theme.textColor.primary};
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
    background: ${(props) => props.theme.borderColor.primary};
`;

export default UserWallet;
