import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { getSupportedNetworksByRoute } from 'utils/network';
import { navigateTo } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';

const MobileMenu: React.FC<{ onChartClick?: () => void }> = ({ onChartClick }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const networkId = useChainId();
    const { isConnected } = useAccount();

    const isSpeedMarkets = ROUTES.Markets.SpeedMarkets === location.pathname;
    const isOverview = ROUTES.Markets.SpeedMarketsOverview === location.pathname;
    const isProfile = ROUTES.Markets.Profile === location.pathname;

    const isChainedSupported = getSupportedNetworksByRoute(ROUTES.Markets.ChainedSpeedMarkets).includes(networkId);
    const isChainedMarkets = isChainedSupported && queryString.parse(location.search).isChained === 'true';

    return (
        <Container>
            <Items>
                <Item onClick={isSpeedMarkets ? onChartClick : () => navigateTo(ROUTES.Markets.Home)}>
                    {isSpeedMarkets && <Icon className="icon icon--market" />}
                    {isSpeedMarkets ? t('common.chart') : t('common.home')}
                </Item>
                {!isOverview && (
                    <Item
                        onClick={() =>
                            navigateTo(`${ROUTES.Markets.SpeedMarketsOverview}?isChained=${isChainedMarkets}`)
                        }
                    >
                        {t('speed-markets.overview.title')}
                    </Item>
                )}
                {isConnected && !isProfile && (
                    <Item onClick={() => navigateTo(ROUTES.Markets.Profile)}>{t('profile.title')}</Item>
                )}
            </Items>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    display: none;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: flex;
    }
`;

const Items = styled.div`
    display: flex;
    position: fixed;
    align-items: center;
    justify-content: space-around;
    bottom: 24px;
    width: calc(100% - 20px);
    max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px;
    height: 40px;
    background: ${(props) => props.theme.background.secondary};
    box-shadow: 0px 0px 40px 10px ${(props) => props.theme.background.primary};
    border-radius: 30px;
    z-index: 9;
`;

const Item = styled(FlexDivCentered)`
    min-width: 115px;
    font-size: 14px;
    font-weight: 800;
    line-height: 16px;
    color: ${(props) => props.theme.button.textColor.secondary};
    text-transform: uppercase;
`;

const Icon = styled.i`
    color: ${(props) => props.theme.button.textColor.secondary};
    margin-right: 5px;
`;

export default MobileMenu;
