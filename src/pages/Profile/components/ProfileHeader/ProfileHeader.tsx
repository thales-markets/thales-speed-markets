import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { t } from 'i18next';
import { getUserInfo } from '@particle-network/auth-core';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRowCentered, FlexDivColumn, FlexDivSpaceBetween, FlexDiv } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { useChainId, useAccount, useConnections } from 'wagmi';
import {
    getInfoToastOptions,
    getErrorToastOptions,
    getLoadingToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { toast } from 'react-toastify';
import { ScreenSizeBreakpoint } from 'enums/ui';
import Tooltip from 'components/Tooltip';
import { getIsMobile } from 'redux/modules/ui';

import avatar1 from 'assets/images/avatars/avatar1.webp';
import avatar2 from 'assets/images/avatars/avatar2.webp';
import avatar3 from 'assets/images/avatars/avatar3.webp';
import avatar4 from 'assets/images/avatars/avatar4.webp';
import avatar5 from 'assets/images/avatars/avatar1.webp';
import avatar6 from 'assets/images/avatars/avatar2.webp';
import avatar7 from 'assets/images/avatars/avatar3.webp';
import avatar8 from 'assets/images/avatars/avatar4.webp';
import avatar9 from 'assets/images/avatars/avatar1.webp';
import avatar10 from 'assets/images/avatars/avatar2.webp';
import avatar11 from 'assets/images/avatars/avatar3.webp';
import avatar12 from 'assets/images/avatars/avatar4.webp';
import avatar13 from 'assets/images/avatars/avatar2.webp';

const ProfileHeader: React.FC = () => {
    const networkId = useChainId();
    const { address } = useAccount();
    const connections = useConnections();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const validUntil = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);

    const particleConnections = connections.filter((connection) => connection.connector.type === 'particle');
    const particleAccounts = particleConnections.length ? particleConnections[0].accounts : [];
    const eoa = particleAccounts.length ? particleAccounts[0] : '';

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'), getLoadingToastOptions());
        try {
            navigator.clipboard.writeText(biconomyConnector.address);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), id));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', id));
        }
    };

    const avatarUrl = useMemo(() => {
        if (isBiconomy) {
            const userInfo = getUserInfo();
            if (userInfo && userInfo.avatar) {
                return userInfo.avatar;
            }

            function getRandomInt(max: number) {
                return Math.floor(Math.random() * max);
            }

            const randomAvatarIndex = getRandomInt(13) + 1;
            let avatarUrlLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.AVATAR_URL);
            if (!avatarUrlLocal) {
                switch (randomAvatarIndex) {
                    case 1:
                        avatarUrlLocal = avatar1;
                        break;
                    case 2:
                        avatarUrlLocal = avatar2;
                        break;
                    case 3:
                        avatarUrlLocal = avatar3;
                        break;
                    case 4:
                        avatarUrlLocal = avatar4;
                        break;
                    case 5:
                        avatarUrlLocal = avatar5;
                        break;
                    case 6:
                        avatarUrlLocal = avatar6;
                        break;
                    case 7:
                        avatarUrlLocal = avatar7;
                        break;
                    case 8:
                        avatarUrlLocal = avatar8;
                        break;
                    case 9:
                        avatarUrlLocal = avatar9;
                        break;
                    case 10:
                        avatarUrlLocal = avatar10;
                        break;
                    case 11:
                        avatarUrlLocal = avatar11;
                        break;
                    case 12:
                        avatarUrlLocal = avatar12;
                        break;
                    case 13:
                        avatarUrlLocal = avatar13;
                        break;
                }
                if (avatarUrlLocal) localStorage.setItem(LOCAL_STORAGE_KEYS.AVATAR_URL, avatarUrlLocal);
            }

            return avatarUrlLocal;
        }
    }, [isBiconomy]);

    return (
        <Container>
            {isBiconomy && !isMobile && <UserAvatar src={avatarUrl as string} />}
            <FlexColumn>
                {isBiconomy ? (
                    <>
                        <FlexDivRowCentered>
                            {isBiconomy && isMobile && <UserAvatar src={avatarUrl as string} />}
                            <FlexDivColumn>
                                <Name>{getUserInfo()?.name} </Name>
                                <Value>{getUserInfo()?.google_email}</Value>
                            </FlexDivColumn>
                        </FlexDivRowCentered>
                        <Tooltip overlay={t('user-info.deposit-address')}>
                            <FlexDivColumn>
                                <TextLabel>{t('user-info.smart-account')} </TextLabel>
                                <Value>
                                    {biconomyConnector.address.toLowerCase()}
                                    <CopyIcon onClick={handleCopy} className="network-icon network-icon--copy" />
                                </Value>
                            </FlexDivColumn>
                        </Tooltip>
                        <Tooltip overlay={t('user-info.eoa-address-tooltip')}>
                            <FlexDivColumn>
                                <TextLabel>{t('user-info.eoa')} </TextLabel>
                                <Value>{eoa?.toLowerCase()}</Value>
                            </FlexDivColumn>
                        </Tooltip>
                        <SessionWrapper>
                            <TextLabel>{t('user-info.session-valid')}: </TextLabel>
                            <Value>{validUntil ? formatShortDateWithFullTime(Number(validUntil) * 1000) : '-'}</Value>
                        </SessionWrapper>
                    </>
                ) : (
                    <FlexDivColumn>
                        <TextLabel>{t('user-info.deposit-address')} </TextLabel>
                        <Value>{address?.toLowerCase()}</Value>
                    </FlexDivColumn>
                )}
            </FlexColumn>
        </Container>
    );
};

const Container = styled(FlexDivSpaceBetween)`
    width: 100%;
    align-items: flex-start;
    padding-top: 18px;
    gap: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding-top: 0;
        flex-direction: column;
    }
`;
const FlexColumn = styled(FlexDivColumn)`
    gap: 10px;
`;

const TextLabel = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
`;

const Name = styled(TextLabel)`
    font-size: 26px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 18px;
    }
`;

const Value = styled(TextLabel)`
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 400;
    white-space: pre;
`;

const CopyIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 18px;
    cursor: pointer;
    margin-left: 4px;
`;

const SessionWrapper = styled(FlexDiv)`
    gap: 8px;
`;

const UserAvatar = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 44px;
        height: 44px;
        margin-right: 8px;
    }
`;

export default ProfileHeader;
