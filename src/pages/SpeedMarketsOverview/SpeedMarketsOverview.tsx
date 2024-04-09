import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import queryString from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getSupportedNetworksByRoute } from 'utils/network';
import { buildHref } from 'utils/routes';
import UnresolvedChainedPositions from './components/UnresolvedChainedPositions';
import UnresolvedPositions from './components/UnresolvedPositions';
import { Container, Header, LinkContainer, NavigationIcon } from './styled-components';
import { useChainId } from 'wagmi';

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
            {isChainedMarkets ? <UnresolvedChainedPositions /> : <UnresolvedPositions />}
        </Container>
    );
};

export default SpeedMarketsOverview;
