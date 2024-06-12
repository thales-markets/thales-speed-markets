import { combineReducers } from '@reduxjs/toolkit';
import app from './modules/app';
import user from './modules/user';
import ui from './modules/ui';
import wallet from './modules/wallet';

const rootReducer = combineReducers({
    app,
    user,
    wallet,
    ui,
});

export default rootReducer;
