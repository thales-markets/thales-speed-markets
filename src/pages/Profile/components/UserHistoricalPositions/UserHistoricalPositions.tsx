import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import CardPositions from 'pages/SpeedMarkets/components/CardPositions';
import { CollateralSelectorContainer } from 'pages/SpeedMarkets/components/MyPositionAction/MyPositionAction';
import TableChainedPositions from 'pages/SpeedMarkets/components/UserOpenPositions/components/TableChainedPositions';
import TablePositions from 'pages/SpeedMarkets/components/UserOpenPositions/components/TablePositions';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivRow, FlexDivStart, GradientContainer } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserChainedPosition, UserPosition } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getCollateral, getDefaultCollateral } from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId } from 'utils/pyth';
import { isUserWinner, resolveAllChainedMarkets, resolveAllSpeedPositions } from 'utils/speedAmm';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type UserHistoricalPositionsProps = {
    isChained: boolean;
    currentPrices: { [key: string]: number };
    maxPriceDelayForResolvingSec?: number;
    searchAddress?: string;
    showOnlyClaimable?: boolean;
    showOnlyOpen?: boolean; // not matured and without final price => don't show unresolved matured (still open)
    showTabs?: boolean;
    showFilter?: boolean;
    setClaimablePositions?: React.Dispatch<number>;
    setNumberOfPositions?: React.Dispatch<number>;
    onChainedSelectedChange?: React.Dispatch<boolean>;
};

