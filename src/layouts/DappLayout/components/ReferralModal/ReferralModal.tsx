import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Modal from 'components/Modal';
import SelectInput from 'components/SelectInput';
import ToastMessage from 'components/ToastMessage';
import { getErrorToastOptions, getSuccessToastOptions } from 'components/ToastMessage/ToastMessage';
import TextInput from 'components/fields/TextInput';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React, { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { BoldText, FlexDivCentered, FlexDivColumnCentered, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { buildReferrerLink } from 'utils/routes';
import { useAccount, useSignMessage } from 'wagmi';

type ReferralModalProps = {
    onClose: () => void;
};

enum Pages {
    Markets = 0,
    RangeMarkets = 1,
    SpeedMarkets = 2,
    LandingPage = 3,
}

const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();

    const { address: walletAddress, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { signMessageAsync } = useSignMessage();
    const [referralPage, setReferralPage] = useState<number>(Pages.Markets);
    const [referrerID, setReferrerID] = useState('');
    const [savedReferrerID, setSavedReferrerID] = useState('');
    const [referralLink, setReferralLink] = useState('');

    const referrerIDQuery = useGetReffererIdQuery((isBiconomy ? biconomyConnector.address : walletAddress) as string, {
        enabled: isConnected,
    });

    const referralPageOptions = [
        {
            value: Pages.SpeedMarkets,
            label: t('referral.pages.speed-market-page'),
        },
        {
            value: Pages.LandingPage,
            label: t('referral.pages.landing-page'),
        },
    ];

    const populateReferralLink = (referralPageId: Pages, reffererId: string) => {
        let link = ROUTES.Markets.Home;
        switch (referralPageId) {
            case Pages.SpeedMarkets:
                link = ROUTES.Markets.SpeedMarkets;
                break;
            case Pages.LandingPage:
                link = ROUTES.Home;
                break;
            default:
                link = ROUTES.Markets.Home;
        }
        setReferralLink(`${buildReferrerLink(link, reffererId)}`);
    };

    useEffect(() => {
        if (referrerIDQuery.isSuccess && referrerIDQuery.data) {
            setReferrerID(referrerIDQuery.data);
            setSavedReferrerID(referrerIDQuery.data);
            populateReferralLink(referralPage, referrerIDQuery.data);
        } else {
            setReferrerID('');
            setSavedReferrerID('');
            setReferralLink('');
        }
    }, [referrerIDQuery.isSuccess, referrerIDQuery.data, referralPage]);

    const generateLinkHandler = useCallback(async () => {
        const signature = await signMessageAsync({ message: referrerID });
        const response = await fetch(`${LINKS.API}/update-refferer-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: isBiconomy ? biconomyConnector.address : walletAddress,
                reffererID: referrerID,
                signature,
                previousReffererID: savedReferrerID,
            }),
        });
        if (!response.ok) {
            toast(
                <ToastMessage id="customId" type="error" message={t('referral.generate.id-exists')} />,
                getErrorToastOptions('', 'customId')
            );
        } else {
            populateReferralLink(referralPage, referrerID);
            setSavedReferrerID(referrerID);
            toast(
                <ToastMessage id="customId" type="success" message={t('referral.generate.id-create-success')} />,
                getSuccessToastOptions('', 'customId')
            );
        }
    }, [referrerID, isBiconomy, walletAddress, savedReferrerID, t, referralPage, signMessageAsync]);

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast(
            <ToastMessage id="customId" type="success" message={t('referral.copied')} />,
            getSuccessToastOptions('', 'customId')
        );
    };

    const handleReferralPageChange = (value: number | null | undefined) => {
        setReferralPage(Number(value) as Pages);
        if (savedReferrerID) {
            populateReferralLink(Number(value), referrerID);
        }
    };

    return (
        <Modal title={t('common.referral.title')} onClose={onClose} shouldCloseOnOverlayClick={true}>
            <Container>
                <Info>
                    <Trans i18nKey={'common.referral.info'} components={{ bold: <BoldText /> }} />
                </Info>
                <Step>
                    <FlexDivRowCentered>
                        <StepNumber>1</StepNumber>
                        <StepName>{t('common.referral.choose-page')}</StepName>
                    </FlexDivRowCentered>
                </Step>
                <RowWrapper>
                    <SelectInput
                        options={referralPageOptions}
                        handleChange={(value) => handleReferralPageChange(value)}
                        defaultValue={referralPage}
                    />
                </RowWrapper>
                <Step>
                    <FlexDivRowCentered>
                        <StepNumber>2</StepNumber>
                        <StepName>{t('common.referral.referral-id')}</StepName>
                    </FlexDivRowCentered>
                </Step>
                <RowWrapper>
                    <TextInput
                        value={referrerID}
                        onChange={(e: any) => setReferrerID(e.target.value)}
                        placeholder={t('referral.choose-referral-placeholder')}
                        width="100%"
                        height="38px"
                    />
                </RowWrapper>
                <RowWrapper marginBottom="20px">
                    <Button
                        width="100%"
                        disabled={isConnected && (!referrerID || savedReferrerID === referrerID)}
                        onClick={isConnected ? generateLinkHandler : openConnectModal}
                    >
                        {isConnected ? t('referral.generate.link-btn') : t('common.wallet.connect-your-wallet')}
                    </Button>
                </RowWrapper>
                <RowWrapper>
                    <GeneratedLink>{referralLink}</GeneratedLink>
                    {referralLink && <Icon className="icon icon--copy" onClick={() => copyLink()} />}
                </RowWrapper>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 340px;
    @media (max-width: 575px) {
        width: 325px;
    }
`;

const Info = styled.p`
    font-size: 13px;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.primary};
    text-align: justify;
`;

const Step = styled(FlexDivStart)`
    align-items: center;
    :not(:first-child) {
        margin-top: 15px;
    }
    margin-bottom: 11px;
`;
const StepNumber = styled(FlexDivCentered)`
    width: 36px;
    height: 36px;
    border: 3px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 50%;
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 700;
    font-size: 18px;
    line-height: 100%;
`;
const StepName = styled.span`
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    padding-left: 8px;
    text-transform: capitalize;
`;

const RowWrapper = styled(FlexDivRowCentered)<{ marginBottom?: string }>`
    padding-left: 44px;
    margin-bottom: ${(props) => props.marginBottom || '0px'};
`;

const GeneratedLink = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Icon = styled.i`
    cursor: pointer;
`;

export default ReferralModal;
