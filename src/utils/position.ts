import { HistoryStatus } from 'enums/market';
import { UserChainedPosition, UserPosition } from 'types/market';
import { UserHistoryPosition } from 'types/profile';
import { isUserWinner } from './speedAmm';

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
        collateralAddress: userPosition.collateralAddress,
        isDefaultCollateral: userPosition.isDefaultCollateral,
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
        collateralAddress: userHistory.collateralAddress,
        isDefaultCollateral: userHistory.isDefaultCollateral,
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

export const getChainedEndTime = (position: UserChainedPosition) => {
    const strikeTimeIndex = position.strikeTimes.findIndex((t) => t > Date.now());

    return position.resolveIndex !== undefined
        ? position.strikeTimes[position.resolveIndex]
        : strikeTimeIndex > -1
        ? position.strikeTimes[strikeTimeIndex]
        : position.maturityDate;
};

export const sortSpeedMarkets = (positions: (UserPosition | UserChainedPosition)[]) =>
    positions
        // 1. sort open by maturity asc
        .filter((position) => position.maturityDate > Date.now())
        .sort((a, b) => a.maturityDate - b.maturityDate)
        .concat(
            // 2. sort claimable by maturity desc
            positions.filter((position) => position.isClaimable).sort((a, b) => b.maturityDate - a.maturityDate)
        )
        .concat(
            positions
                // 3. sort lost by maturity desc
                .filter((position) => position.maturityDate < Date.now() && !position.isClaimable)
                .sort((a, b) => b.maturityDate - a.maturityDate)
        );

export const tableSortByEndTime = (rowA: any, rowB: any) => {
    const aEndTime = rowA.original.sides !== undefined ? getChainedEndTime(rowA.original) : rowA.original.maturityDate;
    const bEndTime = rowB.original.sides !== undefined ? getChainedEndTime(rowB.original) : rowB.original.maturityDate;
    return aEndTime < bEndTime ? -1 : aEndTime > bEndTime ? 1 : 0;
};

export const tableSortByStatus = (rowA: any, rowB: any) => {
    const aStatus = getHistoryStatus(
        rowA.original.sides !== undefined ? rowA.original : mapUserPositionToHistory(rowA.original)
    );
    const bStatus = getHistoryStatus(
        rowB.original.sides !== undefined ? rowB.original : mapUserPositionToHistory(rowB.original)
    );
    if (
        (aStatus === HistoryStatus.OPEN && bStatus !== HistoryStatus.OPEN) ||
        (aStatus === HistoryStatus.CLAIMABLE && [HistoryStatus.WON, HistoryStatus.LOSS].includes(bStatus)) ||
        (aStatus === HistoryStatus.WON && bStatus === HistoryStatus.LOSS)
    ) {
        return -1;
    }
    if (
        (aStatus === HistoryStatus.CLAIMABLE && bStatus === HistoryStatus.OPEN) ||
        (aStatus === HistoryStatus.WON && [HistoryStatus.OPEN, HistoryStatus.CLAIMABLE].includes(bStatus)) ||
        (aStatus === HistoryStatus.LOSS && bStatus !== HistoryStatus.LOSS)
    ) {
        return 1;
    }
    return 0;
};