const UserHistoricalPositions: React.FC<UserHistoricalPositionsProps> = ({
    isChained,
    currentPrices,
    searchAddress,
    showOnlyClaimable,
    showOnlyOpen,
    showTabs,
    showFilter,
    setClaimablePositions,
    setNumberOfPositions,
    onChainedSelectedChange,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress = isMultiCollateralSupported
        ? multipleCollateral[selectedCollateral].addresses[networkId]
        : erc20Contract.addresses[networkId];

    const [isChainedSelected, setIsChainedSelected] = useState(!!isChained);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // SINGLE
    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected && !isChainedSelected,
        }
    );

    const userOpenSpeedMarketsData = useMemo(
        () =>
            userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data
                ? userActiveSpeedMarketsDataQuery.data
                : [],
        [userActiveSpeedMarketsDataQuery]
    );

    const activeSpeedNotMatured: UserPosition[] = userOpenSpeedMarketsData
        .filter((marketData) => marketData.maturityDate >= Date.now() && !showOnlyClaimable)
        .map((marketData) => ({
            ...marketData,
            currentPrice: currentPrices[marketData.currencyKey],
        }));
    const activeSpeedMatured = userOpenSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());

    const priceRequests = activeSpeedMatured.map((marketData) => ({
        priceId: getPriceId(networkId, marketData.currencyKey),
        publishTime: millisecondsToSeconds(marketData.maturityDate),
    }));
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, {
        enabled: priceRequests.length > 0,
    });

    // set final prices and claimable status
    const maturedUserSpeedMarketsWithPrices: UserPosition[] = activeSpeedMatured
        .map((marketData, index) => {
            const finalPrice = pythPricesQueries[index].data || 0;
            const isClaimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
            return {
                ...marketData,
                finalPrice,
                isClaimable,
            };
        })
        .filter((marketData) =>
            showOnlyClaimable ? marketData.isClaimable : showOnlyOpen ? !marketData.finalPrice : true
        );

    const allUserOpenSpeedMarketsData = activeSpeedNotMatured.concat(maturedUserSpeedMarketsWithPrices);

    const sortedUserOpenSpeedMarketsData = sortSpeedMarkets(allUserOpenSpeedMarketsData) as UserPosition[];

    // CHAINED
    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected && isChainedSelected,
        }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            userChainedSpeedMarketsDataQuery.isSuccess && userChainedSpeedMarketsDataQuery.data
                ? userChainedSpeedMarketsDataQuery.data
                : [],
        [userChainedSpeedMarketsDataQuery]
    );

    const chainedWithoutMaturedPositions: UserChainedPosition[] = userOpenChainedSpeedMarketsData
        .filter((marketData) => marketData.strikeTimes[0] >= Date.now() && !showOnlyClaimable)
        .map((marketData) => ({
            ...marketData,
            currentPrice: currentPrices[marketData.currencyKey],
        }));
    // Prepare chained speed markets that are partially matured to fetch Pyth prices
    const partiallyMaturedChainedMarkets = userOpenChainedSpeedMarketsData
        .filter((marketData) => marketData.strikeTimes.some((strikeTime) => strikeTime < Date.now()))
        .map((marketData) => {
            return {
                ...marketData,
                pythPriceId: getPriceId(networkId, marketData.currencyKey),
            };
        });

    const chainedPriceRequests = partiallyMaturedChainedMarkets
        .map((data) =>
            data.strikeTimes
                .filter(
                    (strikeTime, i) => strikeTime < Date.now() && i <= (data.resolveIndex || data.strikeTimes.length)
                )
                .map((strikeTime) => ({
                    priceId: data.pythPriceId,
                    publishTime: millisecondsToSeconds(strikeTime),
                    market: data.market,
                }))
        )
        .flat();
    const chainedPythPricesQueries = usePythPriceQueries(networkId, chainedPriceRequests, {
        enabled: chainedPriceRequests.length > 0,
    });
    const chainedPythPricesWithMarket = chainedPriceRequests.map((request, i) => ({
        market: request.market,
        price: chainedPythPricesQueries[i].data || 0,
    }));

    // Based on Pyth prices set finalPrices, strikePrices, canResolve, isMatured, isClaimable, isUserWinner
    const partiallyMaturedWithPrices: UserChainedPosition[] = partiallyMaturedChainedMarkets
        .map((marketData) => {
            const currentPrice = currentPrices[marketData.currencyKey];
            const finalPrices = marketData.strikeTimes.map(
                (_, i) =>
                    chainedPythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.market)[i]
                        ?.price || 0
            );
            const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
                i > 0 ? finalPrices[i - 1] : strikePrice
            );
            const userWonStatuses = marketData.sides.map((side, i) =>
                isUserWinner(side, strikePrices[i], finalPrices[i])
            );
            const canResolve =
                userWonStatuses.some((status) => status === false) ||
                userWonStatuses.every((status) => status !== undefined);

            const lossIndex = userWonStatuses.findIndex((status) => status === false);
            const resolveIndex = canResolve ? (lossIndex > -1 ? lossIndex : marketData.sides.length - 1) : undefined;

            const isClaimable = userWonStatuses.every((status) => status);
            const isMatured = marketData.maturityDate < Date.now();

            return {
                ...marketData,
                strikePrices,
                currentPrice,
                finalPrices,
                canResolve,
                resolveIndex,
                isMatured,
                isClaimable,
                isUserWinner: isClaimable,
            };
        })
        .filter((marketData) =>
            showOnlyClaimable ? marketData.isClaimable : showOnlyOpen ? !marketData.canResolve : true
        );

    const allUserOpenChainedMarketsData = chainedWithoutMaturedPositions.concat(partiallyMaturedWithPrices);

    const sortedUserOpenChainedMarketsData = sortSpeedMarkets(allUserOpenChainedMarketsData) as UserChainedPosition[];

    const isLoading =
        userChainedSpeedMarketsDataQuery.isLoading ||
        userActiveSpeedMarketsDataQuery.isLoading ||
        pythPricesQueries.filter((query) => query.isLoading).length > 1;

    const noPositions =
        !isLoading &&
        (isChainedSelected ? allUserOpenChainedMarketsData.length === 0 : allUserOpenSpeedMarketsData.length === 0);

    const positions = noPositions
        ? dummyPositions
        : isChainedSelected
        ? sortedUserOpenChainedMarketsData
        : sortedUserOpenSpeedMarketsData;

    const claimableSpeedPositions = allUserOpenSpeedMarketsData.filter((p) => p.isClaimable);
    const claimableSpeedPositionsSum = claimableSpeedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const claimableChainedPositions = sortedUserOpenChainedMarketsData.filter((p) => p.isClaimable);
    const claimableChainedPositionsSum = claimableChainedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const hasClaimableSpeedPositions = isChainedSelected
        ? !!claimableChainedPositions.length
        : !!claimableSpeedPositions.length;

    // Table tab selection to follow choosen direction(s)
    useEffect(() => {
        setIsChainedSelected(isChained);
        onChainedSelectedChange && onChainedSelectedChange(isChained);
    }, [isChained, onChainedSelectedChange]);

    // Update number of claimable positions
    useEffect(() => {
        if (setClaimablePositions && showOnlyClaimable) {
            setClaimablePositions(claimableSpeedPositions.length + claimableChainedPositions.length);
        }
    }, [setClaimablePositions, showOnlyClaimable, claimableSpeedPositions.length, claimableChainedPositions.length]);

    // Update number of positions
    useEffect(() => {
        if (setNumberOfPositions) {
            setNumberOfPositions(noPositions ? 0 : positions.length);
        }
    }, [setNumberOfPositions, positions.length, noPositions]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (isChainedSelected) {
            await resolveAllChainedMarkets(
                claimableChainedPositions,
                false,
                { networkId, client: walletClient.data },
                isBiconomy,
                collateralAddress
            );
        } else {
            await resolveAllSpeedPositions(
                claimableSpeedPositions,
                false,
                { networkId, client: walletClient.data },
                isBiconomy,
                collateralAddress
            );
        }
        setIsSubmitting(false);
    };

    const getClaimAllButton = () => (
        <Button disabled={isSubmitting} additionalStyles={additionalButtonStyle} fontSize="13px" onClick={handleSubmit}>
            {`${
                isSubmitting
                    ? t('speed-markets.user-positions.claim-all-progress')
                    : t('speed-markets.user-positions.claim-all')
            } ${formatCurrencyWithSign(
                USD_SIGN,
                isChainedSelected ? claimableChainedPositionsSum : claimableSpeedPositionsSum,
                2
            )}`}
        </Button>
    );

    return (
        <Container>
            <Header>
                <MobileTitle>{t('speed-markets.user-positions.your-positions')}</MobileTitle>
                {showTabs && (
                    <>
                        <Tabs>
                            <Tab
                                $isSelected={!isChainedSelected}
                                onClick={() => {
                                    setIsChainedSelected(false);
                                    onChainedSelectedChange && onChainedSelectedChange(false);
                                }}
                            >
                                {isMobile ? t('speed-markets.single') : t('speed-markets.user-positions.open-single')}
                                {claimableSpeedPositions.length > 0 && (
                                    <Notification $isSelected={!isChainedSelected}>
                                        {claimableSpeedPositions.length}
                                    </Notification>
                                )}
                            </Tab>
                            <Tab
                                $isSelected={isChainedSelected}
                                onClick={() => {
                                    setIsChainedSelected(true);
                                    onChainedSelectedChange && onChainedSelectedChange(true);
                                }}
                            >
                                {isMobile
                                    ? t('speed-markets.chained.label')
                                    : t('speed-markets.user-positions.open-chained')}
                                {claimableChainedPositions.length > 0 && (
                                    <Notification $isSelected={isChainedSelected}>
                                        {claimableChainedPositions.length}
                                    </Notification>
                                )}
                            </Tab>
                        </Tabs>
                        <TabsSeparator />
                    </>
                )}

                {hasClaimableSpeedPositions && (
                    <FlexDivRow>
                        {showFilter && (
                            <Filters>
                                <Filter
                                    $isSelected={!isChainedSelected}
                                    onClick={() => onChainedSelectedChange && onChainedSelectedChange(false)}
                                >
                                    {t('speed-markets.single')}
                                </Filter>
                                <Filter
                                    $isSelected={isChainedSelected}
                                    onClick={() => onChainedSelectedChange && onChainedSelectedChange(true)}
                                >
                                    {t('speed-markets.chained.label')}
                                </Filter>
                            </Filters>
                        )}
                        <ButtonWrapper $isChained={isChainedSelected}>
                            {isMultiCollateralSupported && (
                                <CollateralSelectorContainer>
                                    <ClaimAll>
                                        {isMobile
                                            ? t('speed-markets.user-positions.claim-all-in')
                                            : t('speed-markets.user-positions.claim-all-win-in')}
                                        :
                                    </ClaimAll>
                                    <CollateralSelector
                                        collateralArray={[getDefaultCollateral(networkId)]}
                                        selectedItem={0}
                                        onChangeCollateral={() => {}}
                                        disabled
                                        isIconHidden
                                    />
                                </CollateralSelectorContainer>
                            )}
                            {getClaimAllButton()}
                        </ButtonWrapper>
                    </FlexDivRow>
                )}
            </Header>
            <PositionsWrapper $noPositions={noPositions}>
                {isLoading ? (
                    <SimpleLoader />
                ) : isChainedSelected && !noPositions ? (
                    // CHAINED
                    isMobile ? (
                        <CardPositions isHorizontal={false} positions={positions as UserChainedPosition[]} isChained />
                    ) : (
                        <TableChainedPositions data={positions as UserChainedPosition[]} />
                    )
                ) : // SINGLE
                isMobile ? (
                    <CardPositions isHorizontal={false} positions={positions as UserPosition[]} />
                ) : (
                    <TablePositions data={positions as UserPosition[]} />
                )}
            </PositionsWrapper>
            {noPositions && (
                <NoPositionsText>
                    {t('speed-markets.user-positions.no-positions', {
                        status: showOnlyClaimable
                            ? t('speed-markets.user-positions.status-claimable')
                            : t('speed-markets.user-positions.status-open'),
                    })}
                </NoPositionsText>
            )}
        </Container>
    );
};

