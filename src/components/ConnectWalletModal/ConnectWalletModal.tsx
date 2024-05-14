import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';

import disclaimer from 'assets/docs/thales-protocol-disclaimer.pdf';
import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import SimpleLoader from 'components/SimpleLoader';
import Checkbox from 'components/fields/Checkbox';
import { SUPPORTED_PARTICAL_CONNECTORS } from 'constants/wallet';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import { RootState } from 'types/ui';
import { Connector, useConnect } from 'wagmi';
import { getClassNameForParticalLogin, getSpecificConnectorFromConnectorsArray } from 'utils/particleWallet/utils';
import Button from 'components/Button';

ReactModal.setAppElement('#root');

const defaultStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        padding: '2px',
        background: 'linear-gradient(90deg, #a764b7 0%, #169cd2 100%)',
        width: '720px',
        borderRadius: '15px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'none',
        height: 'auto',
        border: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 201,
    },
};

type ConnectWalletModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { connectors, isPending, connect } = useConnect();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const { openConnectModal } = useConnectModal();
    const [termsAccepted, setTerms] = useState(false);

    useEffect(() => {
        if (isMobile) {
            defaultStyle.content.width = '100%';
            defaultStyle.content.padding = '20px 5px';
            defaultStyle.content.height = '100%';
        }
    }, [isMobile]);

    const handleConnect = (connector: Connector) => {
        try {
            connect({ connector });
        } catch (e) {
            console.log('Error occurred');
        }
    };

    return (
        <ReactModal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={defaultStyle}>
            <Container>
                <CloseIconContainer>
                    <CloseIcon onClick={onClose} />
                </CloseIconContainer>
                {!isPending && (
                    <>
                        <HeaderContainer>
                            <Header>{t('common.wallet.connect-wallet-modal-title')}</Header>
                        </HeaderContainer>
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
                                        disclaimer: (
                                            <Link href={disclaimer}>
                                                <></>
                                            </Link>
                                        ),
                                        terms: (
                                            <Link href={termsOfUse}>
                                                <></>
                                            </Link>
                                        ),
                                    }}
                                />
                            </FooterText>
                            <Checkbox
                                value={''}
                                checked={termsAccepted}
                                onChange={setTerms.bind(this, !termsAccepted)}
                            />
                        </FooterContainer>
                    </>
                )}
                {isPending && (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                )}
            </Container>
        </ReactModal>
    );
};

const HeaderContainer = styled(FlexDivCentered)`
    flex-direction: column;
    margin-bottom: 40px;
`;

const CloseIconContainer = styled(FlexDiv)`
    justify-content: flex-end;
`;

const Container = styled.div`
    background-color: ${(props) => props.theme.background.primary};
    border-radius: 15px;
    padding: 25px;
`;

const CloseIcon = styled.i`
    font-size: 16px;
    margin-top: 1px;
    cursor: pointer;
    &:before {
        font-family: Icons !important;
        content: '\\0042';
        color: ${(props) => props.theme.textColor.primary};
    }
    @media (max-width: 575px) {
        padding: 15px;
    }
`;

const Header = styled.h2`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
`;

const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.textColor.primary};
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
    margin: 0px 90px;
    margin-top: 28px;
    padding-top: 20px;

    @media (max-width: 575px) {
        margin: 0px 40px;
        margin-top: 28px;
    }

    border-top: ${(props) => (props.disabled ? `1px ${props.theme.borderColor.quaternary} solid` : '')};
`;
const WalletIconsWrapper = styled(FlexDivCentered)`
    justify-content: center;
    padding: 0px 90px;
    align-items: center;
    @media (max-width: 575px) {
        padding: 0px 40px;
    }
`;

const WalletIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

const WalletName = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    color: ${(props) => props.theme.textColor.primary};
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
    padding: 0px 90px;
    flex-direction: column;
    gap: 10px;
    @media (max-width: 575px) {
        padding: 0px 40px;
    }
`;

const ConnectWithLabel = styled(SecondaryText)`
    margin: 24px 0px;
    text-align: center;
`;

const SocialButtonsWrapper = styled(FlexDivRow)`
    justify-content: space-between;
    width: 100%;
    gap: 20px;
    @media (max-width: 575px) {
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

export default ConnectWalletModal;
