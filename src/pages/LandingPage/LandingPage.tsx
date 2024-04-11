import Zeus from 'assets/images/landing/zeus-hero.webp';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ExtraBoldText, FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivStart } from 'styles/common';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <ZeusImg src={Zeus} />
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
                <ButtonWrapper>
                    <SPAAnchor href={ROUTES.Markets.Home}>
                        <Button>{t('landing.trade-now')}</Button>
                    </SPAAnchor>
                </ButtonWrapper>
            </ButtonContainer>
            <Content>
                <ContentRow>
                    <ContentIcon className="icon-home icon-home--speed-logo" fontSize="148" isRotating={true} />
                    <ContentText>
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
                    </ContentText>
                </ContentRow>
                <ContentRow>
                    <ContentIcon className="icon-home icon-home--chained" />
                    <ContentText>
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
                    </ContentText>
                </ContentRow>
                <ContentRow>
                    <ContentIcon className="icon-home icon-home--any-crypto" />
                    <ContentText>
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
                    </ContentText>
                </ContentRow>
            </Content>
        </Container>
    );
};

const Container = styled.div`
    position: relative;
    width: 100%;
    min-height: 800px;
`;

const ZeusImg = styled.img`
    position: absolute;
    right: 0;
    width: 695px;
`;

const Header = styled(FlexDivColumn)`
    position: relative;
    margin: 94px 155px 0 95px;
    gap: 45px;
    z-index: 1;
`;

const SpeedLogo = styled.i`
    font-size: 350px;
    line-height: 127px;
    margin-left: -15px;
    margin-bottom: -23px;
`;

const TitleWrapper = styled(FlexDivColumn)`
    gap: 13px;
`;

const Title = styled.h1`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 55px;
    line-height: 100%;
    font-weight: 900;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
`;

const TitleDesc = styled.p`
    width: 694px;
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 18px;
    line-height: 110%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin-top: 73px;
    margin-bottom: 70px;
`;

const ButtonWrapper = styled(FlexDivCentered)`
    background: ${(props) => props.theme.button.borderColor.primary};
    border-radius: 60px;
    padding: 2px;
    z-index: 1;
`;

const Button = styled(FlexDivCentered)`
    width: 210px;
    height: 55px;
    background: ${(props) => props.theme.button.background.primary};
    border-radius: 60px;
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 16px;
    line-height: 100%;
    font-weight: 800;
    text-transform: uppercase;
`;

const Content = styled(FlexDivColumn)`
    margin-left: 321px;
    gap: 60px;
`;
const ContentRow = styled(FlexDivStart)`
    align-items: center;
    gap: 24px;
`;

const ContentIcon = styled.i<{ fontSize?: string; isRotating?: boolean }>`
    width: 130px;
    font-size: ${(props) => props.fontSize || 113}px;
    line-height: 110%;
    ${(props) => (props.isRotating ? 'transform: rotate(-12deg);' : '')}
    background: ${(props) => props.theme.icon.textColor.primary};
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: right;
`;

const ContentText = styled(FlexDivColumn)`
    max-width: 554px;
    gap: 15px;
`;
const ContentTextTitle = styled.h2`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 30px;
    line-height: 110%;
    font-weight: 900;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
`;
const ContentTextDesc = styled.p`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 16px;
    line-height: 100%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

export default LandingPage;