const sortSpeedMarkets = (markets: (UserPosition | UserChainedPosition)[]) =>
    markets
        // 1. sort open by maturity asc
        .filter((position) => position.maturityDate > Date.now())
        .sort((a, b) => a.maturityDate - b.maturityDate)
        .concat(
            // 2. sort claimable by maturity desc
            markets.filter((position) => position.isClaimable).sort((a, b) => b.maturityDate - a.maturityDate)
        )
        .concat(
            markets
                // 3. sort lost by maturity desc
                .filter((position) => position.maturityDate < Date.now() && !position.isClaimable)
                .sort((a, b) => b.maturityDate - a.maturityDate)
        );

const dummyPositions: UserPosition[] = [
    {
        user: '',
        market: '0x1',
        currencyKey: 'BTC',
        side: Positions.UP,
        strikePrice: 25000,
        maturityDate: 1684483200000,
        paid: 100,
        payout: 15,
        currentPrice: 0,
        finalPrice: 1,
        isClaimable: false,
        isResolved: false,
        createdAt: Date.now(),
    },
    {
        user: '',
        market: '0x2',
        currencyKey: 'BTC',
        side: Positions.DOWN,
        strikePrice: 35000,
        maturityDate: 1684483200000,
        paid: 200,
        payout: 10,
        currentPrice: 0,
        finalPrice: 1,
        isClaimable: false,
        isResolved: false,
        createdAt: Date.now(),
    },
];

