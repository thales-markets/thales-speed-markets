import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { getUserInfo } from '@particle-network/auth-core';
import biconomyConnector from 'utils/biconomyWallet';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getInfoToastOptions } from 'components/ToastMessage/ToastMessage';
import { t } from 'i18next';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import OutsideClick from 'components/OutsideClick';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/ui';
import { LINKS } from 'constants/links';
import { ScreenSizeBreakpoint } from 'enums/ui';

type UserInfoProps = {
    setUserInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenWithdraw: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenReferralModal: React.Dispatch<React.SetStateAction<boolean>>;
    skipOutsideClickOnElement?: React.RefObject<HTMLElement>;
};

const UserInfo: React.FC<UserInfoProps> = ({
    setUserInfoOpen,
    setOpenWithdraw,
    setOpenReferralModal,
    skipOutsideClickOnElement,
}) => {
    const networkId = useChainId();
    const { disconnect } = useDisconnect();
    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const validUntil = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'));
        try {
            navigator.clipboard.writeText(biconomyConnector.address);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), ''));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', ''));
        }
    };

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
                            <TextLabel>{t('user-info.eoa')} </TextLabel>
                            <Value>{address?.toLowerCase()}</Value>
                        </FlexDivColumn>
                    )}

                    {isBiconomy && (
                        <SessionWrapper>
                            <TextLabel>{t('user-info.session-valid')} </TextLabel>
                            <Value>{formatShortDateWithFullTime(Number(validUntil) * 1000)}</Value>
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
                            setUserInfoOpen(false);
                            disconnect();
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
    border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    padding: 14px;
    background: ${(props) => props.theme.background.primary};
    z-index: 1000;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        top: 48px;
    }
`;

const FlexColumn = styled(FlexDivColumn)`
    gap: 10px;
    &:nth-child(2) {
        padding: 20px 0;
        margin-top: 10px;
        border-top: 1px solid ${(props) => props.theme.borderColor.quaternary};
        border-bottom: 1px solid ${(props) => props.theme.borderColor.quaternary};
        margin-bottom: 10px;
    }
`;

const MenuItem = styled(FlexDivStart)`
    align-items: center;
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.link.textColor.primary};
        i,
        span {
            color: ${(props) => props.theme.link.textColor.primary};
        }
    }
`;

const TextLabel = styled.span`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
`;

const Value = styled(TextLabel)`
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 400;
`;

const Icon = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 24px;
    margin-right: 6px;
`;

const CopyIcon = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 18px;
    cursor: pointer;
    margin-left: 4px;
`;
const Label = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 800;
    line-height: 300%;
`;

const SessionWrapper = styled(FlexDivRowCentered)`
    margin-top: 8px;
`;

export default UserInfo;
