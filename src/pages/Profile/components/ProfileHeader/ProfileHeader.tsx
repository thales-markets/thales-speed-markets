import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { t } from 'i18next';
import { getUserInfo } from '@particle-network/auth-core';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRowCentered, FlexDivColumn, FlexDivSpaceBetween, FlexDiv } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { useChainId, useAccount } from 'wagmi';
import {
    getInfoToastOptions,
    getErrorToastOptions,
    getLoadingToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { toast } from 'react-toastify';
import { ScreenSizeBreakpoint } from 'enums/ui';
import Tooltip from 'components/Tooltip';

const ProfileHeader: React.FC = () => {
    const networkId = useChainId();
    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const validUntil = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'), getLoadingToastOptions());
        try {
            navigator.clipboard.writeText(biconomyConnector.address);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), id));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', id));
        }
    };

    return (
        <Container>
            <FlexColumn>
                {isBiconomy && (
                    <>
                        <FlexDivRowCentered>
                            <FlexDivColumn>
                                <TextLabel>{getUserInfo()?.name} </TextLabel>
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
                    </>
                )}
                <Tooltip overlay={t('user-info.eoa-address-tooltip')}>
                    <FlexDivColumn>
                        <TextLabel>{t('user-info.eoa')} </TextLabel>
                        <Value>{address?.toLowerCase()}</Value>
                    </FlexDivColumn>
                </Tooltip>
                {isBiconomy && (
                    <SessionWrapper>
                        <TextLabel>{t('user-info.session-valid')}: </TextLabel>
                        <Value>{formatShortDateWithFullTime(Number(validUntil) * 1000)}</Value>
                    </SessionWrapper>
                )}
            </FlexColumn>
        </Container>
    );
};

const Container = styled(FlexDivSpaceBetween)`
    width: 100%;
    align-items: flex-start;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        gap: 10px;
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

const CopyIcon = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 18px;
    cursor: pointer;
    margin-left: 4px;
`;

const SessionWrapper = styled(FlexDiv)`
    gap: 8px;
`;

export default ProfileHeader;
