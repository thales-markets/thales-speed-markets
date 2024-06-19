import { intervalToDuration, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { UserChainedPosition, UserPosition } from 'types/market';
import { UserHistoryPosition } from 'types/profile';
import { ThemeInterface } from 'types/ui';
import { formattedDurationFull } from 'utils/formatters/date';
import { getHistoryStatus, mapUserPositionToHistory } from 'utils/position';
import { isUserWinner } from 'utils/speedAmm';
import { getStatusColor } from 'utils/style';
import SharePositionModal from '../SharePositionModal';

const SharePosition: React.FC<{
    position: UserPosition | UserChainedPosition;
    isDisabled?: boolean;
    isOpen?: boolean;
    isChained?: boolean;
    onClose?: React.Dispatch<void>;
}> = ({ position, isDisabled, isOpen, isChained, onClose }) => {
    const theme: ThemeInterface = useTheme();

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);
    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(isOpen);

    useInterval(() => {
        // when becomes matured
        if (Date.now() > position.maturityDate) {
            if (!isMatured) {
                setIsMatured(true);
            }
        }
    }, secondsToMilliseconds(10));

    // when new position is added, refresh maturity status
    useEffect(() => {
        setIsMatured(Date.now() > position.maturityDate);
    }, [position.maturityDate]);

    useEffect(() => {
        if (isOpen) {
            setOpenTwitterShareModal(isOpen);
        }
    }, [isOpen]);

    const displayShare = isChained
        ? (position as UserChainedPosition).canResolve || (position as UserChainedPosition).isResolved
        : true;

    const historyStatus = position.isResolved
        ? getHistoryStatus(
              isChained ? (position as UserHistoryPosition) : mapUserPositionToHistory(position as UserPosition)
          )
        : undefined;
    const iconColor = historyStatus && getStatusColor(historyStatus, theme);

    const singleWinStatus = !isChained
        ? isUserWinner(
              (position as UserPosition).side,
              (position as UserPosition).strikePrice,
              (position as UserPosition).finalPrice
          )
        : undefined;

    return (
        <>
            {displayShare && (
                <ShareIcon
                    className="icon icon--share"
                    $color={iconColor}
                    $disabled={!!isDisabled}
                    onClick={() => !isDisabled && setOpenTwitterShareModal(true)}
                />
            )}
            {openTwitterShareModal &&
                (isChained ? (
                    <SharePositionModal
                        type={
                            position.isClaimable || (position as UserChainedPosition).isUserWinner
                                ? 'chained-speed-won'
                                : 'chained-speed-loss'
                        }
                        positions={(position as UserChainedPosition).sides}
                        currencyKey={position.currencyKey}
                        strikePrices={(position as UserChainedPosition).strikePrices}
                        finalPrices={(position as UserChainedPosition).finalPrices}
                        buyIn={position.paid}
                        payout={position.payout}
                        onClose={() => setOpenTwitterShareModal(false)}
                    />
                ) : (
                    <SharePositionModal
                        type={
                            singleWinStatus === undefined
                                ? 'speed-potential'
                                : singleWinStatus
                                ? 'speed-won'
                                : 'speed-loss'
                        }
                        positions={[(position as UserPosition).side]}
                        currencyKey={position.currencyKey}
                        strikePrices={[(position as UserPosition).strikePrice]}
                        buyIn={position.paid}
                        payout={position.payout}
                        marketDuration={formattedDurationFull(
                            intervalToDuration({ start: position.createdAt, end: position.maturityDate })
                        )}
                        onClose={() => {
                            setOpenTwitterShareModal(false);
                            onClose && onClose();
                        }}
                    />
                ))}
        </>
    );
};

const ShareIcon = styled.i<{ $color?: string; $disabled: boolean }>`
    color: ${(props) => (props.$color ? props.$color : props.theme.textColor.primary)};
    cursor: ${(props) => (props.$disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.$disabled ? '0.5' : '1')};
    font-size: 20px;
    text-transform: none;
`;

export default SharePosition;
