import { Positions } from 'enums/market';
import { TFunction } from 'i18next';
import styled from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { getColorPerPosition } from 'utils/style';

export const getAmount = (amount: number | string, position: Positions, theme: ThemeInterface, isChained?: boolean) => (
    <Value>
        {amount}
        {!isChained && <Value color={getColorPerPosition(position, theme)}> {position}</Value>}
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
