import { Positions } from 'enums/market';
import styled from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { getColorPerPosition } from 'utils/style';

export const getDirections = (positions: Positions[], theme: ThemeInterface, isChained: boolean) => (
    <Value>
        {isChained ? (
            positions.map((position, i) => (
                <Value key={i} color={getColorPerPosition(position, theme)}>
                    {position + (i !== positions.length - 1 ? ', ' : '')}
                </Value>
            ))
        ) : (
            <Value color={getColorPerPosition(positions[0], theme)}> {positions}</Value>
        )}
    </Value>
);

const Value = styled.span<{ color?: string; fontSize?: string }>`
    font-size: ${(props) => props.fontSize || '12px'};
    color: ${(props) => props.color || props.theme.textColor.primary};
`;

export const ShareIcon = styled.i<{ disabled: boolean }>`
    color: ${(props) => props.theme.textColor.secondary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.5' : '1')};
    font-size: 20px;
    text-transform: none;
`;
