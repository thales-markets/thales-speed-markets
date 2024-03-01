import theme from 'styles/themes/dark';
import { SupportedNetwork } from './network';

export type AppSliceState = {
    isReady: boolean;
};

export type WalletSliceState = {
    walletAddress: string | null;
    networkId: SupportedNetwork;
    networkName: string;
    switchToNetworkId: SupportedNetwork; // used to trigger manually network switch in App.js
    selectedCollateralIndex: number;
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
