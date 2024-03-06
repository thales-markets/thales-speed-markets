import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type InlineLoaderProps = {
    thickness?: number;
    size?: number;
};

const InlineLoader: React.FC<InlineLoaderProps> = ({ thickness, size }) => {
    console.log(thickness, size);
    return <LoaderContainer></LoaderContainer>;
};

const LoaderContainer = styled(FlexDivCentered)`
    color: ${(props) => props.theme.background.tertiary};
    margin-bottom: 2px;
`;

export default InlineLoader;
