import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { UserOpenPositions } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { refetchUserSpeedMarkets } from 'utils/queryConnector';
import { useAccount, useChainId } from 'wagmi';
import SharePositionModal from '../SharePositionModal';

const SharePosition: React.FC<{
    position: UserOpenPositions;
    isDisabled?: boolean;
    isOpen?: boolean;
    onClose?: React.Dispatch<void>;
}> = ({ position, isDisabled, isOpen, onClose }) => {
    const networkId = useChainId();
    const { address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);
    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(isOpen);

    useInterval(() => {
        if (Date.now() > position.maturityDate) {
            if (!isMatured) {
                setIsMatured(true);
            }
            if (!position.finalPrice) {
                refetchUserSpeedMarkets(
                    false,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
            }
        }
    }, secondsToMilliseconds(10));

    useEffect(() => {
        if (isOpen) {
            setOpenTwitterShareModal(isOpen);
        }
    }, [isOpen]);

    const displayShare = position.claimable || !isMatured;

    return (
        <>
            {displayShare && (
                <ShareIcon
                    className="icon icon--share"
                    $disabled={!!isDisabled}
                    onClick={() => !isDisabled && setOpenTwitterShareModal(true)}
                />
            )}
            {openTwitterShareModal && (
                <SharePositionModal
                    type={position.claimable ? 'resolved-speed' : 'potential-speed'}
                    positions={[position.side]}
                    currencyKey={position.currencyKey}
                    strikeDate={position.maturityDate}
                    strikePrices={[position.strikePrice]}
                    buyIn={position.paid}
                    payout={position.payout}
                    onClose={() => {
                        setOpenTwitterShareModal(false);
                        onClose && onClose();
                    }}
                />
            )}
        </>
    );
};

const ShareIcon = styled.i<{ $disabled: boolean }>`
    color: ${(props) => props.theme.textColor.quinary};
    cursor: ${(props) => (props.$disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.$disabled ? '0.5' : '1')};
    font-size: 20px;
    text-transform: none;
`;

export default SharePosition;
