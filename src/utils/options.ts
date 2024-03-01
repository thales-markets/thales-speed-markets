import { Positions } from 'enums/options';
import { ThemeInterface } from 'types/ui';

export const getColorPerPosition = (position: Positions, theme: ThemeInterface) => {
    switch (position) {
        case Positions.UP:
            return theme.positionColor.up;
        case Positions.DOWN:
            return theme.positionColor.down;
        default:
            return theme.textColor.primary;
    }
};
