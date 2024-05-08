import React from 'react';
import styled from 'styled-components';
import ROUTES from 'constants/routes';

import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';

const Logo: React.FC = () => (
    <Container>
        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
            <LogoIcon className="icon-home  icon-home--speed-full-logo" />
        </SPAAnchor>
    </Container>
);

const Container = styled.div``;

const LogoIcon = styled.i`
    font-size: 125px;
    line-height: 50px;
    margin-right: 10px;
`;

export default Logo;
