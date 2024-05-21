import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';

export const Container = styled.div`
    position: relative;
    width: 100%;
    min-height: 800px;
`;

export const ZeusImgWrapper = styled.div`
    position: absolute;
    top: 20px;
    right: 0;
    width: 695px;
    height: 695px;
    overflow: clip;
    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        width: 500px;
        top: 60px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 380px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: 300px;
        top: 70px;
    }
`;

export const ZeusImg = styled.img`
    position: absolute;
    width: 100%;
    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        width: 500px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 380px;
    }
`;

export const BlueTriangleImg = styled.img`
    position: absolute;
    top: 5px;
    right: 320px;
    width: 400px;
    height: 400px;
    transform: rotate(180deg);
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        display: none;
    }
`;

export const PurpleTriangleImgWrapper = styled.div`
    position: absolute;
    top: 50px;
    right: calc(${ScreenSizeBreakpoint.EXTRA_LARGE}px - 100vw);
    width: calc(100vw - ${ScreenSizeBreakpoint.EXTRA_LARGE}px + 400px);
    height: 400px;
    overflow: clip;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
        right: 0;
        width: 400px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        display: none;
    }
`;

export const PurpleTriangleImg = styled.img`
    position: absolute;
    top: 0;
    left: 100px;
    width: 400px;
    height: 400px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
        left: unset;
        right: 0;
        width: 260px;
        object-fit: cover;
        object-position: 15% 100%;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        width: 200px;
        object-position: 15% 100%;
    }
`;

export const BlurImgWrapper = styled.div`
    position: absolute;
    width: 100vw;
    overflow: clip;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
    }
`;

export const BlurImg = styled.img<{ scale?: number; zIndex?: number }>`
    position: absolute;
    transform: scale(${(props) => props.scale || 0.7});
    z-index: ${(props) => props.zIndex || -1};
`;

export const MediumBlurImg = styled(BlurImg)`
    position: absolute;
    top: 190px;
    left: -60px;
    transform: scale(2);
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        top: 60px;
        left: -110px;
        transform: scale(1);
    }
`;

export const BigBlurImgWrapper = styled.div`
    position: absolute;
    top: 180px;
    right: calc(${ScreenSizeBreakpoint.EXTRA_LARGE}px - 100vw);
    width: calc(100vw - ${ScreenSizeBreakpoint.EXTRA_LARGE}px + 1000px);
    height: 1084px;
    overflow: clip;
    z-index: -1;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
        right: 0px;
        width: 1000px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        top: 77px;
        right: 0px;
        width: 350px;
        height: 480px;
    }
`;

export const BigBlurImg = styled(BlurImg)`
    position: absolute;
    top: 500px;
    left: 630px;
    transform: scale(5);
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
        top: 500px;
        left: 750px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        top: 100px;
        left: 90px;
        transform: scale(2);
    }
`;

export const RocketWrapper = styled.div`
    position: absolute;
    top: 2070px;
    left: 50px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        top: 2220px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        display: none;
    }
`;

export const VideoRocketWrapper = styled.div`
    position: absolute;
    right: -100px;
    bottom: -300px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        display: none;
    }
`;

export const RocketImg = styled.img<{ isVideo?: boolean }>`
    width: ${(props) => (props.isVideo ? '180px' : '240px')};
    position: relative;
    z-index: 1;
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        width: ${(props) => (props.isVideo ? '180px' : '120px')};
    }
`;

export const BigRocketWrapper = styled.div`
    position: absolute;
    bottom: 1012px;
    right: 0;
    z-index: -1;
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        bottom: 600px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        display: none;
    }
`;

export const BigRocketImgWrapper = styled.div`
    position: absolute;
    right: calc(${ScreenSizeBreakpoint.EXTRA_LARGE}px - 100vw);
    width: calc(100vw - ${ScreenSizeBreakpoint.EXTRA_LARGE}px + 500px);
    height: 1264px;
    overflow: clip;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
        right: 0;
        width: 500px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        width: 200px;
        height: 600px;
    }
`;

export const BigRocketImg = styled.img`
    position: absolute;
    left: 70px;
    width: 500px;
    object-fit: cover;
    object-position: 15% 12%;
    z-index: 1;

    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        left: 0;
        width: 200px;
    }
`;

export const Header = styled(FlexDivColumn)`
    position: relative;
    margin: 20px 94px 0;
    gap: 172px;
    z-index: 1;

    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: 50px 20px 0;
    }
`;

export const HeaderRow = styled(FlexDivStart)`
    align-items: center;
`;

export const SpeedLogo = styled.i`
    font-size: 170px;
    line-height: 64px;
    margin-left: -8px;
    margin-bottom: -12px;

    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 130px;
        margin-top: -8px;
        margin-left: -6px;
        margin-bottom: -16px;
    }
`;

export const HeaderLinks = styled(FlexDivSpaceBetween)`
    width: 44%;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 5%;
    gap: 20px;

    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        margin-left: 2%;
        gap: 10px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

export const HeaderText = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 16px;
    font-weight: 800;
    line-height: 100%;
    text-align: center;
    text-transform: uppercase;

    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        font-size: 14px;
    }
`;

export const DappButton = styled(FlexDivCentered)`
    width: 170px;
    height: 40px;
    margin-left: auto;
    border-radius: 60px;
    background: ${(props) => props.theme.button.background.tertiary};
    color: ${(props) => props.theme.button.textColor.secondary};

    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        width: 140px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

export const MobileDappButtonWrapper = styled.div`
    padding: 100px 0;
