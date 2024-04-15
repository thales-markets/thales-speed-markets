import Loader from 'components/Loader';
import { LINKS } from 'constants/links';
import DappFooter from 'layouts/DappLayout/DappFooter';
import queryString from 'query-string';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { RootState } from 'types/ui';
import { setReferralWallet } from 'utils/referral';

type MainLayoutProps = {
    children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const rawParams = useLocation();
    const queryParams = queryString.parse(rawParams?.search);

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
    }, [queryParams?.referralId, queryParams.referrerId]);

    return (
        <Container>
            {isAppReady ? (
                <>
                    {children}
                    <DappFooter />
                </>
            ) : (
                <Loader />
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    max-width: 1440px;
    min-height: 100vh;
    margin-left: auto;
    margin-right: auto;
`;

export default MainLayout;
