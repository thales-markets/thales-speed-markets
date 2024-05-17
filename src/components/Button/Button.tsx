import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type ButtonProps = {
    width?: string;
    minWidth?: string;
    height?: string;
    padding?: string;
    margin?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: string;
    borderWidth?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
    disabled?: boolean;
    additionalStyles?: CSSProperties;
    children?: any;
    onClick?: () => void;
};

const Button: React.FC<ButtonProps> = ({
    width,
    minWidth,
    height,
    padding,
    margin,
    textColor,
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    disabled,
    additionalStyles,
    fontFamily,
    fontSize,
    fontWeight,
    children,
    onClick,
}) => {
    return (
        <Container
            width={width}
            minWidth={minWidth}
            height={height}
            margin={margin}
            $textColor={textColor}
            $borderColor={borderColor}
            $borderRadius={borderRadius}
            $borderWidth={borderWidth}
            $disabled={disabled}
            style={additionalStyles}
        >
            <ButtonWrapper
                minWidth={minWidth}
                height={height}
                padding={padding}
                $textColor={textColor}
                $backgroundColor={backgroundColor}
                $borderRadius={borderRadius}
                $borderWidth={borderWidth}
                disabled={disabled}
                $fontFamily={fontFamily}
                $fontSize={fontSize}
                $fontWeight={fontWeight}
                style={additionalStyles}
                onClick={onClick}
            >
                {children}
            </ButtonWrapper>
        </Container>
    );
};

const DEFAULT_MIN_HEIGHT = '40px';
const DEFAULT_BORDER_WIDTH = '2px'; // border width
const DEFAULT_BORDER_RADIUS = '30px';

const Container = styled(FlexDivCentered)<{
    width?: string;
    minWidth?: string;
    height?: string;
    margin?: string;
    $textColor?: string;
    $borderColor?: string;
    $borderRadius?: string;
    $borderWidth?: string;
    $disabled?: boolean;
}>`
    width: ${(props) => props.width || 'auto'};
    ${(props) => (props.minWidth ? `min-width: ${props.minWidth};` : '')};
    min-height: ${(props) => props.height || DEFAULT_MIN_HEIGHT};
    background: ${(props) => props.$borderColor || props.theme.button.borderColor.primary};
    &:hover {
        ${(props) =>
            !props.$disabled && !props.$textColor ? `background: ${props.theme.button.textColor.tertiary};` : ''}
    }
    border-radius: ${(props) => props.$borderRadius || DEFAULT_BORDER_RADIUS};
    padding: ${(props) => props.$borderWidth || DEFAULT_BORDER_WIDTH};
    margin: ${(props) => props.margin || ''};
    ${(props) =>
        props.$disabled
            ? `
                cursor: default;
                opacity: 0.4;
            `
            : ''};
`;

const ButtonWrapper = styled.button<{
    minWidth?: string;
    height?: string;
    padding?: string;
    $backgroundColor?: string;
    $textColor?: string;
    $borderRadius?: string;
    $borderWidth?: string;
    $fontFamily?: string;
    $fontSize?: string;
    $fontWeight?: number;
    disabled?: boolean;
}>`
    display: flex;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: ${(props) => (props.padding ? props.padding : '1px 14px')};
    ${(props) =>
        props.minWidth
            ? `min-width: calc(${props.minWidth} - 2 * ${props.$borderWidth || DEFAULT_BORDER_WIDTH});`
            : ''};
    min-height: ${(props) =>
        props.height
            ? `calc(${props.height} - 2 * ${props.$borderWidth || DEFAULT_BORDER_WIDTH})`
            : `calc(${DEFAULT_MIN_HEIGHT} - 2 * ${DEFAULT_BORDER_WIDTH})`};
    border-radius: ${(props) => props.$borderRadius || DEFAULT_BORDER_RADIUS};
    border-width: 0;
    font-weight: ${(props) => props.$fontWeight || '800'};
    font-size: ${(props) => props.$fontSize || '18px'};
    font-family: ${(props) => props.$fontFamily || props.theme.fontFamily.secondary};
    line-height: 100%;
    cursor: pointer;
    color: ${(props) =>
        props.$textColor ||
        (props.disabled ? props.theme.button.textColor.tertiary : props.theme.button.textColor.primary)};
    background-color: ${(props) => props.$backgroundColor || props.theme.button.background.primary};
    outline: none;
    &:disabled {
        cursor: default;
    }
    &:hover {
        ${(props) => (!props.disabled && !props.$textColor ? `color: ${props.theme.button.textColor.tertiary};` : '')}
        // color on hover for icons inside button
        i, span {
            ${(props) =>
                !props.disabled && !props.$textColor ? `color: ${props.theme.button.textColor.tertiary};` : ''}
        }
    }
`;

export default Button;
