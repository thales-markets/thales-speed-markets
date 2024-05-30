import SearchInput from 'components/SearchInput';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds } from 'date-fns';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useProfileDataQuery from 'queries/profile/useProfileDataQuery';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, formatPercentage } from 'thales-utils';
import { UserProfileData } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getPriceId } from 'utils/pyth';
import { history } from 'utils/routes';
import { isUserWinner } from 'utils/speedAmm';
import { useAccount, useChainId, useClient } from 'wagmi';
import { MARKET_DURATION_IN_DAYS } from '../../constants/market';
import ClaimablePositions from './components/ClaimablePositions';
import OpenPositions from './components/OpenPositions';
import ProfileSection from './components/ProfileSection';
import TransactionHistory from './components/TransactionHistory';
import {
    Container,
    Header,
    MainContainer,
    Nav,
    NavItem,
    Notification,
    StatsContainer,
    StatsItem,
    StatsLabel,
    StatsValue,
    Title,
} from './styled-components';

enum NavItems {
    MyPositions = 'my-positions',
    History = 'history',
}

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { address: walletAddress, isConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [searchAddress, setSearchAddress] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
        {
            enabled: isAppReady && isConnected,
        }
    );
    const speedMarketsNotifications =
        userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data
            ? userActiveSpeedMarketsDataQuery.data.filter((marketData) => marketData.isClaimable).length
            : 0;

    const userActiveChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
        {
            enabled: isAppReady && isConnected,
        }
    );
    const userActiveChainedSpeedMarketsData =
        userActiveChainedSpeedMarketsDataQuery.isSuccess && userActiveChainedSpeedMarketsDataQuery.data
            ? userActiveChainedSpeedMarketsDataQuery.data
            : [];

    // Prepare active chained speed markets that become matured to fetch Pyth prices
    const maturedChainedMarkets = userActiveChainedSpeedMarketsData
        .filter((marketData) => marketData.isMatured)
        .map((marketData) => {
            const strikeTimes = marketData.strikeTimes.map((strikeTime) => millisecondsToSeconds(strikeTime));
            return {
                ...marketData,
                strikeTimes,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const priceRequests = maturedChainedMarkets
        .map((data) =>
            data.strikeTimes.map((strikeTime) => ({
                priceId: data.pythPriceId,
                publishTime: strikeTime,
                market: data.address,
            }))
        )
        .flat();
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, { enabled: priceRequests.length > 0 });
    const pythPricesWithMarket = priceRequests.map((request, i) => ({
        market: request.market,
        price: pythPricesQueries[i]?.data || 0,
    }));

    // Based on Pyth prices determine if chained position is claimable
    const chainedSpeedMarketsNotifications = maturedChainedMarkets
        .map((marketData) => {
            const finalPrices = marketData.strikeTimes.map(
                (_, i) => pythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.address)[i].price
            );
            const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
                i > 0 ? finalPrices[i - 1] : strikePrice
            );
            const userWonStatuses = marketData.sides.map((side, i) =>
                isUserWinner(side, strikePrices[i], finalPrices[i])
            );
            const claimable = userWonStatuses.every((status) => status);

            return { ...marketData, finalPrices, claimable };
        })
        .filter((marketData) => marketData.claimable).length;

    const totalNotifications = speedMarketsNotifications + chainedSpeedMarketsNotifications;

    const userProfileDataQuery = useProfileDataQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
        {
            enabled: isAppReady && isConnected,
        }
    );
    const profileData: UserProfileData =
        userProfileDataQuery.isSuccess && userProfileDataQuery.data
            ? userProfileDataQuery.data
            : {
                  profit: 0,
                  volume: 0,
                  numberOfTrades: 0,
                  gain: 0,
                  investment: 0,
              };

    const queryParamTab = queryString.parse(location.search).tab as NavItems;
    const [view, setView] = useState(
        Object.values(NavItems).includes(queryParamTab) ? queryParamTab : NavItems.MyPositions
    );

    useEffect(() => {
        if (searchText.startsWith('0x') && searchText?.length == 42) {
            setSearchAddress(searchText.toLowerCase());
        } else {
            setSearchAddress('');
        }
    }, [searchText]);

    const onTabClickHandler = (tab: NavItems) => {
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({ tab }),
        });
        setView(tab);
    };

    return (
        <Container>
            <Header>
                <Title>{t('profile.title')}</Title>
                <SearchInput
                    placeholder={t('profile.search-placeholder')}
                    text={searchText}
                    handleChange={(value) => setSearchText(value)}
                    width="300px"
                    height="28px"
                    iconTop="6px"
                />
            </Header>
            <MainContainer>
                <StatsContainer>
                    <StatsItem>
                        <StatsLabel>{t('profile.stats.netprofit-col')}:</StatsLabel>
                        <StatsValue
                            color={
                                profileData.profit > 0
                                    ? theme.textColor.quaternary
                                    : profileData.profit < 0
                                    ? theme.textColor.tertiary
                                    : theme.textColor.primary
                            }
                        >
                            {userProfileDataQuery.isLoading
                                ? '-'
                                : formatCurrencyWithSign(USD_SIGN, profileData.profit, 2)}
                        </StatsValue>
                    </StatsItem>
                    <StatsItem>
                        <StatsLabel>{t('profile.stats.gain-col')}:</StatsLabel>
                        <StatsValue
                            color={
                                profileData.gain > 0
                                    ? theme.textColor.quaternary
                                    : profileData.gain < 0
                                    ? theme.textColor.tertiary
                                    : theme.textColor.primary
                            }
                        >
                            {userProfileDataQuery.isLoading ? '-' : formatPercentage(profileData.gain)}
                        </StatsValue>
                    </StatsItem>
                    <StatsItem>
                        <StatsLabel>{t('profile.stats.trades-col')}:</StatsLabel>
                        <StatsValue>{userProfileDataQuery.isLoading ? '-' : profileData.numberOfTrades}</StatsValue>
                    </StatsItem>
                    <StatsItem>
                        <StatsLabel>{t('profile.stats.volume-col')}:</StatsLabel>
                        <StatsValue>
                            {userProfileDataQuery.isLoading
                                ? '-'
                                : formatCurrencyWithSign(USD_SIGN, profileData.volume, 2)}
                        </StatsValue>
                    </StatsItem>
                </StatsContainer>
                <Nav>
                    <NavItem
                        onClick={() => onTabClickHandler(NavItems.MyPositions)}
                        $active={view === NavItems.MyPositions}
                    >
                        {t('profile.tabs.my-positions')}
                        {totalNotifications > 0 && <Notification>{totalNotifications}</Notification>}
                    </NavItem>
                    <NavItem onClick={() => onTabClickHandler(NavItems.History)} $active={view === NavItems.History}>
                        {t('profile.tabs.history')}
                    </NavItem>
                </Nav>
                <>
                    {view === NavItems.MyPositions && (
                        <>
                            <ProfileSection
                                title={t('profile.accordions.claimable-positions')}
                                subtitle={t('profile.winnings-are-forfeit', { days: MARKET_DURATION_IN_DAYS })}
                                mobileMaxHeight="360px"
                            >
                                <ClaimablePositions
                                    searchAddress={searchAddress}
                                    searchText={searchAddress ? '' : searchText}
                                />
                            </ProfileSection>
                            <ProfileSection title={t('profile.accordions.open-positions')} mobileMaxHeight="360px">
                                <OpenPositions
                                    searchAddress={searchAddress}
                                    searchText={searchAddress ? '' : searchText}
                                />
                            </ProfileSection>
                        </>
                    )}
                    {view === NavItems.History && (
                        <>
                            <ProfileSection
                                title={t('profile.accordions.transaction-history')}
                                subtitle={t('profile.history-limit', { days: MARKET_DURATION_IN_DAYS })}
                            >
                                <TransactionHistory
                                    searchAddress={searchAddress}
                                    searchText={searchAddress ? '' : searchText}
                                />
                            </ProfileSection>
                        </>
                    )}
                </>
            </MainContainer>
        </Container>
    );
};

export default Profile;
