import BlueTriangle from 'assets/images/landing/blue-triangle.png';
import Blurry from 'assets/images/landing/blurry.svg';
import Coins from 'assets/images/landing/crypto-coins.png';
import PurpleTriangle from 'assets/images/landing/purple-triangle.png';
import Rocket from 'assets/images/landing/rocket.png';
import Zeus from 'assets/images/landing/zeus-hero.webp';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { Trans, useTranslation } from 'react-i18next';
import { ExtraBoldText, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
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
    CoinsImg,
    Container,
    Content,
    ContentIconWrapper,
    ContentRow,
    ContentTextDesc,
    ContentTextTitle,
    ContentTextWrapper,
    CryptoContentIcon,
    DetectiveContentIcon,
    Header,
    Link,
    LogoText,
    MediumBlurImg,
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
import { LINKS } from 'constants/links';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    return (
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
                <FlexDivRow>
                    <SpeedLogo className="icon-home icon-home--speed-full-logo" />
                </FlexDivRow>
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

                    <Video>VIDEO</Video>
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

            <FlexDivColumn>
                <FlexDivCentered>
                    <LogoText>{t('landing.powered-by')}</LogoText>
                </FlexDivCentered>
                <FlexDivCentered>
                    <ThalesLogo className="icon-home icon-home--thales" />
                </FlexDivCentered>
            </FlexDivColumn>
        </Container>
    );
};

export default LandingPage;
