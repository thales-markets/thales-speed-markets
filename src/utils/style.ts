import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { HistoryStatus, Positions } from 'enums/market';
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
            return theme.price.up;
        case Positions.DOWN:
            return theme.price.down;
        default:
            return theme.textColor.primary;
    }
};

export const getStatusColor = (status: HistoryStatus, theme: ThemeInterface) => {
    switch (status) {
        case HistoryStatus.WON:
            return theme.status.won;
        case HistoryStatus.LOSS:
            return theme.status.loss;
        case HistoryStatus.CLAIMABLE:
            return theme.textColor.quinary;
        default:
            return theme.textColor.primary;
    }
};
