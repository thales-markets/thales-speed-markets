import Zeus from 'assets/images/landing/zeus-hero.webp';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ExtraBoldText, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <ZeusImg src={Zeus} />
            <Header>
                <FlexDivRow>
                    <SpeedLogo className="icon-home icon-home--speed-logo" />
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
    margin-top: 13px;
    margin-bottom: 15px;
`;

const ButtonWrapper = styled(FlexDivCentered)`
    background: ${(props) => props.theme.button.borderColor.primary};
    border-radius: 60px;
    padding: 2px;
    z-index: 2;
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

export default LandingPage;
