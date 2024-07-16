import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

export const Cotainer = styled(FlexDivColumn)`
    width: 100%;
`;

export const Text = styled.span`
    font-weight: 800;
    font-size: 18px;
    line-height: 24px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
`;

export const Footer = styled(FlexDivCentered)<{ isRelative: boolean }>`
    position: ${(props) => (props.isRelative ? 'relative' : 'absolute')};
    width: 100%;
    left: 0;
    ${(props) => (props.isRelative ? '' : 'bottom: 12px;')}
`;

export const TextFooter = styled(Text)`
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        line-height: 100%;
        padding-top: 5px;
    }
`;

export const TextLabel = styled(Text)``;

export const TextValue = styled(Text)<{ $isProfit?: boolean; $uppercase?: boolean; $lowercase?: boolean }>`
    font-weight: ${(props) => (props.$uppercase || [props.$isProfit] ? '800' : '400')};
    text-transform: ${(props) => (props.$uppercase ? 'uppercase' : props.$lowercase ? 'lowercase' : 'initial')};
`;

export const PositionText = styled(TextValue)<{ $isUp: boolean }>`
    color: ${(props) => (props.$isUp ? props.theme.price.up : props.theme.price.down)};
    text-transform: uppercase;
`;
