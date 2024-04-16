import styled from 'styled-components';

export const GradientContainer = styled.div<{ width?: number }>`
    padding: 1px;
    background: linear-gradient(90deg, #a764b7 0%, #169cd2 100%);
    border-radius: 8px;
    width: ${(props) => props.width ?? '100%'};
`;
