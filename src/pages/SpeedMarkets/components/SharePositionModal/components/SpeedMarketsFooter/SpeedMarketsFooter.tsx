import SpeedMarketsLogo from 'assets/images/flex-cards/speed-markets-logo.svg';
import ROUTES from 'constants/routes';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';
import { buildReferrerLink } from 'utils/routes';
import { useAccount } from 'wagmi';

const SpeedMarketsFooter: React.FC = () => {
    const { address } = useAccount();

    const reffererIDQuery = useGetReffererIdQuery(address || '', { enabled: !!address });
    const reffererID = reffererIDQuery.isSuccess && reffererIDQuery.data ? reffererIDQuery.data : '';

    return (
        <Container>
            <Logo src={SpeedMarketsLogo} />
            {reffererID && (
                <ReferralWrapper>
                    <QRCode size={70} value={buildReferrerLink(ROUTES.Home, reffererID)} />
                </ReferralWrapper>
            )}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 60px;
    margin: 10px 0px;
`;

const Logo = styled.img`
    width: 70%;
`;

const ReferralWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    background-color: white;
    padding: 5px;
`;

export default SpeedMarketsFooter;
