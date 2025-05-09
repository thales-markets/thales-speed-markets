import Banner from 'components/Banner';
import { LINKS } from 'constants/links';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { PAGE_MAX_WIDTH } from 'styles/common';
import { isAndroid, isMetamask } from 'thales-utils';
import { isMobile } from 'utils/device';
import { setReferralWallet } from 'utils/referral';
import { ScreenSizeBreakpoint } from '../../enums/ui';
import DappFooter from './DappFooter';
import DappHeader from './DappHeader';

type DappLayoutProps = {
    children: React.ReactNode;
};

const DappLayout: React.FC<DappLayoutProps> = ({ children }) => {
    const rawParams = useLocation();
    const queryParams = queryString.parse(rawParams?.search);

    const [, setPreventDiscordWidgetLoad] = useState(true);

    useEffect(() => {
        if (queryParams?.referralId) {
            setReferralWallet(queryParams?.referralId);
        }
        if (queryParams?.referrerId) {
            const fetchIdAddress = async () => {
                const response = await fetch(
                    // passing an encoded string to encodeURIComponent causes an error in some cases
                    // reffererId is already encoded so we have to decode it
                    `${LINKS.API}/get-refferer-id-address/${encodeURIComponent(
                        decodeURIComponent(queryParams.referrerId)
                    )}`
                );
                const wallet = await response.text();
                if (wallet) {
                    setReferralWallet(wallet);
                }
            };
            fetchIdAddress();
        }
    }, [queryParams?.referralId, queryParams?.referrerId]);

    useEffect(() => {
        const checkMetamaskBrowser = async () => {
            const isMetamaskBrowser = isMobile() && (await isMetamask());
            // Do not load Discord Widget Bot on Android MM browser due to issue with MM wallet connect
            // issue raised on https://github.com/rainbow-me/rainbowkit/issues/1181
            setPreventDiscordWidgetLoad(isMetamaskBrowser && isAndroid());
        };
        checkMetamaskBrowser();
    }, []);

    // useWidgetBotScript(preventDiscordWidgetLoad, theme);

    return (
        <Background id="main-content">
            <Banner />
            <Wrapper>
                <DappHeader />
                {children}
                <DappFooter />
            </Wrapper>

            <StyledToastContainer />
        </Background>
    );
};

const Background = styled.section`
    transition: all 0.5s ease;
    min-height: 100vh;
    position: relative;
    top: 0;
    left: 0;
    overflow: hidden;
    &.collapse {
        transition: all 0.5s ease;
        min-height: unset;
        left: 275px;
        overflow: hidden;
    }
    background-color: ${(props) => props.theme.background.primary};
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    min-height: 100vh;
    margin: 0 auto;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 10px 10px 0 10px;
    }
`;

const StyledToastContainer = styled(ToastContainer)`
    &&&.Toastify__toast-container {
        z-index: 30000;
        width: auto;
        @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
            top: 0;
            padding: 0;
            left: 0;
            margin: 0;
            transform: translateX(0);
        }
    }
    .Toastify__toast {
        width: 384px;
        height: 70px;
        cursor: default;
        border-radius: 8px;

        &.success {
            background: ${(props) =>
                `linear-gradient(271deg, ${props.theme.toastMessages.success.background.secondary} 0.53%, ${props.theme.toastMessages.success.background.tertiary} 45.66%, ${props.theme.toastMessages.success.background.quaternary} 100.81%);`};
        }
        &.info {
            background: ${(props) =>
                `linear-gradient(90deg, ${props.theme.toastMessages.info.background.secondary} 39.57%, ${props.theme.toastMessages.info.background.tertiary} 100.88%);`};
        }
        &.error {
            background: ${(props) =>
                `linear-gradient(88.69deg, ${props.theme.toastMessages.error.background.secondary} 0%, ${props.theme.toastMessages.error.background.tertiary} 96.05%);`};
        }
        color: ${(props) => props.theme.toastMessages.success.textColor.primary};

        @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
            width: 100vw;
            border-radius: 0;
        }
    }
    .Toastify__progress-bar {
        height: 10px;
        background: inherit;

        &.success {
            background: ${(props) => props.theme.toastMessages.success.background.primary};
        }
        &.info {
            background: ${(props) => props.theme.toastMessages.info.background.primary};
        }
        &.error {
            background: ${(props) => props.theme.toastMessages.error.background.primary};
        }
    }
    .Toastify__toast-icon {
        width: 34px;
        margin-inline-end: 12px;
    }
    .Toastify__spinner {
        width: 34px;
        height: 34px;
        border-right-color: ${(props) => props.theme.toastMessages.info.background.primary};
    }
`;

export default DappLayout;
