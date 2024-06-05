import { UserChainedPosition, UserPosition } from 'types/market';
import CardPositionsHorizontal from './components/CardPositionsHorizontal';
import CardPositionsVertical from './components/CardPositionsVertical';

type CardPositionsProps = {
    isHorizontal: boolean;
    positions: (UserPosition | UserChainedPosition)[];
    isChained?: boolean;
    maxPriceDelayForResolvingSec?: number;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
};

const CardPositions: React.FC<CardPositionsProps> = ({
    isHorizontal,
    positions,
    isChained,
    maxPriceDelayForResolvingSec,
    isAdmin,
    isSubmittingBatch,
}) => {
    return isHorizontal ? (
        <CardPositionsHorizontal
            positions={positions}
            isChained={isChained}
            maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
            isAdmin={isAdmin}
            isSubmittingBatch={isSubmittingBatch}
        />
    ) : (
        <CardPositionsVertical positions={positions} isChained={isChained} />
    );
};

export default CardPositions;
