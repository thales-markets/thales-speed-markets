import styled from 'styled-components';

export const GradientContainer = styled.div<{ width?: number; borderRadius?: string }>`
    padding: 2px;
    background: ${(props) => props.theme.borderColor.tertiary};
    border-radius: ${(props) => props.borderRadius ?? '8px'};
    width: ${(props) => (props.width ? `${props.width}px` : '100%')};
`;
