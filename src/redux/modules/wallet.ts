import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, WalletSliceState } from 'types/ui';

const sliceName = 'wallet';

const initialState: WalletSliceState = {
    selectedCollateralIndex: 0,
    selectedClaimCollateralIndex: 0,
    isBiconomy: false,
    walletConnectModal: {
        visibility: false,
    },
};

const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setSelectedCollateralIndex: (state, action: PayloadAction<number>) => {
            state.selectedCollateralIndex = action.payload;
        },
        setSelectedClaimCollateralIndex: (state, action: PayloadAction<number>) => {
            state.selectedClaimCollateralIndex = action.payload;
        },
        setIsBiconomy: (state, action: PayloadAction<boolean>) => {
            state.isBiconomy = action.payload;
        },
        setWalletConnectModalVisibility: (state, action: PayloadAction<{ visibility: boolean }>) => {
            state.walletConnectModal.visibility = action.payload.visibility;
        },
    },
});

const getWalletState = (state: RootState) => state[sliceName];

export const getSelectedCollateralIndex = (state: RootState) => getWalletState(state).selectedCollateralIndex;
export const getSelectedClaimCollateralIndex = (state: RootState) => getWalletState(state).selectedClaimCollateralIndex;
export const getIsBiconomy = (state: RootState) => getWalletState(state).isBiconomy;
export const getWalletConnectModalVisibility = (state: RootState) =>
    getWalletState(state).walletConnectModal.visibility;

export const {
    setSelectedCollateralIndex,
    setSelectedClaimCollateralIndex,
    setIsBiconomy,
    setWalletConnectModalVisibility,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
