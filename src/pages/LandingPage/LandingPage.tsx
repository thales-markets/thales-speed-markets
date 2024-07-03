import BlueTriangle from 'assets/images/landing/blue-triangle.png';
import Blurry from 'assets/images/landing/blurry.svg';
import Coins from 'assets/images/landing/crypto-coins.png';
import PurpleTriangle from 'assets/images/landing/purple-triangle.png';
import Rocket from 'assets/images/landing/rocket.png';
import Zeus from 'assets/images/landing/zeus-hero.webp';
import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ExtraBoldText, FlexDivCentered, FlexDivColumn } from 'styles/common';
import {
    BigBlurImg,
    BigBlurImgWrapper,
    BigRocketImg,
    BigRocketImgWrapper,
    BigRocketWrapper,
    BlueTriangleImg,
    BlurImg,
    BlurImgWrapper,
    Button,
    ButtonContainer,
    ButtonWrapper,
    CacheBagContentIcon,
    ChainedContentIcon,
    CloseIcon,
    CoinsImg,
    Container,
    Content,
    ContentIconWrapper,
    ContentRow,
    ContentTextDesc,
    ContentTextTitle,
    ContentTextWrapper,
    CryptoContentIcon,
    DappButton,
    DetectiveContentIcon,
    Header,
    HeaderLinks,
    HeaderRow,
    HeaderText,
    Link,
    LogoText,
    MediumBlurImg,
    MenuHeaderLinks,
    MobileBurger,
    MobileBurgerMenu,
    MobileDappButton,
    MobileDappButtonWrapper,
    PurpleTriangleImg,
    PurpleTriangleImgWrapper,
    PythContentIcon,
    RocketImg,
    RocketWrapper,
    SecureContentIcon,
    SpedeContentIcon,
    SpeedLogo,
    ThalesLogo,
    Title,
    TitleDesc,
    TitleWrapper,
    Video,
    VideoRocketWrapper,
    VideoWrapper,
    ZeusImg,
    ZeusImgWrapper,
} from './styled-components';
import YouTubeVideo from 'components/YouTubeVideo';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    const [openBurgerMenu, setOpenBurgerMenu] = useState(false);

    const getThalesLogo = () => (
        <FlexDivColumn>
            <a target="_blank" rel="noreferrer" href={LINKS.ThalesIo.Home}>
                <FlexDivCentered>
                    <LogoText>{t('landing.powered-by')}</LogoText>
                </FlexDivCentered>
                <FlexDivCentered>
                    <ThalesLogo className="icon-home icon-home--thales" />
                </FlexDivCentered>
            </a>
        </FlexDivColumn>
    );

    return openBurgerMenu ? (
        <MobileBurgerMenu>
            <CloseIcon className="icon icon--x-sign" onClick={() => setOpenBurgerMenu(false)} />
            <MenuHeaderLinks>
                <Link href={LINKS.ThalesIo.Docs} target="_blank" rel="noreferrer">
                    <HeaderText>{t('landing.header.about')}</HeaderText>
                </Link>
                <Link href={LINKS.Discord.SpeedMarkets} target="_blank" rel="noreferrer">
                    <HeaderText>{t('landing.header.community')}</HeaderText>
                </Link>
                <Link href={LINKS.ThalesIo.Devs} target="_blank" rel="noreferrer">
                    <HeaderText>{t('landing.header.devs')}</HeaderText>
                </Link>
                <Link href={LINKS.ThalesIo.Home} target="_blank" rel="noreferrer">
                    <HeaderText>{t('landing.header.thales')}</HeaderText>
                </Link>
            </MenuHeaderLinks>
            <MobileDappButtonWrapper>
                <SPAAnchor href={ROUTES.Markets.Home}>
                    <MobileDappButton>
                        <HeaderText>{t('landing.header.dapp')}</HeaderText>
                    </MobileDappButton>
                </SPAAnchor>
            </MobileDappButtonWrapper>
            {getThalesLogo()}
        </MobileBurgerMenu>
    ) : (
        <Container>
            <BlueTriangleImg src={BlueTriangle} />
            <ZeusImgWrapper>
                <ZeusImg src={Zeus} />
            </ZeusImgWrapper>
            <RocketWrapper>
                <MediumBlurImg src={Blurry} />
                <RocketImg src={Rocket} />
            </RocketWrapper>
            <BigRocketWrapper>
                <BigBlurImgWrapper>
                    <BigBlurImg src={Blurry} />
                </BigBlurImgWrapper>
                <BigRocketImgWrapper>
                    <BigRocketImg src={Rocket} />
                </BigRocketImgWrapper>
            </BigRocketWrapper>

            <Header>
                <HeaderRow>
                    <SpeedLogo className="icon-home icon-home--speed-full-logo" />
                    <HeaderLinks>
                        <Link href={LINKS.ThalesIo.Docs} target="_blank" rel="noreferrer">
                            <HeaderText>{t('landing.header.about')}</HeaderText>
                        </Link>
                        <Link href={LINKS.Discord.SpeedMarkets} target="_blank" rel="noreferrer">
                            <HeaderText>{t('landing.header.community')}</HeaderText>
                        </Link>
                        <Link href={LINKS.ThalesIo.Devs} target="_blank" rel="noreferrer">
                            <HeaderText>{t('landing.header.devs')}</HeaderText>
                        </Link>
                        <Link href={LINKS.ThalesIo.Home} target="_blank" rel="noreferrer">
                            <HeaderText>{t('landing.header.thales')}</HeaderText>
                        </Link>
                    </HeaderLinks>
                    <SPAAnchor href={ROUTES.Markets.Home}>
                        <DappButton>
                            <HeaderText>{t('landing.header.dapp')}</HeaderText>
                        </DappButton>
                    </SPAAnchor>
                    <MobileBurger
                        className="network-icon network-icon--burger"
                        onClick={() => setOpenBurgerMenu(true)}
                    />
                </HeaderRow>
                <TitleWrapper>
                    <Title>
                        <Trans
                            i18nKey="landing.title"
                            components={{
                                br: <br />,
                            }}
                        />
                    </Title>
                    <TitleDesc>
                        <Trans
                            i18nKey="landing.title-desc"
                            components={{
                                bold: <ExtraBoldText />,
                            }}
                        />
                    </TitleDesc>
                </TitleWrapper>
            </Header>
            <ButtonContainer>
                <BlurImg src={Blurry} zIndex={1} />
                <ButtonWrapper>
                    <SPAAnchor href={ROUTES.Markets.Home}>
                        <Button>{t('landing.trade-now')}</Button>
                    </SPAAnchor>
                </ButtonWrapper>
            </ButtonContainer>
            <Content>
                <PurpleTriangleImgWrapper>
                    <PurpleTriangleImg src={PurpleTriangle} />
                </PurpleTriangleImgWrapper>
                <ContentRow>
                    <ContentIconWrapper>
                        <SpedeContentIcon className="icon-home icon-home--speed-logo" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-1')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-1"
                                components={{
                                    br: <br />,
                                    bold: <ExtraBoldText />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>
                <ContentRow>
                    <ContentIconWrapper>
                        <ChainedContentIcon className="icon-home icon-home--chained" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-2')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-2"
                                components={{
                                    br: <br />,
                                    bold: <ExtraBoldText />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>
                <ContentRow>
                    <ContentIconWrapper>
                        <CryptoContentIcon className="icon-home icon-home--any-crypto" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-3')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-3"
                                components={{
                                    br: <br />,
                                    bold: <ExtraBoldText />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>

                <VideoWrapper>
                    <BlurImgWrapper>
                        <BlurImg src={Blurry} scale={4.5} />
                    </BlurImgWrapper>
                    <CoinsImg src={Coins} />
                    <VideoRocketWrapper>
                        <RocketImg src={Rocket} isVideo={true} />
                    </VideoRocketWrapper>

                    <Video>
                        <YouTubeVideo
                            source="https://www.youtube.com/embed/izARYi8nDm0?rel=0"
                            title="Speed Markets Tutoria"
                        />
                    </Video>
                </VideoWrapper>

                <ContentRow>
                    <ContentIconWrapper>
                        <CacheBagContentIcon className="icon-home icon-home--cache-bag" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-4')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-4"
                                components={{
                                    br: <br />,
                                    bold: <ExtraBoldText />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>
                <ContentRow>
                    <ContentIconWrapper>
                        <PythContentIcon className="icon-home icon-home--pyth" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-5')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-5"
                                components={{
                                    br: <br />,
                                    bold: <Link href={LINKS.Pyth.Benchmarks} target="_blank" rel="noreferrer" />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>
                <ContentRow>
                    <ContentIconWrapper>
                        <SecureContentIcon className="icon-home icon-home--secure" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-6"
                                components={{
                                    br: <br />,
                                    bold: <ExtraBoldText />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>
                <ContentRow>
                    <ContentIconWrapper>
                        <DetectiveContentIcon className="icon-home icon-home--detective" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-7')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-7"
                                components={{
                                    br: <br />,
                                    bold: <ExtraBoldText />,
                                }}
                            />
                        </ContentTextDesc>
                    </ContentTextWrapper>
                </ContentRow>
            </Content>
            <ButtonContainer isBottom={true}>
                <BlurImg src={Blurry} />
                <ButtonWrapper>
                    <SPAAnchor href={ROUTES.Markets.Home}>
                        <Button>{t('landing.trade-now')}</Button>
                    </SPAAnchor>
                </ButtonWrapper>
            </ButtonContainer>

            {getThalesLogo()}
        </Container>
    );
};

export default LandingPage;
