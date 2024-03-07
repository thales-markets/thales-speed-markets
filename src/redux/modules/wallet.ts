import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, WalletSliceState } from 'types/ui';

const sliceName = 'wallet';

const initialState: WalletSliceState = {
    selectedCollateralIndex: 0,
};

const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setSelectedCollateralIndex: (state, action: PayloadAction<number>) => {
            state.selectedCollateralIndex = action.payload;
        },
    },
});

const getWalletState = (state: RootState) => state[sliceName];

export const getSelectedCollateralIndex = (state: RootState) => getWalletState(state).selectedCollateralIndex;

export const { setSelectedCollateralIndex } = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
