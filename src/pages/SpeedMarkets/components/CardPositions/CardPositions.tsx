import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { UserOpenPositions } from 'types/market';
import CardPosition from './CardPosition/CardPosition';

const CardPositions: React.FC<{ data: UserOpenPositions[]; currentPrices?: { [key: string]: number } }> = ({
    data,
    currentPrices,
}) => {
    return (
        <Container>
            {data.map((position, index) => (
                <CardPosition key={index} position={position} currentPrices={currentPrices} />
            ))}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 100%;
    gap: 5px;
`;

export default CardPositions;
