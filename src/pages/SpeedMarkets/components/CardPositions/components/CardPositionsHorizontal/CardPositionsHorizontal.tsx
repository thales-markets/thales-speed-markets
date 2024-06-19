import CardChainedPosition from 'pages/SpeedMarkets/components/CardPositions/components/CardChainedPosition';
import CardPosition from 'pages/SpeedMarkets/components/CardPositions/components/CardPosition';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { UserChainedPosition, UserPosition } from 'types/market';
import { UserHistoryPosition } from 'types/profile';
import { mapUserHistoryToPosition } from 'utils/position';

type CardPositionsHorizontalProps = {
    positions: (UserPosition | UserChainedPosition | UserHistoryPosition)[];
    isChained?: boolean;
    isMixedPositions?: boolean; // single and chained
    maxPriceDelayForResolvingSec?: number;
    isOverview?: boolean;
    isHistory?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
};

const CardPositionsHorizontal: React.FC<CardPositionsHorizontalProps> = ({
    positions,
    isChained,
    isMixedPositions,
    maxPriceDelayForResolvingSec,
    isOverview,
    isHistory,
    isAdmin,
    isSubmittingBatch,
}) => {
    const [isFirstCardVisible, setIsFirstCardVisible] = useState(true);
    const [isLastCardVisible, setIsLastCardVisible] = useState(false);

    const onVisibilityChange = (index: number, isVisible: boolean) =>
        index === 0
            ? setIsFirstCardVisible(isVisible)
            : index === positions.length - 1
            ? setIsLastCardVisible(isVisible)
            : undefined;

    return (
        <Container>
            {positions.length > 1 && !isFirstCardVisible && <IconLeft className="icon icon--arrow-right" />}
            <PositionsWrapper>
                {positions.map((position, index) => {
                    const isChainedType =
                        isMixedPositions && (position as UserChainedPosition).sides
                            ? (position as UserChainedPosition).sides.length > 1
                            : false;

                    return isChained || isChainedType ? (
                        <CardChainedPosition
                            key={index}
                            position={position as UserChainedPosition}
                            maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                            isOverview={isOverview}
                            isHistory={isHistory}
                            isAdmin={isAdmin}
                            isSubmittingBatch={isSubmittingBatch}
                            onVisibilityChange={(isVisible: boolean) => onVisibilityChange(index, isVisible)}
                        />
                    ) : (
                        <CardPosition
                            key={index}
                            position={
                                isHistory
                                    ? mapUserHistoryToPosition(position as UserHistoryPosition)
                                    : (position as UserPosition)
                            }
                            maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                            isOverview={isOverview}
                            isHistory={isHistory}
                            isAdmin={isAdmin}
                            isSubmittingBatch={isSubmittingBatch}
                            onVisibilityChange={(isVisible: boolean) => onVisibilityChange(index, isVisible)}
                        />
                    );
                })}
            </PositionsWrapper>
            {positions.length > 1 && !isLastCardVisible && <IconRight className="icon icon--arrow-right" />}
        </Container>
    );
};

const Container = styled(FlexDivRow)`
    padding: 0 5px;
`;

const PositionsWrapper = styled(FlexDivRow)`
    width: 100%;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
`;

const Icon = styled.i`
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
    font-size: 24px;
    line-height: 100%;
    width: 15px;
    height: 24px;
    color: ${(props) => props.theme.icon.textColor.primary};
`;

const IconLeft = styled(Icon)`
    transform: rotate(180deg);
    left: -5px;
`;

const IconRight = styled(Icon)`
    right: -5px;
`;

export default CardPositionsHorizontal;
