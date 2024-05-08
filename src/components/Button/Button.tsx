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
    onClick?: () => void;
    fontSize?: string;
    fontWeight?: number;
    disabled?: boolean;
    additionalStyles?: CSSProperties;
    children?: any;
};

const Button: React.FC<ButtonProps> = ({
    width,
    minWidth,
    height,
    padding,
    textColor,
    backgroundColor,
    borderColor,
    borderRadius,
    margin,
    onClick,
    disabled,
    additionalStyles,
    fontSize,
    fontWeight,
    children,
}) => {
    return (
        <Container
            width={width}
            minWidth={minWidth}
            height={height}
            padding={padding}
            margin={margin}
            $borderColor={borderColor}
            $borderRadius={borderRadius}
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
                onClick={onClick}
                disabled={disabled}
                $fontSize={fontSize}
                $fontWeight={fontWeight}
                style={additionalStyles}
            >
                {children}
            </ButtonWrapper>
        </Container>
    );
};

const DEFAULT_MIN_HEIGHT = '40px';
const DEFAULT_PADDING = '2px';
const DEFAULT_BORDER_RADIUS = '30px';

const Container = styled(FlexDivCentered)<{
    width?: string;
    minWidth?: string;
    height?: string;
    padding?: string;
    margin?: string;
    $borderColor?: string;
    $borderRadius?: string;
    $disabled?: boolean;
}>`
    width: ${(props) => props.width || 'auto'};
    ${(props) => (props.minWidth ? `min-width: ${props.minWidth};` : '')};
    min-height: ${(props) => props.height || DEFAULT_MIN_HEIGHT};
    background: ${(props) => props.$borderColor || props.theme.button.borderColor.primary};
    &:hover {
        background: ${(props) => props.theme.button.textColor.tertiary};
    }
    border-radius: ${(props) => props.$borderRadius || DEFAULT_BORDER_RADIUS};
    padding: ${(props) => props.padding || DEFAULT_PADDING};
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
    $borderRadius?: string;
    $textColor?: string;
    $backgroundColor?: string;
    $fontSize?: string;
    $fontWeight?: number;
}>`
    display: flex;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
    width: 100%;
    ${(props) =>
        props.minWidth ? `min-width: calc(${props.minWidth} - 2 * ${props.padding || DEFAULT_PADDING});` : ''};
    min-height: ${(props) =>
        props.height
            ? `calc(${props.height} - 2 * ${props.padding || DEFAULT_PADDING})`
            : `calc(${DEFAULT_MIN_HEIGHT} - 2 * ${DEFAULT_PADDING})`};
    border-radius: ${(props) => props.$borderRadius || DEFAULT_BORDER_RADIUS};
    border-width: 0;
    font-weight: ${(props) => props.$fontWeight || '700'};
    font-size: ${(props) => props.$fontSize || '18px'};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    line-height: 100%;
    cursor: pointer;
    color: ${(props) => props.$textColor || props.theme.button.textColor.primary};
    background-color: ${(props) => props.$backgroundColor || props.theme.button.background.primary};
    outline: none;
    &:disabled {
        cursor: default;
    }
    &:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
    }
`;

export default Button;
