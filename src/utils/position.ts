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

export const getHistoryStatus = (position: UserHistoryPosition) => {
    let status = HistoryStatus.OPEN;

    if (position.isResolved) {
        status = position.isUserWinner ? HistoryStatus.WON : HistoryStatus.LOSS;
    } else {
        status = position.isClaimable ? HistoryStatus.CLAIMABLE : HistoryStatus.OPEN;
    }

    return status;
};
