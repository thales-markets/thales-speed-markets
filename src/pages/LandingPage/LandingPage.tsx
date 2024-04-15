import BlueTriangle from 'assets/images/landing/blue-triangle.png';
import Blurry from 'assets/images/landing/blurry.svg';
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
    Button,
    ButtonContainer,
    ButtonWrapper,
    Container,
    Content,
    ContentIcon,
    ContentIconWrapper,
    ContentRow,
    ContentTextDesc,
    ContentTextTitle,
    ContentTextWrapper,
    Header,
    LogoText,
    MediumBlurImg,
    PurpleTriangleImg,
    PurpleTriangleImgWrapper,
    RocketImg,
    RocketWrapper,
    SpeedLogo,
    ThalesLogo,
    Title,
    TitleDesc,
    TitleWrapper,
    Video,
    ZeusImg,
} from './styled-components';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <BlueTriangleImg src={BlueTriangle} />
            <ZeusImg src={Zeus} />
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
                <BlurImg src={Blurry} />
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
                        <ContentIcon
                            className="icon-home icon-home--speed-logo"
                            fontSize="148"
                            isRotating={true}
                            margin="-4px -22px -18px 0px"
                        />
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
                        <ContentIcon className="icon-home icon-home--chained" margin="-2px -4px -14px 0px" />
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
                        <ContentIcon className="icon-home icon-home--any-crypto" margin="-8px -8px -20px 0px" />
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
            </Content>
            <Video>VIDEO</Video>
            <Content>
                <ContentRow>
                    <ContentIconWrapper>
                        <ContentIcon
                            className="icon-home icon-home--cache-bag"
                            isBold={true}
                            margin="0 -10px -10px 0"
                        />
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
                        <ContentIcon className="icon-home icon-home--pyth" margin="-8px -15px -18px 0" />
                    </ContentIconWrapper>
                    <ContentTextWrapper>
                        <ContentTextTitle>{t('landing.content.title-5')}</ContentTextTitle>
                        <ContentTextDesc>
                            <Trans
                                i18nKey="landing.content.text-5"
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
                        <ContentIcon className="icon-home icon-home--secure" margin="-4px -6px -12px 0px" />
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
                        <ContentIcon className="icon-home icon-home--detective" margin="-8px -4px -18px 0px" />
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
            <ButtonContainer margin="232px 0 88px 0">
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
