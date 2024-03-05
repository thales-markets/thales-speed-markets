import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Text = styled.span`
    font-weight: 700;
    font-size: 13px;
    line-height: 15px;
`;

export const TextLabel = styled(Text)`
    color: ${(props) => props.theme.textColor.secondary};
`;
export const TextValue = styled(Text)<{ isProfit?: boolean; uppercase?: boolean; lowercase?: boolean }>`
    color: ${(props) => (props.isProfit ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
    text-transform: ${(props) => (props.uppercase ? 'uppercase' : props.lowercase ? 'lowercase' : 'initial')};
`;

export const ColumnSpaceBetween = styled(FlexDivColumn)`
    width: 100%;
    height: 100%;
    justify-content: space-between;
`;
