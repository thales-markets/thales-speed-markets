import theme from 'styles/themes/dark';

export type AppSliceState = {
    isReady: boolean;
};

export type WalletSliceState = {
    selectedCollateralIndex: number;
    isBiconomy?: boolean;
};

export type UISliceState = {
    isMobile: boolean;
};

export type RootState = {
    app: AppSliceState;
    wallet: WalletSliceState;
    ui: UISliceState;
};

export type ThemeInterface = typeof theme;

declare module 'styled-components' {
    interface DefaultTheme extends ThemeInterface {}
}
