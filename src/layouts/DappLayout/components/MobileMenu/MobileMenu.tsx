import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { navigateTo } from 'utils/routes';

const MobileMenu: React.FC<{ onChartClick?: () => void }> = ({ onChartClick }) => {
    const { t } = useTranslation();
    const location = useLocation();

    const isSpeedMarkets = ROUTES.Markets.SpeedMarkets === location.pathname;
    const isOverview = ROUTES.Markets.SpeedMarketsOverview === location.pathname;
    const isProfile = ROUTES.Markets.Profile === location.pathname;

    return (
        <Container>
            <Items>
                {isSpeedMarkets && (
                    <Item onClick={onChartClick}>
                        <Icon className="icon icon--market" />
                        {t('common.chart')}
                    </Item>
                )}
                <Item
                    onClick={() => navigateTo(isOverview ? ROUTES.Markets.Home : ROUTES.Markets.SpeedMarketsOverview)}
                >
                    {isOverview ? t('common.home') : t('speed-markets.overview.title')}
                </Item>
                <Item onClick={() => navigateTo(isProfile ? ROUTES.Markets.Home : ROUTES.Markets.Profile)}>
                    {isProfile ? t('common.home') : t('profile.title')}
                </Item>
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
