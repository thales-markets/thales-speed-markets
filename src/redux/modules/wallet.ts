import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, WalletSliceState } from 'types/ui';

const sliceName = 'wallet';

const initialState: WalletSliceState = {
    selectedCollateralIndex: 0,
    isBiconomy: false,
    walletConnectModal: {
        visibility: false,
        origin: undefined,
    },
};

const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setSelectedCollateralIndex: (state, action: PayloadAction<number>) => {
            state.selectedCollateralIndex = action.payload;
        },
        setIsBiconomy: (state, action: PayloadAction<boolean>) => {
            state.isBiconomy = action.payload;
        },
        setWalletConnectModalVisibility: (
            state,
            action: PayloadAction<{ visibility: boolean; origin?: 'sign-up' | 'sign-in' | undefined }>
        ) => {
            state.walletConnectModal.visibility = action.payload.visibility;
            state.walletConnectModal.origin = action.payload.origin;
        },
    },
});

const getWalletState = (state: RootState) => state[sliceName];

export const getSelectedCollateralIndex = (state: RootState) => getWalletState(state).selectedCollateralIndex;
export const getIsBiconomy = (state: RootState) => getWalletState(state).isBiconomy;
export const getWalletConnectModalOrigin = (state: RootState) => getWalletState(state).walletConnectModal.origin;
export const getWalletConnectModalVisibility = (state: RootState) =>
    getWalletState(state).walletConnectModal.visibility;

export const {
    setSelectedCollateralIndex,
    setIsBiconomy,
    setWalletConnectModalVisibility,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