const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const Header = styled(FlexDivColumn)``;

const Tabs = styled(FlexDivStart)`
    align-items: center;
    gap: 150px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 100px;
    }
`;

const Tab = styled.span<{ $isSelected: boolean }>`
    font-size: 18px;
    font-weight: 800;
    line-height: 36px;
    text-align: left;
    text-transform: uppercase;
    color: ${(props) => (props.$isSelected ? props.theme.textColor.quinary : props.theme.textColor.primary)};
    cursor: pointer;
`;

const Notification = styled.span<{ $isSelected: boolean }>`
    display: inline-block;
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.quaternary};
    border-radius: 30px;
    color: ${(props) => props.theme.button.textColor.secondary};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 13px;
    font-weight: 700;
    min-width: 20px;
    line-height: 20px;
    padding: 0 5px;
    margin-left: 6px;
    text-align: center;
`;

const TabsSeparator = styled(GradientContainer)`
    height: 2px;
    padding-top: 0;
    margin-bottom: 13px;
`;

const Filters = styled(FlexDivStart)`
    gap: 10px;
`;

const Filter = styled(FlexDivCentered)<{ $isSelected: boolean }>`
    width: 100px;
    height: 40px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 800;
    line-height: 100%;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
    text-transform: uppercase;
`;

const MobileTitle = styled.span`
    display: none;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: flex;
        font-weight: 700;
        font-size: 18px;
        line-height: 100%;
        color: ${(props) => props.theme.textColor.primary};
        text-transform: uppercase;
    }
`;

const PositionsWrapper = styled.div<{ $noPositions?: boolean }>`
    position: relative;
    min-height: 200px;
    width: 100%;
    ${(props) => (props.$noPositions ? 'filter: blur(10px);' : '')}
`;

const ButtonWrapper = styled(FlexDivEnd)<{ $isChained?: boolean }>`
    gap: 70px;
    padding-right: ${(props) => (props.$isChained ? '84px' : '66px')};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        justify-content: space-between;
        gap: unset;
        padding-right: 0;
        margin-bottom: 13px;
    }
`;

const additionalButtonStyle: CSSProperties = {
    lineHeight: '100%',
    border: 'none',
};

const ClaimAll = styled.span`
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.quinary};
`;

const NoPositionsText = styled.span`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 15px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    min-width: max-content;
`;

export default UserHistoricalPositions;
