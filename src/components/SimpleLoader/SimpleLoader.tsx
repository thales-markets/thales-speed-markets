import React from 'react';
import styled from 'styled-components';

const SimpleLoader: React.FC = () => {
    return <StyledLoader />;
};

const StyledLoader = styled.div`
    position: absolute;
    left: calc(50% - 22px);
    top: calc(50% - 22px);
    &.MuiCircularProgress-colorPrimary {
        color: ${(props) => props.theme.background.quaternary};
    }
`;

export default SimpleLoader;
