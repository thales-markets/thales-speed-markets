import { getUserInfo } from '@particle-network/auth-core';
import { getAccount } from '@wagmi/core';
import OutsideClick from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import {
    getErrorToastOptions,
    getInfoToastOptions,
    getLoadingToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { t } from 'i18next';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useDisconnect } from 'wagmi';

type UserInfoProps = {
    setUserInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenWithdraw: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenReferralModal: React.Dispatch<React.SetStateAction<boolean>>;
    setPythModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    skipOutsideClickOnElement?: React.RefObject<HTMLElement>;
};

const UserInfo: React.FC<UserInfoProps> = ({
    setUserInfoOpen,
    setOpenWithdraw,
    setOpenReferralModal,
    setPythModalOpen,
    skipOutsideClickOnElement,
}) => {
    const networkId = useChainId();
    const { connector } = getAccount(wagmiConfig);
    const { disconnect } = useDisconnect();
    const { address, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const validUntil = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'), getLoadingToastOptions());
        try {
            navigator.clipboard.writeText(isBiconomy ? biconomyConnector.address : (address as string));
            toast.update(id, getInfoToastOptions(t('user-info.copied'), id));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', id));
        }
    };

    // When call disconnect, Wagmi switches to the next connection if there are any, so disconnect all connections
    useEffect(() => {
        if (isDisconnecting && isConnected && connector) {
            disconnect();
        }

        if (!isConnected) {
            setIsDisconnecting(false);
            setUserInfoOpen(false);
        }
    }, [isDisconnecting, isConnected, connector, disconnect, setUserInfoOpen]);

    return (
        <OutsideClick
            onOutsideClick={(e: MouseEvent) =>
                (e.target as HTMLImageElement) !== skipOutsideClickOnElement?.current && setUserInfoOpen(false)
            }
        >
            <Container>
                <FlexColumn>
                    {isBiconomy ? (
                        <>
                            <FlexDivRowCentered>
                                <FlexDivColumn>
                                    <TextLabel>{getUserInfo()?.name} </TextLabel>
                                    <Value>{getUserInfo()?.google_email}</Value>
                                </FlexDivColumn>
                            </FlexDivRowCentered>
                            <FlexDivColumn>
                                <TextLabel>{t('user-info.deposit-address')} </TextLabel>
                                <Value>
                                    {biconomyConnector.address.toLowerCase()}
                                    <CopyIcon onClick={handleCopy} className="network-icon network-icon--copy" />
                                </Value>
                            </FlexDivColumn>
                        </>
                    ) : (
                        <FlexDivColumn>
                            <TextLabel>{t('user-info.deposit-address')} </TextLabel>
                            <Value>
                                {address?.toLowerCase()}
                                <CopyIcon onClick={handleCopy} className="network-icon network-icon--copy" />
                            </Value>
                        </FlexDivColumn>
                    )}

                    {isBiconomy && (
                        <SessionWrapper>
                            <TextLabel>{t('user-info.session-valid')} </TextLabel>
                            <Value>{validUntil ? formatShortDateWithFullTime(Number(validUntil) * 1000) : '-'}</Value>
                        </SessionWrapper>
                    )}
                </FlexColumn>
                <FlexColumn>
                    {isBiconomy && (
                        <MenuItem
                            onClick={() => {
                                setOpenWithdraw(true);
                                setUserInfoOpen(false);
                            }}
                        >
                            <Icon className="network-icon network-icon--withdraw" />
                            <Label>{t('user-info.withdraw')}</Label>
                        </MenuItem>
                    )}
                    <MenuItem>
                        <SPAAnchor onClick={() => setUserInfoOpen(false)} href={buildHref(ROUTES.Markets.Profile)}>
                            <Icon className="network-icon network-icon--avatar" />
                            <Label>{t('user-info.trading-profile')}</Label>
                        </SPAAnchor>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setOpenReferralModal(true);
                            setUserInfoOpen(false);
                        }}
                    >
                        <Icon className="icon icon--referral" />
                        <Label>{t('user-info.referral')}</Label>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setPythModalOpen(true);
                            setUserInfoOpen(false);
                        }}
                    >
                        <Icon className="icon icon--pyth-rewards" />
                        <Label>{t('user-info.pyth')}</Label>
                    </MenuItem>
                    <MenuItem>
                        <SPAAnchor href={LINKS.ThalesIo.Docs}>
                            <Icon className="network-icon network-icon--docs" />
                            <Label>{t('user-info.docs')}</Label>
                        </SPAAnchor>
                    </MenuItem>
                </FlexColumn>
                <FlexColumn>
                    <MenuItem
                        onClick={() => {
                            setIsDisconnecting(true);
                        }}
                    >
                        <Icon className="network-icon network-icon--logout" />
                        <Label>{t('user-info.logout')}</Label>
                    </MenuItem>
                </FlexColumn>
            </Container>
        </OutsideClick>
    );
};

const Container = styled.div`
    position: absolute;
    top: 34px;
    right: 0;

    border-radius: 15px;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    padding: 14px;
    background: ${(props) => props.theme.background.primary};
    z-index: 1000;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        top: 48px;
        padding: 14px 6px;
    }
`;

const FlexColumn = styled(FlexDivColumn)`
    gap: 10px;
    &:nth-child(2) {
        padding: 20px 0;
        margin-top: 10px;
        border-top: 1px solid ${(props) => props.theme.borderColor.primary};
        border-bottom: 1px solid ${(props) => props.theme.borderColor.primary};
        margin-bottom: 10px;
    }
`;

const TextLabel = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
`;

const Value = styled(TextLabel)`
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 400;
    white-space: pre;
`;

const Icon = styled.i`
    color: ${(props) => props.theme.dropDown.textColor.primary};
    font-size: 24px;
    margin-right: 6px;
`;

const CopyIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 18px;
    cursor: pointer;
    margin-left: 4px;
`;
const Label = styled.span`
    color: ${(props) => props.theme.dropDown.textColor.primary};
    font-size: 14px;
    font-weight: 800;
    line-height: 300%;
`;

const MenuItem = styled(FlexDivStart)`
    align-items: center;
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.dropDown.textColor.secondary};
        ${Icon},
        ${Label} {
            color: ${(props) => props.theme.dropDown.textColor.secondary};
        }
    }
`;

const SessionWrapper = styled(FlexDivRowCentered)`
    margin-top: 8px;
`;

export default UserInfo;
