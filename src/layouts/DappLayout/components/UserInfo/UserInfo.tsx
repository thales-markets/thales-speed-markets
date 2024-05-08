import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { getUserInfo } from '@particle-network/auth-core';
import biconomyConnector from 'utils/biconomyWallet';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getInfoToastOptions } from 'components/ToastMessage/ToastMessage';
import { t } from 'i18next';
import { formatShortDateWithFullTime } from 'utils/formatters/date';

const UserInfo: React.FC = () => {
    console.log(getUserInfo());

    const handleCopy = () => {
        const id = toast.loading(t('deposit.copying-address'));
        try {
            navigator.clipboard.writeText(biconomyConnector.address);
            toast.update(id, getInfoToastOptions(t('deposit.copied'), ''));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', ''));
        }
    };

    const validUntil = window.localStorage.getItem('seassionValidUntil');
    console.log(validUntil);

    return (
        <Container>
            <FlexColumn>
                <FlexDivRowCentered>
                    <FlexDivColumn>
                        <TextLabel>{getUserInfo()?.name} </TextLabel>
                        <Value>{biconomyConnector.address}</Value>
                    </FlexDivColumn>
                    <CopyIcon onClick={handleCopy} className="network-icon network-icon--copy" />
                </FlexDivRowCentered>
                <FlexDivColumn>
                    <TextLabel>Email: </TextLabel>
                    <Value>{getUserInfo()?.google_email}</Value>
                </FlexDivColumn>
                <FlexDivRowCentered>
                    <TextLabel>Session valid until: </TextLabel>
                    <Value>{formatShortDateWithFullTime(Number(validUntil) * 1000)}</Value>
                </FlexDivRowCentered>
            </FlexColumn>
            <FlexColumn>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--login" />
                    <Label>Withdraw</Label>
                </FlexStartCentered>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--avatar" />
                    <Label>Trading Profile</Label>
                </FlexStartCentered>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--login" />
                    <Label>Docs & Tutorials</Label>
                </FlexStartCentered>
            </FlexColumn>
            <FlexColumn>
                <FlexStartCentered>
                    <Icon className="network-icon network-icon--login" />
                    <Label>Logout</Label>
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
    margin-left: 6px;
    margin-top: 10px;
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

export default UserInfo;
