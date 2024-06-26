import SPAAnchor from 'components/SPAAnchor';
import SearchInput from 'components/SearchInput';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { MARKET_DURATION_IN_DAYS } from 'constants/market';
import { SUPPORTED_ASSETS } from 'constants/pyth';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import MobileMenu from 'layouts/DappLayout/components/MobileMenu';
import UserOpenPositions from 'pages/SpeedMarkets/components/UserOpenPositions';
import { LinkContainer, LinkWrapper, NavigationIcon } from 'pages/SpeedMarketsOverview/SpeedMarketsOverview';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getUserNotifications } from 'redux/modules/user';
import { FlexDivEnd } from 'styles/common';
import { RootState } from 'types/ui';
import { getCurrentPrices, getPriceConnection, getPriceId, getSupportedAssetsAsObject } from 'utils/pyth';
import { buildHref, history } from 'utils/routes';
import { useChainId, useClient } from 'wagmi';
import ProfileHeader from './components/ProfileHeader';
import UserHistoricalPositions from './components/UserHistoricalPositions';
import {
    Container,
    Header,
    Notification,
    PositionsWrapper,
    Tab,
    TabSection,
    TabSectionSubtitle,
    TabSectionTitle,
    Tabs,
} from './styled-components';
import TotalBalance from 'components/TotalBalance';

enum TabItems {
    MY_POSITIONS = 'my-positions',
    HISTORY = 'history',
}

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const networkId = useChainId();
    const client = useClient();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const userNotifications = useSelector((state: RootState) => getUserNotifications(state));

    const [isChainedClaimable, setIsChainedClaimable] = useState(false);
    const [isChainedOpen, setIsChainedOpen] = useState(false);
    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());
    const [positionsSize, setPositionsSize] = useState(0);
    const [searchAddress, setSearchAddress] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, undefined, {
        enabled: isAppReady,
    });

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const queryParamTab = queryString.parse(location.search).tab as TabItems;
    const [selectedTab, setSelectedTab] = useState(
        Object.values(TabItems).includes(queryParamTab) ? queryParamTab : TabItems.MY_POSITIONS
    );

    const priceConnection = useMemo(() => getPriceConnection(networkId), [networkId]);

    // Refresh current prices
    useInterval(async () => {
        const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkId, asset));
        const prices: typeof currentPrices = await getCurrentPrices(priceConnection, networkId, priceIds);
        setCurrentPrices({
            ...currentPrices,
            [CRYPTO_CURRENCY_MAP.BTC]: prices[CRYPTO_CURRENCY_MAP.BTC],
            [CRYPTO_CURRENCY_MAP.ETH]: prices[CRYPTO_CURRENCY_MAP.ETH],
        });
    }, secondsToMilliseconds(10));

    useEffect(() => {
        if (searchText.startsWith('0x') && searchText?.length == 42) {
            setSearchAddress(searchText.toLowerCase());
        } else {
            setSearchAddress('');
        }
    }, [searchText]);

    const onTabClickHandler = (tab: TabItems) => {
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({ tab }),
        });
        setSelectedTab(tab);
    };

    const totalNotifications = userNotifications.single + userNotifications.chained;

    return (
        <Container>
            <LinkContainer>
                <SPAAnchor href={`${buildHref(ROUTES.Markets.SpeedMarkets)}`}>
                    <LinkWrapper>
                        <NavigationIcon isLeft className={`icon icon--arrow`} />
                        {t('speed-markets.title')}
                    </LinkWrapper>
                </SPAAnchor>
                &nbsp;/&nbsp;{t('profile.title')}
            </LinkContainer>

            <Header>
                <ProfileHeader />
                <TotalBalance />
            </Header>

            <PositionsWrapper>
                <Tabs>
                    <Tab
                        onClick={() => onTabClickHandler(TabItems.MY_POSITIONS)}
                        $active={selectedTab === TabItems.MY_POSITIONS}
                    >
                        {t('profile.tabs.my-positions')}
                        {totalNotifications > 0 && (
                            <Notification $isSelected={selectedTab === TabItems.MY_POSITIONS}>
                                {totalNotifications}
                            </Notification>
                        )}
                    </Tab>
                    <Tab onClick={() => onTabClickHandler(TabItems.HISTORY)} $active={selectedTab === TabItems.HISTORY}>
                        {t('profile.tabs.history')}
                    </Tab>
                </Tabs>

                <FlexDivEnd>
                    <SearchInput
                        placeholder={t('profile.search-placeholder')}
                        text={searchText}
                        handleChange={(value) => setSearchText(value)}
                        width={isMobile ? '100%' : '470px'}
                        height={'40px'}
                    />
                </FlexDivEnd>

                {selectedTab === TabItems.MY_POSITIONS && (
                    <>
                        {/* CLAIMABLE */}
                        <TabSectionTitle>{t('profile.accordions.claimable-positions')}</TabSectionTitle>
                        <TabSection $isEmpty={totalNotifications === 0}>
                            <UserOpenPositions
                                showOnlyClaimable
                                showFilter
                                isChained={isChainedClaimable}
                                currentPrices={currentPrices}
                                maxPriceDelayForResolvingSec={ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec}
                                searchAddress={searchAddress}
                                onChainedSelectedChange={setIsChainedClaimable}
                                isMobileHorizontal
                            />
                        </TabSection>
                        {/* OPEN */}
                        <TabSectionTitle>{t('profile.accordions.open-positions')}</TabSectionTitle>
                        <TabSection $isEmpty={positionsSize === 0}>
                            <UserOpenPositions
                                showOnlyOpen
                                showFilter
                                isChained={isChainedOpen}
                                currentPrices={currentPrices}
                                maxPriceDelayForResolvingSec={ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec}
                                searchAddress={searchAddress}
                                setNumberOfPositions={setPositionsSize}
                                onChainedSelectedChange={setIsChainedOpen}
                                isMobileHorizontal
                            />
                        </TabSection>
                    </>
                )}
                {selectedTab === TabItems.HISTORY && (
                    <>
                        <TabSectionTitle>
                            {t('profile.accordions.transaction-history')}
                            <br />
                            <TabSectionSubtitle>
                                {t('profile.history-limit', { days: MARKET_DURATION_IN_DAYS })}
                            </TabSectionSubtitle>
                        </TabSectionTitle>
                        <TabSection $isEmpty={false}>
                            <UserHistoricalPositions
                                currentPrices={currentPrices}
                                searchAddress={searchAddress}
                                setNumberOfPositions={setPositionsSize}
                            />
                        </TabSection>
                    </>
                )}
            </PositionsWrapper>
            <MobileMenu />
        </Container>
    );
};

export default Profile;
