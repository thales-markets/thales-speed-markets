import { combineReducers } from '@reduxjs/toolkit';
import app from './modules/app';
import ui from './modules/ui';
import wallet from './modules/wallet';

const rootReducer = combineReducers({
    app,
    wallet,
    ui,
});

export default rootReducer;
