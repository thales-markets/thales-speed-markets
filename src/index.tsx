import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import Root from './pages/Root';
import store from './redux/store';
import reportWebVitals from './reportWebVitals';
import './styles/currencies.css';
import './styles/fonts.css';
import './styles/icons.css';
import './styles/main.css';
import './styles/overrides.css';
import './styles/sidebar-icons.css';
import './styles/thales-icons.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.Fragment>
        <Root store={store} />
    </React.Fragment>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
