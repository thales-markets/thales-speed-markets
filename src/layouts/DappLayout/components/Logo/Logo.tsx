import React from 'react';
import styled from 'styled-components';
import ROUTES from 'constants/routes';

import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'types/ui';
import { getIsMobile } from 'redux/modules/ui';
import { ScreenSizeBreakpoint } from 'enums/ui';

const Logo: React.FC = () => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    return (
        <Container>
            <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                <LogoIcon className={`icon-home  icon-home--speed-${isMobile ? 'small' : 'full'}-logo`} />
            </SPAAnchor>
        </Container>
    );
};

const Container = styled.div``;

const LogoIcon = styled.i`
    font-size: 125px;
    line-height: 40px;
    margin: 3px 10px -5px 0;
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 40px;
        line-height: 40px;
        margin: 10px 0 -5px 0;
    }
`;

export default Logo;
