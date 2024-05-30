import { Positions } from 'enums/market';
import { TFunction } from 'i18next';
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

export const getStatus = (claimed: boolean, theme: ThemeInterface, t: TFunction) =>
    claimed ? (
        <Value color={theme.textColor.quaternary} fontSize="15px">
            {t('profile.claimed')}
        </Value>
    ) : (
        <Value color={theme.textColor.tertiary} fontSize="15px">
            {t('profile.rip')}
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
