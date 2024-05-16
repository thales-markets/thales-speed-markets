import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';

export const PositionContainer = styled(FlexDivStart)`
    gap: 10px;
    align-items: center;
`;

export const PlusMinusIcon = styled.i`
    font-size: 28px;
    color: ${(props) => props.theme.button.textColor.tertiary};
    cursor: pointer;
`;

export const Header = styled(FlexDivColumn)`
    margin-bottom: 6px;
`;

export const HeaderText = styled.span`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 18px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quinary};
`;

export const HeaderSubText = styled(HeaderText)`
    font-weight: 400;
    font-size: 13px;
    letter-spacing: 0.13px;
    text-transform: none;
`;

export const ClearAll = styled(FlexDivCentered)<{ isDisabled?: boolean }>`
    font-family: ${(props) => props.theme.fontFamily.primary};
    color: ${(props) => props.theme.warning.textColor.primary};

    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%;
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.isDisabled ? '0.5' : '1')};
`;

export const IconWrong = styled(FlexDivCentered)`
    width: 16px;
    height: 16px;
    color: ${(props) => props.theme.warning.textColor.primary};
    border: 2px solid ${(props) => props.theme.warning.textColor.primary};

    font-weight: 300;
    border-radius: 50%;
    font-size: 8px;
    margin-left: 5px;
`;

export const ChainedPositions = styled(FlexDivCentered)`
    gap: 8px;
`;

export const PositionsContainer = styled(FlexDivSpaceBetween)`
    position: relative;
`;

export const PositionsWrapper = styled(FlexDivColumnCentered)`
    width: 43px;
    gap: 10px;
`;

export const PositionWrapper = styled(FlexDivCentered)<{ $isSelected?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 15px;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 18px;
    font-style: normal;
    font-weight: 800;
    line-height: 100%; /* 18px */
    text-transform: uppercase;
    padding-left: 15px;
    width: 145px;
    height: 40px;
    border-radius: 8px;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
`;

export const PositionWrapperChained = styled(FlexDivCentered)<{ $isSelected?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    height: 40px;
    border-radius: 8px;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
`;

const PositionSymbol = styled(FlexDivCentered)<{ size?: number }>`
    position: relative;
    width: ${(props) => (props.size ? props.size : '36')}px;
    height: ${(props) => (props.size ? props.size : '36')}px;
    border-radius: 50%;
    color: ${(props) => props.theme.textColor.quinary};
`;

export const PositionsSymbol = styled(PositionSymbol)<{ $isSelected?: boolean }>`
    color: ${(props) => (props.$isSelected ? props.theme.background.primary : props.theme.textColor.quinary)};
`;

export const Icon = styled.i<{ size?: number; padding?: string; color?: string }>`
    font-size: ${(props) => (props.size ? props.size : '18')}px;
    line-height: 100%;
    color: ${(props) => (props.color ? props.color : 'inherit')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')};
`;

export const AssetIcon = styled(Icon)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 28px;
        line-height: 100%;
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export const Skew = styled.div`
    position: absolute;
    top: -10px;
    right: 0;
    background-color: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
}
`;