`;

export const MobileDappButton = styled(DappButton)`
    display: flex;
    margin: 0 auto;
`;

export const MobileBurgerMenu = styled.div`
    position: relative;
    width: 100%;
    z-index: 0;
`;

export const MobileBurger = styled.i`
    display: none;

    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: flex;
        margin-left: auto;
        font-size: 32px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 30px;
    }
`;

export const MenuHeaderLinks = styled(FlexDivColumn)`
    gap: 64px;
    margin-top: 100px;
    margin-left: 58px;
`;

export const CloseIcon = styled.i`
    position: absolute;
    top: 50px;
    right: 20px;
    font-size: 20px;
`;

export const ThalesLogo = styled.i`
    font-size: 200px;
    line-height: 100%;
    margin-top: -58px;
    margin-bottom: -84px;
    z-index: -1;

    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 120px;
        line-height: 100%;
        margin-top: -38px;
        margin-bottom: -52px;
    }
`;

export const TitleWrapper = styled(FlexDivColumn)`
    gap: 13px;
`;

export const Title = styled.h1`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 55px;
    line-height: 100%;
    font-weight: 900;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_LARGE}px) {
        font-size: 50px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 35px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 25px;
    }
`;

export const TitleDesc = styled.p`
    font-size: 18px;
    line-height: 110%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

export const ButtonContainer = styled(FlexDivCentered)<{ isBottom?: boolean }>`
    margin: ${(props) => (props.isBottom ? '232px 0px 88px' : '73px 0 70px 0')};
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        margin: ${(props) => (props.isBottom ? '132px 0px 88px' : '73px 0 70px 0')};
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        ${(props) => (props.isBottom ? 'margin: 60px 0px;' : '')}
    }
`;

export const ButtonWrapper = styled(FlexDivCentered)`
    background: ${(props) => props.theme.button.borderColor.primary};
    border-radius: 60px;
    padding: 2px;
    z-index: 1;
`;

export const Button = styled(FlexDivCentered)`
    width: 210px;
    height: 55px;
    background: ${(props) => props.theme.button.background.primary};
    border-radius: 60px;
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 16px;
    line-height: 100%;
    font-weight: 800;
    text-transform: uppercase;
    z-index: 1;
`;

export const Content = styled(FlexDivColumn)`
    position: relative;
    align-items: center;
    gap: 60px;
`;

export const ContentRow = styled(FlexDivStart)`
    align-items: center;
    padding: 0 10px;
    gap: 24px;
    z-index: 1;
`;

export const ContentIconWrapper = styled(FlexDivEnd)`
    width: 113px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: 56px;
    }
`;

const ContentIcon = styled.i`
    font-size: 113px;
    line-height: 110%;
    background: ${(props) => props.theme.icon.textColor.primary};
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 56px;
    }
`;
export const SpedeContentIcon = styled(ContentIcon)`
    font-size: 148px;
    transform: rotate(-12deg);
    margin: -4px -22px -18px 0px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 74px;
        margin: -4px -12px -12px -6px;
    }
`;
export const ChainedContentIcon = styled(ContentIcon)`
    margin: -2px -4px -14px 0px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: -2px -2px -8px -2px;
    }
`;
export const CryptoContentIcon = styled(ContentIcon)`
    margin: -8px -8px -20px 0px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: -4px -4px -10px -4px;
    }
`;
export const CacheBagContentIcon = styled(ContentIcon)`
    margin: 0 -10px -10px 0;
    font-weight: bold;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: 0px -6px -6px -6px;
    }
`;
export const PythContentIcon = styled(ContentIcon)`
    margin: -8px -15px -18px 0;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: -4px -8px -10px -8px;
    }
`;
export const SecureContentIcon = styled(ContentIcon)`
    margin: -4px -6px -12px 0px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: -2px -4px -8px 2px;
    }
`;
export const DetectiveContentIcon = styled(ContentIcon)`
    margin: -8px -4px -18px 0px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin: -4px -2px -10px 0px;
    }
`;

export const ContentTextWrapper = styled(FlexDivColumn)`
    max-width: 554px;
    gap: 15px;
`;
export const ContentTextTitle = styled.h2`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 30px;
    line-height: 110%;
    font-weight: 900;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 20px;
    }
`;
export const ContentTextDesc = styled.p`
    font-size: 16px;
    line-height: 100%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 14px;
    }
`;

export const VideoWrapper = styled(FlexDivCentered)`
    position: relative;
    max-width: 947px;
    width: 75%;
    aspect-ratio: 16 / 9;
    margin: 126px 0 127px;
    background: ${(props) => props.theme.button.borderColor.primary};
    padding: 2px;
    border-radius: 10px;
`;

export const Video = styled(FlexDivCentered)`
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.background.primary};
    border-radius: 10px;
`;

export const CoinsImg = styled.img`
    position: absolute;
    top: -140px;
    left: -190px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        width: 260px;
        top: -108px;
        left: -150px;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 108px;
        top: -44px;
        left: -58px;
    }
`;

export const LogoText = styled.span`
    font-size: 18px;
    line-height: 150%;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};

    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 13px;
    }
`;

export const Link = styled.a`
    font-weight: 800;
    color: ${(props) => props.theme.link.textColor.secondary};
    text-align: center;
    &:hover {
        text-decoration: underline;
    }

    @media screen and (max-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        width: min-content;
    }
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: max-content;
    }
`;
