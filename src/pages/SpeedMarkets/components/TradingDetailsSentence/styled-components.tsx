import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const Cotainer = styled(FlexDivColumn)`
    width: 100%;
`;

export const Text = styled.span`
    font-weight: 800;
    font-size: 18px;
    line-height: 24px;
    color: ${(props) => props.theme.textColor.quinary};
`;

export const TextLabel = styled(Text)``;

const TextValue = styled(Text)<{ $isProfit?: boolean; $uppercase?: boolean; $lowercase?: boolean }>`
    font-weight: ${(props) => (props.$uppercase || [props.$isProfit] ? '800' : '400')};
    text-transform: ${(props) => (props.$uppercase ? 'uppercase' : props.$lowercase ? 'lowercase' : 'initial')};
`;

export const SentanceTextValue = styled(TextValue)`
    padding-left: 5px;
`;

export const PositionText = styled(TextValue)<{ $isUp: boolean }>`
    color: ${(props) => (props.$isUp ? props.theme.positionColor.up : props.theme.positionColor.down)};
    text-transform: uppercase;
`;
