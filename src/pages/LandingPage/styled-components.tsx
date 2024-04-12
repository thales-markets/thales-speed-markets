import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivStart } from 'styles/common';

export const Container = styled.div`
    position: relative;
    width: 100%;
    min-height: 800px;
`;

export const ZeusImg = styled.img`
    position: absolute;
    right: 0;
    width: 695px;
`;

export const BlueTriangleImg = styled.img`
    position: absolute;
    top: -50px;
    right: 486px;
    width: 400px;
    height: 400px;
    transform: rotate(180deg);
`;

export const PurpleTriangleImg = styled.img`
    position: absolute;
    top: 50px;
    left: 1150px;
    width: 400px;
    height: 400px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        left: unset;
        right: 0;
        object-fit: cover;
        object-position: 15% 100%;
        width: 260px;
        overflow: clip;
    }
`;

export const BlurImg = styled.img`
    position: absolute;
    transform: scale(0.7);
`;

export const MediumBlurImg = styled(BlurImg)`
    position: absolute;
    top: 190px;
    left: -60px;
    transform: scale(2);
`;
export const BigBlurImg = styled(BlurImg)`
    position: absolute;
    top: 630px;
    right: 0;
    transform: scale(6);
`;

export const RocketWrapper = styled.div`
    position: absolute;
    top: 2070px;
    left: 50px;
`;

export const RocketImg = styled.img`
    width: 240px;
    position: relative;
    z-index: 1;
`;

export const BigRocketWrapper = styled.div`
    position: absolute;
    top: 2350px;
    right: 0;
`;

export const BigRocketImgWrapper = styled.div`
    position: absolute;
    right: 0;
    width: 430px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        overflow-x: clip;
    }
`;

export const BigRocketImg = styled.img`
    position: absolute;
    left: 0;
    width: 500px;
    height: 1350px;
    overflow: clip;
    object-fit: cover;
    object-position: 15% 12%;
    z-index: 1;
`;

export const Header = styled(FlexDivColumn)`
    position: relative;
    margin: 94px 155px 0 95px;
    gap: 45px;
    z-index: 1;
`;

export const SpeedLogo = styled.i`
    font-size: 350px;
    line-height: 127px;
    margin-left: -15px;
    margin-bottom: -23px;
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
`;

export const TitleDesc = styled.p`
    width: 694px;
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 18px;
    line-height: 110%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

export const ButtonContainer = styled(FlexDivCentered)<{ margin?: string }>`
    margin: ${(props) => (props.margin ? props.margin : '73px 0 70px 0')};
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
    gap: 24px;
`;

export const ContentIconWrapper = styled(FlexDivEnd)`
    width: 130px;
`;
export const ContentIcon = styled.i<{
    fontSize?: string;
    isRotating?: boolean;
    isBold?: boolean;
    margin?: string;
}>`
    font-size: ${(props) => props.fontSize || 113}px;
    line-height: 110%;
    ${(props) => (props.isBold ? 'font-weight: bold;' : '')}
    ${(props) => (props.isRotating ? 'transform: rotate(-12deg);' : '')}
    background: ${(props) => props.theme.icon.textColor.primary};
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: ${(props) => (props.margin ? props.margin : '0')};
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
`;
export const ContentTextDesc = styled.p`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 16px;
    line-height: 100%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

export const Video = styled(FlexDivCentered)`
    height: 300px;
    margin-top: 126px;
    margin-bottom: 127px;
`;
