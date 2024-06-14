import { UserPosition } from 'types/market';
import { UserHistoryPosition } from 'types/profile';
import { isUserWinner } from './speedAmm';
import { HistoryStatus } from 'enums/market';

export const mapUserPositionToHistory = (userPosition: UserPosition): UserHistoryPosition => {
    const isMatured = userPosition.maturityDate < Date.now();

    return {
        user: userPosition.user,
        market: userPosition.market,
        currencyKey: userPosition.currencyKey,
        sides: [userPosition.side],
        strikePrices: [userPosition.strikePrice],
        strikeTimes: [userPosition.maturityDate],
        maturityDate: userPosition.maturityDate,
        paid: userPosition.paid,
        payout: userPosition.payout,
        payoutMultiplier: 0,
        currentPrice: userPosition.currentPrice,
        finalPrices: [userPosition.finalPrice],
        canResolve: userPosition.isResolved ? false : isMatured && userPosition.finalPrice,
        isMatured,
        isClaimable: userPosition.isClaimable,
        isUserWinner: isUserWinner(userPosition.side, userPosition.strikePrice, userPosition.finalPrice),
        isResolved: userPosition.isResolved,
        createdAt: userPosition.createdAt,
    } as UserHistoryPosition;
};

export const mapUserHistoryToPosition = (userHistory: UserHistoryPosition): UserPosition =>
    ({
        user: userHistory.user,
        market: userHistory.market,
        currencyKey: userHistory.currencyKey,
        side: userHistory.sides[0],
        strikePrice: userHistory.strikePrices[0],
        maturityDate: userHistory.maturityDate,
        paid: userHistory.paid,
        payout: userHistory.payout,
        currentPrice: userHistory.currentPrice,
        finalPrice: userHistory.finalPrices[0],
        isMatured: userHistory.isMatured,
        isClaimable: userHistory.isClaimable,
        isResolved: userHistory.isResolved,
        createdAt: userHistory.createdAt,
    } as UserPosition);

export const getHistoryStatus = (position: UserHistoryPosition) => {
    let status = HistoryStatus.OPEN;

    const isChained = position.sides.length > 1;

    if (position.isResolved) {
        status = position.isUserWinner ? HistoryStatus.WON : HistoryStatus.LOSS;
    } else if (position.maturityDate < Date.now()) {
        if (isChained) {
            status = position.isClaimable
                ? HistoryStatus.CLAIMABLE
                : position.canResolve
                ? HistoryStatus.LOSS
                : HistoryStatus.OPEN;
        } else {
            status = position.isClaimable
                ? HistoryStatus.CLAIMABLE
                : position.finalPrices[0] > 0
                ? HistoryStatus.LOSS
                : HistoryStatus.OPEN;
        }
    } else {
        status = HistoryStatus.OPEN;
    }

    return status;
};
