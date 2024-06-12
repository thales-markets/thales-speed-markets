import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, UserSliceState } from 'types/ui';

const sliceName = 'user';

const initialState: UserSliceState = {
    notifications: { single: 0, chained: 0 },
};

const userSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setUserNotifications: (state, action: PayloadAction<typeof initialState.notifications>) => {
            state.notifications = { single: action.payload.single, chained: action.payload.chained };
        },
    },
});

const getUserState = (state: RootState) => state[sliceName];
export const getUserNotifications = (state: RootState) => getUserState(state).notifications;

export const { setUserNotifications } = userSlice.actions;

export default userSlice.reducer;
