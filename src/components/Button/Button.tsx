import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type ButtonProps = {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: string;
    onClick?: () => void;
    fontSize?: string;
    disabled?: boolean;
    additionalStyles?: CSSProperties;
    children?: any;
};

const Button: React.FC<ButtonProps> = ({
    width,
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
    children,
}) => {
    return (
        <Container
            width={width}
            height={height}
            padding={padding}
            margin={margin}
            $borderColor={borderColor}
            $borderRadius={borderRadius}
            style={additionalStyles}
        >
            <Wrapper
                height={height}
                padding={padding}
                $textColor={textColor}
                $backgroundColor={backgroundColor}
                $borderRadius={borderRadius}
                onClick={onClick}
                disabled={disabled}
                $fontSize={fontSize}
                style={additionalStyles}
            >
                {children}
            </Wrapper>
        </Container>
    );
};

const DEFAULT_MIN_HEIGHT = '34px';
const DEFAULT_PADDING = '2px';
const DEFAULT_BORDER_RADIUS = '30px';

const Container = styled(FlexDivCentered)<{
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    $borderColor?: string;
    $borderRadius?: string;
}>`
    width: ${(props) => props.width || 'auto'};
    min-height: ${(props) => props.height || DEFAULT_MIN_HEIGHT};
    background: ${(props) => props.$borderColor || props.theme.button.borderColor.primary};
    border-radius: ${(props) => props.$borderRadius || DEFAULT_BORDER_RADIUS};
    padding: ${(props) => props.padding || DEFAULT_PADDING};
    margin: ${(props) => props.margin || ''};
`;

const Wrapper = styled.button<{
    height?: string;
    padding?: string;
    $borderRadius?: string;
    $textColor?: string;
    $backgroundColor?: string;
    $fontSize?: string;
}>`
    display: flex;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: ${(props) =>
        props.height
            ? `calc(${props.height} - 2 * ${props.padding || DEFAULT_PADDING})`
            : `calc(${DEFAULT_MIN_HEIGHT} - 2 * ${DEFAULT_PADDING})`};
    border-radius: ${(props) => props.$borderRadius || DEFAULT_BORDER_RADIUS};
    border-width: 0;
    font-weight: 700;
    font-size: ${(props) => props.$fontSize || '18px'};
    line-height: 100%;
    cursor: pointer;
    color: ${(props) => props.$textColor || props.theme.button.textColor.primary};
    background-color: ${(props) => props.$backgroundColor || props.theme.button.background.primary};
    padding: ${(props) => props.padding || '0 30px'};
    outline: none;
    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

export default Button;
