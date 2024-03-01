import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Positions } from 'enums/options';
import { Theme } from 'enums/ui';
import { localStore } from 'thales-utils';
import { ThemeInterface } from 'types/ui';

export const getDefaultTheme = (): Theme => {
    const lsTheme = localStore.get(LOCAL_STORAGE_KEYS.UI_THEME);
    return lsTheme !== undefined
        ? Object.values(Theme).includes(lsTheme as number)
            ? (lsTheme as Theme)
            : Theme.DARK
        : Theme.DARK;
};

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
