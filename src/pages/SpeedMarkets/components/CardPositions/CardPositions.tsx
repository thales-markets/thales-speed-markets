import { UserChainedPosition, UserPosition } from 'types/market';
import CardPositionsHorizontal from './components/CardPositionsHorizontal';
import CardPositionsVertical from './components/CardPositionsVertical';
import { UserHistoryPosition } from 'types/profile';

type CardPositionsProps = {
    isHorizontal: boolean;
    positions: (UserPosition | UserChainedPosition | UserHistoryPosition)[];
    isChained?: boolean;
    isMixedPositions?: boolean; // single and chained
    maxPriceDelayForResolvingSec?: number;
    isOverview?: boolean;
    isHistory?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
};

const CardPositions: React.FC<CardPositionsProps> = ({
    isHorizontal,
    positions,
    isChained,
    isMixedPositions,
    maxPriceDelayForResolvingSec,
    isOverview,
    isHistory,
    isAdmin,
    isSubmittingBatch,
}) => {
    return isHorizontal ? (
        <CardPositionsHorizontal
            positions={positions}
            isChained={isChained}
            isMixedPositions={isMixedPositions}
            maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
            isOverview={isOverview}
            isHistory={isHistory}
            isAdmin={isAdmin}
            isSubmittingBatch={isSubmittingBatch}
        />
    ) : (
        <CardPositionsVertical positions={positions} isChained={isChained} />
    );
};

export default CardPositions;
