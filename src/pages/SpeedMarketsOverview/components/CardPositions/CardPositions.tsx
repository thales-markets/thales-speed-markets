import CardChainedPosition from 'pages/SpeedMarkets/components/CardPositions/CardChainedPosition';
import CardPosition from 'pages/SpeedMarkets/components/CardPositions/CardPosition';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { UserChainedPosition, UserPosition } from 'types/market';

const CardPositions: React.FC<{ positions: (UserPosition | UserChainedPosition)[]; isChained?: boolean }> = ({
    positions,
    isChained,
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
                {positions.map((position, index) =>
                    isChained ? (
                        <CardChainedPosition
                            key={index}
                            position={position as UserChainedPosition}
                            onVisibilityChange={(isVisible: boolean) => onVisibilityChange(index, isVisible)}
                        />
                    ) : (
                        <CardPosition
                            key={index}
                            position={position as UserPosition}
                            onVisibilityChange={(isVisible: boolean) => onVisibilityChange(index, isVisible)}
                        />
                    )
                )}
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
    color: ${(props) => props.theme.icon.textColor.tertiary};
`;

const IconLeft = styled(Icon)`
    transform: rotate(180deg);
    left: -5px;
`;

const IconRight = styled(Icon)`
    right: -5px;
`;

export default CardPositions;
