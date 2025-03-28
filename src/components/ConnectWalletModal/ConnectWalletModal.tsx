import { useConnectModal } from '@rainbow-me/rainbowkit';
import disclaimer from 'assets/docs/overtime-disclaimer.pdf';
import privacyPolicy from 'assets/docs/overtime-privacy-policy.pdf';
import termsOfUse from 'assets/docs/overtime-terms-of-use.pdf';
import SimpleLoader from 'components/SimpleLoader';
import Checkbox from 'components/fields/Checkbox';
import { SUPPORTED_PARTICAL_CONNECTORS } from 'constants/wallet';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow } from 'styles/common';

import Button from 'components/Button';
import Modal from 'components/Modal';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { getClassNameForParticalLogin, getSpecificConnectorFromConnectorsArray } from 'utils/particleWallet/utils';
import { Connector, useConnect } from 'wagmi';

ReactModal.setAppElement('#root');

type ConnectWalletModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    const { connectors, isPending, connect } = useConnect();
    const { openConnectModal } = useConnectModal();
    const [termsAccepted, setTerms] = useState(false);

    const handleConnect = (connector: Connector) => {
        try {
            PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.connectWalletSocial);
            connect({ connector });
        } catch (e) {
            console.log('Error occurred');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            shouldCloseOnOverlayClick
            title={t('common.wallet.connect-wallet-modal-title')}
            zIndex={201}
        >
            <Container>
                {!isPending && (
                    <>
                        <ButtonsContainer disabled={!termsAccepted}>
                            <SocialLoginWrapper>
                                <SocialButtonsWrapper>
                                    {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                        const connector = getSpecificConnectorFromConnectorsArray(
                                            connectors,
                                            item,
                                            true
                                        );
                                        if (index == 0 && connector) {
                                            return (
                                                <Button
                                                    width="100%"
                                                    key={index}
                                                    onClick={() => handleConnect(connector)}
                                                    fontSize="18px"
                                                    fontWeight={800}
                                                >
                                                    <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                    {item}
                                                </Button>
                                            );
                                        }
                                    })}
                                </SocialButtonsWrapper>
                                <SocialButtonsWrapper>
                                    {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                        const connector = getSpecificConnectorFromConnectorsArray(
                                            connectors,
                                            item,
                                            true
                                        );
                                        if (index > 0 && index < 3 && connector) {
                                            return (
                                                <Button
                                                    width="100%"
                                                    key={index}
                                                    onClick={() => handleConnect(connector)}
                                                    fontWeight={800}
                                                >
                                                    <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                    {item}
                                                </Button>
                                            );
                                        }
                                    })}
                                </SocialButtonsWrapper>
                                <SocialButtonsWrapper>
                                    {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                        const connector = getSpecificConnectorFromConnectorsArray(
                                            connectors,
                                            item,
                                            true
                                        );
                                        if (index > 2 && index < 5 && connector) {
                                            return (
                                                <Button
                                                    width="100%"
                                                    key={index}
                                                    onClick={() => handleConnect(connector)}
                                                    fontWeight={800}
                                                >
                                                    <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                    {item}
                                                </Button>
                                            );
                                        }
                                    })}
                                </SocialButtonsWrapper>
                            </SocialLoginWrapper>
                            <ConnectWithLabel>{t('common.wallet.or-connect-with')}</ConnectWithLabel>

                            <WalletIconsWrapper>
                                <Button
                                    width="100%"
                                    height="78px"
                                    borderRadius="8px"
                                    onClick={() => {
                                        onClose();
                                        PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.connectWallet);
                                        openConnectModal?.();
                                    }}
                                >
                                    <WalletIcon className={'social-icon icon--wallet'} />
                                    <WalletName>{t('common.wallet.connect-with-wallet')}</WalletName>
                                </Button>
                            </WalletIconsWrapper>
                        </ButtonsContainer>
                        <FooterContainer disabled={!termsAccepted}>
                            <FooterText>
                                <Trans
                                    i18nKey="common.wallet.disclaimer-info"
                                    components={{
                                        disclaimer: <Link href={disclaimer} target="_blank" rel="noreferrer" />,
                                        privacyPolicy: <Link href={privacyPolicy} target="_blank" rel="noreferrer" />,
                                        terms: <Link href={termsOfUse} target="_blank" rel="noreferrer" />,
                                    }}
                                />
                            </FooterText>
                            <CheckboxWrapper>
                                <Checkbox
                                    value={''}
                                    checked={termsAccepted}
                                    onChange={setTerms.bind(this, !termsAccepted)}
                                />
                            </CheckboxWrapper>
                        </FooterContainer>
                    </>
                )}
                {isPending && (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                )}
            </Container>
        </Modal>
    );
};

const Container = styled.div`
    background-color: ${(props) => props.theme.background.primary};
    border-radius: 15px;
    padding: 40px 90px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 0;
        padding-top: 30px;
    }
`;

const Link = styled.a`
    color: ${(props) => props.theme.textColor.secondary};
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.textColor.secondary};
    line-height: 18px;
`;

const SecondaryText = styled.p`
    color: ${(props) => props.theme.button.textColor.primary};
    font-size: 13px;
    font-weight: 400;
`;

const FooterText = styled(SecondaryText)`
    margin: auto;
`;

const FooterContainer = styled(FlexDivCentered)<{ disabled: boolean }>`
    margin-top: 28px;
    padding-top: 20px;

    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}) {
        margin: 0px 40px;
        margin-top: 28px;
    }

    border-top: ${(props) => (props.disabled ? `1px ${props.theme.borderColor.primary} solid` : '')};
`;
const WalletIconsWrapper = styled(FlexDivCentered)`
    justify-content: center;
    align-items: center;
`;

const WalletIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const WalletName = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    font-weight: 800;
    font-size: 18px;
    padding: 6px 0;
`;

const ButtonsContainer = styled.div<{ disabled: boolean }>`
    opacity: ${(props) => (props.disabled ? 0.2 : 1)};
    pointer-events: ${(props) => (props.disabled ? 'none' : '')};
`;

const SocialLoginWrapper = styled(FlexDivCentered)`
    position: relative;
    flex-direction: column;
    gap: 10px;
`;

const ConnectWithLabel = styled(SecondaryText)`
    margin: 24px 0px;
    text-align: center;
`;

const SocialButtonsWrapper = styled(FlexDivRow)`
    justify-content: space-between;
    width: 100%;
    gap: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        gap: 10px;
        flex-wrap: wrap;
    }
`;

const SocialIcon = styled.i`
    font-size: 22px;
    margin-right: 7px;
`;

const LoaderContainer = styled.div`
    height: 180px !important;
    width: 80px;
    overflow: none;
`;

const CheckboxWrapper = styled.div`
    min-width: 180px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        display: flex;
        align-items: flex-end;
        min-height: 22px;
        min-width: 80px;
        padding-right: 30px; // fix for widget bot overlapping
    }
`;

export default ConnectWalletModal;
