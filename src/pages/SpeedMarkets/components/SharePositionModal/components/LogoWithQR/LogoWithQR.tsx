import ROUTES from 'constants/routes';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { buildReferrerLink } from 'utils/routes';
import { useAccount } from 'wagmi';

const LogoWithQR: React.FC<{ color: string }> = ({ color }) => {
    const { address: walletAddress, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const reffererIDQuery = useGetReffererIdQuery(
        ((isBiconomy ? biconomyConnector.address : walletAddress) as string) || '',
        { enabled: isConnected }
    );
    const reffererID = reffererIDQuery.isSuccess && reffererIDQuery.data ? reffererIDQuery.data : '';

    return (
        <Container>
            <LogoIcon $color={color} className="network-icon  network-icon--speed-full-logo" />
            {reffererID && (
                <ReferralWrapper $color={color}>
                    <QRCode size={53} value={buildReferrerLink(ROUTES.Home, reffererID)} bgColor={color} />
                </ReferralWrapper>
            )}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 63px;
`;

const LogoIcon = styled.i<{ $color: string }>`
    font-size: 130px;
    color: ${(props) => props.$color};
`;

const ReferralWrapper = styled.div<{ $color: string }>`
    display: flex;
    justify-content: flex-start;
    background-color: ${(props) => props.$color};
    padding: 5px;
`;

export default LogoWithQR;
