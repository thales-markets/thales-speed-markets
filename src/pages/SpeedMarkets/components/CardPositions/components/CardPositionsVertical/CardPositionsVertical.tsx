import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { UserChainedPosition, UserPosition } from 'types/market';
import CardChainedPosition from '../CardChainedPosition';
import CardPosition from '../CardPosition';

const CardPositionsVertical: React.FC<{ positions: (UserPosition | UserChainedPosition)[]; isChained?: boolean }> = ({
    positions,
    isChained,
}) => {
    return (
        <Container>
            {positions.map((position, index) =>
                isChained ? (
                    <CardChainedPosition key={index} position={position as UserChainedPosition} />
                ) : (
                    <CardPosition key={index} position={position as UserPosition} />
                )
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 100%;
    gap: 5px;
`;

export default CardPositionsVertical;
