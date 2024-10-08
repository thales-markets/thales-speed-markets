import Button from 'components/Button';
import Modal from 'components/Modal';
import OutsideClick from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import {
    getErrorToastOptions,
    getInfoToastOptions,
    getLoadingToastOptions,
} from 'components/ToastMessage/ToastMessage';
import TotalBalance from 'components/TotalBalance';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import MobileMenu from 'layouts/DappLayout/components/MobileMenu';
import { LinkContainer, LinkWrapper, NavigationIcon } from 'pages/SpeedMarketsOverview/SpeedMarketsOverview';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { Coins } from 'thales-utils';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/currency';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getOnRamperUrl } from 'utils/particleWallet/utils';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';
import QRCodeModal from '../Withdraw/components/QRCodeModal';

const Tutorials = [
    {
        name: 'Coinbase',
        url: LINKS.Tutorials.Coinbase,
    },
    {
        name: 'Binance Mobile',
        url: LINKS.Tutorials.BinanceMobile,
    },
    {
        name: 'Binance Website',
        url: LINKS.Tutorials.BinanceWebsite,
    },
];

const Deposit: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [showOnramper, setShowOnramper] = useState<boolean>(false);

    const apiKey = import.meta.env.VITE_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(apiKey, biconomyConnector.address as string, networkId);
    }, [networkId, apiKey]);

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
        <Wrapper>
            <LinkContainer>
                <SPAAnchor href={`${buildHref(ROUTES.Markets.SpeedMarkets)}`}>
                    <LinkWrapper>
                        <NavigationIcon isLeft className={`icon icon--arrow`} />
                        {t('speed-markets.title')}
                    </LinkWrapper>
                </SPAAnchor>
                &nbsp;/&nbsp;{t('deposit.title')}
            </LinkContainer>
            <Description>{t('deposit.description')}</Description>
            <Container>
                <SidesWrapper>
                    <DepositContainer>
                        <Label>
                            {t('deposit.tokens', {
                                network: getNetworkNameByNetworkId(networkId),
                            })}
                            <TokensWrapper>
                                {getCollaterals(networkId).map((token: Coins, index) => {
                                    return (
                                        <Token key={index}>
                                            <TokenIcon
                                                className={`currency-icon currency-icon--${token.toLowerCase()}`}
                                            />
                                            <TokenName>{token}</TokenName>
                                        </Token>
                                    );
                                })}
                            </TokensWrapper>
                        </Label>
                        <Label>{t('deposit.address')}</Label>
                        <AddressContainer>
                            <Address>{walletAddress}</Address>
                            <CopyText
                                onClick={() => {
                                    handleCopy();
                                }}
                            >
                                {t('get-started.steps.action.copy')}
                            </CopyText>
                            <QRIcon
                                onClick={() => {
                                    setShowQRModal(!showQRModal);
                                }}
                                className="social-icon icon--qr-code"
                            />
                            <CopyIcon
                                onClick={() => {
                                    handleCopy();
                                }}
                                className="network-icon network-icon--copy"
                            />
                        </AddressContainer>
                        <WarningMessage>{t('deposit.send')}</WarningMessage>
                        <Separator />
                        <OnRampWrapper
                            onClick={() => {
                                PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.fundWithCardButtonClick);
                                setShowOnramper(true);
                            }}
                        >
                            <OnramperDiv>
                                <OnramperIcons className={`social-icon icon--visa`} />
                                <OnramperIcons className={`social-icon icon--master`} />
                                <OnramperIcons className={`social-icon icon--applepay`} />
                                <OnramperIcons className={`social-icon icon--googlepay`} />
                            </OnramperDiv>
                            <Button width="100%" fontSize="18px">
                                {t('get-started.steps.action.buy-crypto')}
                            </Button>
                        </OnRampWrapper>
                    </DepositContainer>
                </SidesWrapper>
                <SidesWrapper>
                    <TotalBalance hideDepositButton />
                    <TutorialsWrapper>
                        <TutorialHeader>{t('deposit.tutorials')}</TutorialHeader>
                        {Tutorials.map((tutorial, index) => (
                            <SPAAnchor href={tutorial.url} key={index}>
                                <TutorialLink>{tutorial.name}</TutorialLink>
                            </SPAAnchor>
                        ))}
                    </TutorialsWrapper>
                </SidesWrapper>
                <MobileMenu />
            </Container>

            {showQRModal && (
                <QRCodeModal
                    onClose={() => setShowQRModal(false)}
                    walletAddress={walletAddress}
                    title={t('deposit.qr-modal-title')}
                />
            )}
            {showOnramper && (
                <Modal
                    isOpen={showOnramper}
                    title=""
                    shouldCloseOnOverlayClick
                    onClose={() => setShowOnramper(false)}
                    width="auto"
                >
                    <OutsideClick onOutsideClick={() => setShowOnramper(false)}>
                        <div style={{ background: 'black', marginBottom: '2px' }}>
                            <iframe
                                src={onramperUrl}
                                title="Onramper Widget"
                                height="630px"
                                width="420px"
                                allow="accelerometer; autoplay; camera; gyroscope; payment"
                            />
                        </div>
                    </OutsideClick>
                </Modal>
            )}
        </Wrapper>
    );
};

