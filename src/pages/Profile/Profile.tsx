import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import SPAAnchor from 'components/SPAAnchor';
import SearchInput from 'components/SearchInput';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { CONNECTION_TIMEOUT_MS, SUPPORTED_ASSETS } from 'constants/pyth';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import UserOpenPositions from 'pages/SpeedMarkets/components/UserOpenPositions';
import { LinkContainer, LinkWrapper, NavigationIcon } from 'pages/SpeedMarketsOverview/SpeedMarketsOverview';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'types/ui';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint, getSupportedAssetsAsObject } from 'utils/pyth';
import { buildHref, history } from 'utils/routes';
import { useChainId, useClient } from 'wagmi';
import TransactionHistory from './components/TransactionHistory';
import {
    Container,
    Header,
    Notification,
    PositionsWrapper,
    Tab,
    TabSection,
    TabTitle,
    Tabs,
} from './styled-components';

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

    const [isChainedClaimable, setIsChainedClaimable] = useState(false);
    const [isChainedOpen, setIsChainedOpen] = useState(false);
    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [searchAddress, setSearchAddress] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, undefined, {
        enabled: isAppReady,
    });

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const queryParamTab = queryString.parse(location.search).tab as TabItems;
    const [view, setView] = useState(
        Object.values(TabItems).includes(queryParamTab) ? queryParamTab : TabItems.MY_POSITIONS
    );

    const priceConnection = useMemo(() => {
        return new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), { timeout: CONNECTION_TIMEOUT_MS });
    }, [networkId]);

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
        setView(tab);
    };

    return (
        <Container>
            <LinkContainer>
                <SPAAnchor href={`${buildHref(ROUTES.Markets.SpeedMarkets)}`}>
                    <LinkWrapper>
                        <NavigationIcon isLeft className={`icon icon--left`} />
                        {t('speed-markets.title')}
                    </LinkWrapper>
                </SPAAnchor>
                &nbsp;/&nbsp;{t('profile.title')}
            </LinkContainer>

            <Header>{'TODO: add profile header'}</Header>
            <SearchInput
                placeholder={t('profile.search-placeholder')}
                text={searchText}
                handleChange={(value) => setSearchText(value)}
                width="300px"
                height="28px"
                iconTop="6px"
            />

            <PositionsWrapper>
                <Tabs>
                    <Tab
                        onClick={() => onTabClickHandler(TabItems.MY_POSITIONS)}
                        $active={view === TabItems.MY_POSITIONS}
                    >
                        {t('profile.tabs.my-positions')}
                        {totalNotifications > 0 && <Notification>{totalNotifications}</Notification>}
                    </Tab>
                    <Tab onClick={() => onTabClickHandler(TabItems.HISTORY)} $active={view === TabItems.HISTORY}>
                        {t('profile.tabs.history')}
                    </Tab>
                </Tabs>

                {view === TabItems.MY_POSITIONS && (
                    <>
                        {/* CLAIMABLE */}
                        <TabTitle>{t('profile.accordions.claimable-positions')}</TabTitle>
                        <TabSection>
                            <UserOpenPositions
                                showOnlyClaimable
                                showFilter
                                isChained={isChainedClaimable}
                                currentPrices={currentPrices}
                                maxPriceDelayForResolvingSec={ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec}
                                searchAddress={searchAddress}
                                setClaimablePositions={setTotalNotifications}
                                onChainedSelectedChange={setIsChainedClaimable}
                            />
                        </TabSection>
                        {/* OPEN */}
                        <TabTitle>{t('profile.accordions.open-positions')}</TabTitle>
                        <TabSection>
                            <UserOpenPositions
                                showOnlyOpen
                                showFilter
                                isChained={isChainedOpen}
                                currentPrices={currentPrices}
                                maxPriceDelayForResolvingSec={ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec}
                                searchAddress={searchAddress}
                                setClaimablePositions={setTotalNotifications}
                                onChainedSelectedChange={setIsChainedOpen}
                            />
                        </TabSection>
                    </>
                )}
                {view === TabItems.HISTORY && (
                    <>
                        {/* TODO: t('profile.accordions.transaction-history') */}
                        <TransactionHistory
                            searchAddress={searchAddress}
                            searchText={searchAddress ? '' : searchText}
                        />
                    </>
                )}
            </PositionsWrapper>
        </Container>
    );
};

export default Profile;
