import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Text = styled.span`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-weight: 400;
    font-size: 18px;
    line-height: 130%;
    color: ${(props) => props.theme.textColor.quinary};
`;

export const TextLabel = styled(Text)``;
export const TextValue = styled(Text)<{ $isProfit?: boolean; $uppercase?: boolean; $lowercase?: boolean }>`
    font-weight: ${(props) => (props.$uppercase || [props.$isProfit] ? '800' : '400')};
    text-transform: ${(props) => (props.$uppercase ? 'uppercase' : props.$lowercase ? 'lowercase' : 'initial')};
`;

export const ColumnSpaceBetween = styled(FlexDivColumn)`
    width: 100%;
    height: 100%;
    justify-content: space-between;
`;