export default Deposit;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 10px;
    }
`;

const Container = styled(FlexDiv)`
    width: 100%;
    gap: 30px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        flex-direction: column;
        gap: 10px;
    }
`;

const Description = styled.h2`
    color: ${(props) => props.theme.textColor.secondary};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 18px;
    font-weight: 800;
    line-height: 100%;
    text-transform: uppercase;
`;

const AddressContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    border-radius: 6px;
    padding: 0 10px 0 0;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.secondary};
`;

const Address = styled.span`
    font-size: 14px;
    font-weight: 800;
    line-height: normal;
    letter-spacing: -0.28px;
    text-transform: lowercase;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 60px;
`;

const QRIcon = styled.i`
    font-size: 20px;
    position: absolute;
    cursor: pointer;
    right: 90px;
    top: 8px;
    color: ${(props) => props.theme.input.textColor.primary};
`;

const CopyText = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 14px;
    font-weight: 800;
    line-height: 100%; /* 14px */
    text-transform: uppercase;
    cursor: pointer;
`;

const Separator = styled.div`
    height: 1px;
    margin: 45px 6px 20px;
    background: ${(props) => props.theme.button.borderColor.primary};
    position: relative;
    &:after {
        position: absolute;

        content: 'or';
        font-family: ${(props) => props.theme.fontFamily.secondary};
        font-size: 14px;
        font-weight: 800;
        line-height: 12px;
        letter-spacing: -0.5px;
        color: ${(props) => props.theme.textColor.secondary};
        background: ${(props) => props.theme.background.primary};
        top: 50%; /* position the top  edge of the element at the middle of the parent */
        left: 50%; /* position the left edge of the element at the middle of the parent */

        transform: translate(-50%, -50%);
        padding: 0 11px;
    }
`;

const OnramperDiv = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
`;

const OnRampWrapper = styled(OnramperDiv)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
    }
`;

const OnramperIcons = styled.i`
    font-size: 70px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 60px;
    }
`;

const CopyIcon = styled.i`
    position: absolute;
    right: 60px;
    top: 6px;
    font-size: 22px;
`;

const DepositContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
`;

const Label = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
    letter-spacing: -0.28px;
    text-transform: uppercase;
`;

const WarningMessage = styled.span`
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.background.primary};
    padding: 10px 12px;
    width: 100%;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.5px;
    border-radius: 5px;
    margin-top: 10px;
`;

const TutorialsWrapper = styled.div`
    margin-top: 10px;
    padding: 20px 25px;
    width: 100%;
    border-radius: 15px;
    gap: 14px;
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.background.primary};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const TutorialHeader = styled.span`
    color: ${(props) => props.theme.background.primary};
    font-size: 14px;
    font-weight: 800;
    text-transform: capitalize;
    margin-bottom: 8px;
`;

const TutorialLink = styled.span`
    color: ${(props) => props.theme.background.primary};
    font-size: 12px;
    font-weight: 800;
    text-decoration-line: underline;
    text-transform: capitalize;
`;

const TokensWrapper = styled(FlexDiv)`
    gap: 10px;
    margin-top: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

const Token = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.background.primary};
    width: 110px;
    height: 40px;
`;

const TokenName = styled.span`
    font-weight: 800;
    font-size: 14px;
    color: ${(props) => props.theme.background.primary};
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.background.primary};
    font-weight: 100;
    text-transform: none;
`;

const SidesWrapper = styled.div`
    width: 100%;
`;
