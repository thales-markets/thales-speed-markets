import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { getUserInfo } from '@particle-network/auth-core';
import biconomyConnector from 'utils/biconomyWallet';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getInfoToastOptions } from 'components/ToastMessage/ToastMessage';
import { t } from 'i18next';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { useAccount, useChainId } from 'wagmi';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const UserInfo: React.FC = () => {
    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'));
        try {
            navigator.clipboard.writeText(biconomyConnector.address);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), ''));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', ''));
        }
    };

    const networkId = useChainId();
    const { address } = useAccount();

    const validUntil = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);

    return (
        <Container>
            <FlexColumn>
                <FlexDivRowCentered>
                    <FlexDivColumn>
                        <TextLabel>{getUserInfo()?.name} </TextLabel>
                        <Value>{getUserInfo()?.google_email}</Value>
                    </FlexDivColumn>
                </FlexDivRowCentered>
                <FlexDivColumn>
                    <TextLabel>{t('user-info.smart-account')} </TextLabel>
                    <Value>
                        {biconomyConnector.address}{' '}
                        <CopyIcon onClick={handleCopy} className="network-icon network-icon--copy" />
                    </Value>
                </FlexDivColumn>
                <FlexDivColumn>
                    <TextLabel>{t('user-info.eoa')} </TextLabel>
                    <Value>{address}</Value>
                </FlexDivColumn>
                <SessionWrapper>
                    <TextLabel>{t('user-info.session-valid')} </TextLabel>
                    <Value>{formatShortDateWithFullTime(Number(validUntil) * 1000)}</Value>
                </SessionWrapper>
            </FlexColumn>
            <FlexColumn>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--withdraw" />
                    <Label>{t('user-info.withdraw')}</Label>
                </FlexStartCentered>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--avatar" />
                    <Label>{t('user-info.trading-profile')}</Label>
                </FlexStartCentered>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--docs" />
                    <Label>{t('user-info.docs')}</Label>
                </FlexStartCentered>
            </FlexColumn>
            <FlexColumn>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--logout" />
                    <Label>{t('user-info.logout')}</Label>
                </FlexStartCentered>
            </FlexColumn>
        </Container>
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

const FlexStartCentered = styled(FlexDivStart)`
    align-items: center;
`;

const TextLabel = styled.span`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 14px;
    font-style: normal;
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
`;
const Label = styled.span`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-style: normal;
    font-weight: 800;
    line-height: 300%;
`;

const SessionWrapper = styled(FlexDivRowCentered)`
    margin-top: 8px;
`;

export default UserInfo;
