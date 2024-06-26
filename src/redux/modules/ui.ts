import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, UISliceState } from 'types/ui';

const sliceName = 'ui';

const initialState: UISliceState = {
    isMobile: false,
};

const uiSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setIsMobile: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
    },
});

const getUIState = (state: RootState) => state[sliceName];
export const getIsMobile = (state: RootState) => getUIState(state).isMobile;

export const { setIsMobile } = uiSlice.actions;

export default uiSlice.reducer;
