import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
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
                <div>
                    <SPAAnchor href={`${buildHref(ROUTES.Markets.SpeedMarkets)}?isChained=${isChainedMarkets}`}>
                        <LinkContainer>
                            <NavigationIcon isLeft className={`icon icon--left`} />
                            {isChainedMarkets ? t('speed-markets.chained.name') : t('speed-markets.title')}
                        </LinkContainer>
                    </SPAAnchor>
                    &nbsp;/&nbsp;{t(`speed-markets.overview.title`)}
                </div>
                {isChainedSupported && (
                    <div>
                        {t(`speed-markets.overview.title`)}&nbsp;/&nbsp;
                        <SPAAnchor
                            href={`${buildHref(ROUTES.Markets.SpeedMarketsOverview)}?isChained=${!isChainedMarkets}`}
                        >
                            <LinkContainer>
                                {isChainedMarkets ? t('speed-markets.title') : t('speed-markets.chained.name')}
                                <NavigationIcon isLeft={false} className={`icon icon--right`} />
                            </LinkContainer>
                        </SPAAnchor>
                    </div>
                )}
            </Header>
            {isChainedMarkets ? <OpenChainedPositions /> : <OpenPositions />}
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

const LinkContainer = styled.span`
    :hover {
        text-decoration: underline;
    }
`;

const NavigationIcon = styled.i<{ isLeft: boolean }>`
    font-weight: 400;
    font-size: 20px;
    ${(props) => (props.isLeft ? 'margin-right: 6px;' : 'margin-left: 6px;')}
    top: -1px;
    position: relative;
`;

export default SpeedMarketsOverview;
