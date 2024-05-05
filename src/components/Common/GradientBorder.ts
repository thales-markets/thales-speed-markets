import styled from 'styled-components';

export const GradientContainer = styled.div<{ width?: number; borderRadius?: string }>`
    padding: 2px;
    background: linear-gradient(90deg, #a764b7 0%, #169cd2 100%);
    border-radius: ${(props) => props.borderRadius ?? '8px'};
    width: ${(props) => props.width ?? '100%'};
`;
