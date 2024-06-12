import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import MobileMenu from 'layouts/DappLayout/components/MobileMenu';
import queryString from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { getSupportedNetworksByRoute } from 'utils/network';
import { buildHref } from 'utils/routes';
import { useChainId } from 'wagmi';
import OpenChainedPositions from './components/OpenChainedPositions';
import OpenPositions from './components/OpenPositions';

const SpeedMarketsOverview: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const networkId = useChainId();

    const isChainedSupported = getSupportedNetworksByRoute(ROUTES.Markets.ChainedSpeedMarkets).includes(networkId);
    const isChainedMarkets = isChainedSupported && queryString.parse(location.search).isChained === 'true';

    return (
        <Container>
            <Header>
                <LinkContainer>
                    <SPAAnchor href={`${buildHref(ROUTES.Markets.SpeedMarkets)}?isChained=${isChainedMarkets}`}>
                        <LinkWrapper>
                            <NavigationIcon isLeft className={`icon icon--left`} />
                            {isChainedMarkets ? t('speed-markets.chained.name') : t('speed-markets.title')}
                        </LinkWrapper>
                    </SPAAnchor>
                    &nbsp;/&nbsp;{t(`speed-markets.overview.title`)}
                </LinkContainer>
                {isChainedSupported && (
                    <LinkContainer>
                        {t(`speed-markets.overview.title`)}&nbsp;/&nbsp;
                        <SPAAnchor
                            href={`${buildHref(ROUTES.Markets.SpeedMarketsOverview)}?isChained=${!isChainedMarkets}`}
                        >
                            <LinkWrapper>
                                {isChainedMarkets ? t('speed-markets.title') : t('speed-markets.chained.name')}
                                <NavigationIcon isLeft={false} className={`icon icon--right`} />
                            </LinkWrapper>
                        </SPAAnchor>
                    </LinkContainer>
                )}
            </Header>
            {isChainedMarkets ? <OpenChainedPositions /> : <OpenPositions />}
            <MobileMenu />
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
`;

const Header = styled(FlexDivRow)`
    font-size: 18px;
    line-height: 100%;
    width: 100%;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

export const LinkContainer = styled.div`
    font-size: 18px;
    font-weight: 800;
    color: ${(props) => props.theme.link.textColor.secondary};
    text-transform: uppercase;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

export const LinkWrapper = styled.span`
    :hover {
        text-decoration: underline;
    }
`;

export const NavigationIcon = styled.i<{ isLeft: boolean }>`
    position: relative;
    top: -1px;
    ${(props) => (props.isLeft ? 'margin-right: 6px;' : 'margin-left: 6px;')}
    text-transform: none;
`;

export default SpeedMarketsOverview;
