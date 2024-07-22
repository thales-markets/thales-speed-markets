import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds } from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import CardPositions from 'pages/SpeedMarkets/components/CardPositions';
import { CollateralSelectorContainer } from 'pages/SpeedMarkets/components/PositionAction/PositionAction';
import { dummyPositions } from 'pages/SpeedMarkets/components/UserOpenPositions/UserOpenPositions';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { CSSProperties, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivStart } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserChainedPosition, UserPosition } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getCollateral, getDefaultCollateral } from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { sortSpeedMarkets } from 'utils/position';
import { getPriceId } from 'utils/pyth';
import { isUserWinner, resolveAllChainedMarkets, resolveAllSpeedPositions } from 'utils/speedAmm';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import TableActivePositions from './components';

type UserActivePositionsProps = {
    currentPrices: { [key: string]: number };
    searchAddress?: string;
    showOnlyClaimable?: boolean;
    showOnlyOpen?: boolean; // not matured and without final price => don't show unresolved matured (still open)
};

const UserActivePositions: React.FC<UserActivePositionsProps> = ({
    currentPrices,
    searchAddress,
    showOnlyClaimable,
    showOnlyOpen,
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFilterSingleSelected, setIsFilterSingleSelected] = useState(false);
    const [isFilterChainedSelected, setIsFilterChainedSelected] = useState(false);

    // SINGLE
    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected,
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
        .map((marketData) => {
            const fetchedCurrentPrice = currentPrices[marketData.currencyKey];
            return {
                ...marketData,
                currentPrice: fetchedCurrentPrice ? fetchedCurrentPrice : marketData.currentPrice,
            };
        });
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

    const allSingle = activeSpeedNotMatured.concat(maturedUserSpeedMarketsWithPrices);

    const allUserActiveSingleFiltered = isFilterChainedSelected ? [] : allSingle;

    // CHAINED
    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress ? searchAddress : isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected,
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
        .map((marketData) => {
            const fetchedCurrentPrice = currentPrices[marketData.currencyKey];
            return {
                ...marketData,
                currentPrice: fetchedCurrentPrice ? fetchedCurrentPrice : marketData.currentPrice,
            };
        });
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

    const allChained = chainedWithoutMaturedPositions.concat(partiallyMaturedWithPrices);

    const allUserActiveChainedFiltered = isFilterSingleSelected ? [] : allChained;

    const allUserMarketsFiltered = (allUserActiveSingleFiltered as (UserPosition | UserChainedPosition)[]).concat(
        allUserActiveChainedFiltered
    );
    const sortedUserMarketsData = sortSpeedMarkets(allUserMarketsFiltered);

    const isLoading =
        userChainedSpeedMarketsDataQuery.isLoading ||
        userActiveSpeedMarketsDataQuery.isLoading ||
        pythPricesQueries.filter((query) => query.isLoading).length > 1;

    const noPositions =
        !isLoading && allUserActiveChainedFiltered.length === 0 && allUserActiveSingleFiltered.length === 0;

    const hasSomePositions = allSingle.length > 0 || allChained.length > 0;

    const positions = noPositions ? dummyPositions : sortedUserMarketsData;

    const claimableSpeedPositions = allUserActiveSingleFiltered.filter((p) => p.isClaimable);
    const claimableSpeedPositionsSum = claimableSpeedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const claimableChainedPositions = allUserActiveChainedFiltered.filter((p) => p.isClaimable);
    const claimableChainedPositionsSum = claimableChainedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const hasClaimableSpeedPositions = isFilterChainedSelected
        ? !!claimableChainedPositions.length
        : isFilterSingleSelected
        ? !!claimableSpeedPositions.length
        : !!claimableChainedPositions.length || !!claimableSpeedPositions.length;

    const collateralAddress = isMultiCollateralSupported
        ? multipleCollateral[selectedCollateral].addresses[networkId]
        : erc20Contract.addresses[networkId];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (isFilterChainedSelected) {
            await resolveAllChainedMarkets(
                claimableChainedPositions,
                false,
                { networkId, client: walletClient.data },
                isBiconomy,
                collateralAddress
            );
        } else if (isFilterSingleSelected) {
            await resolveAllSpeedPositions(
                claimableSpeedPositions,
                false,
                { networkId, client: walletClient.data },
                isBiconomy,
                collateralAddress
            );
        } else {
            await Promise.all([
                resolveAllSpeedPositions(
                    claimableSpeedPositions,
                    false,
                    { networkId, client: walletClient.data },
                    isBiconomy,
                    collateralAddress
                ),
                resolveAllChainedMarkets(
                    claimableChainedPositions,
                    false,
                    { networkId, client: walletClient.data },
                    isBiconomy,
                    collateralAddress
                ),
            ]);
        }
        setIsSubmitting(false);
    };

    const getClaimAllButton = () => (
        <Button disabled={isSubmitting} additionalStyles={additionalButtonStyle} fontSize="13px" onClick={handleSubmit}>
            {`${
                isSubmitting
                    ? t('speed-markets.user-positions.claim-all-progress')
                    : t('speed-markets.user-positions.claim-all')
            } ${formatCurrencyWithSign(USD_SIGN, claimableChainedPositionsSum + claimableSpeedPositionsSum, 2)}`}
        </Button>
    );

    return (
        <Container>
            <Header>
                {(hasSomePositions || hasClaimableSpeedPositions) && (
                    <PositionsControl $isAlignEnd={!hasSomePositions}>
                        {hasSomePositions && (
                            <Filters>
                                <Filter
                                    $isSelected={isFilterSingleSelected}
                                    onClick={() => {
                                        setIsFilterSingleSelected(!isFilterSingleSelected);
                                        setIsFilterChainedSelected(false);
                                    }}
                                >
                                    {t('speed-markets.single')}
                                </Filter>
                                <Filter
                                    $isSelected={isFilterChainedSelected}
                                    onClick={() => {
                                        setIsFilterSingleSelected(false);
                                        setIsFilterChainedSelected(!isFilterChainedSelected);
                                    }}
                                >
                                    {t('speed-markets.chained.label')}
                                </Filter>
                            </Filters>
                        )}
                        {hasClaimableSpeedPositions && (
                            <ButtonWrapper>
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
                                            invertCollors
                                        />
                                    </CollateralSelectorContainer>
                                )}
                                {getClaimAllButton()}
                            </ButtonWrapper>
                        )}
                    </PositionsControl>
                )}
            </Header>
            <PositionsWrapper $noPositions={noPositions}>
                {isLoading ? (
                    <LoaderWrapper>
                        <SimpleLoader />
                    </LoaderWrapper>
                ) : isMobile ? (
                    <CardPositions isMixedPositions isHorizontal positions={positions} />
                ) : (
                    <TableActivePositions data={positions} />
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

const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
`;

const Header = styled(FlexDivColumn)`
    gap: 15px;
`;

const Filters = styled(FlexDivStart)`
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-bottom: 13px;
    }
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

const PositionsControl = styled(FlexDiv)<{ $isAlignEnd: boolean }>`
    justify-content: ${(props) => (props.$isAlignEnd ? 'end' : 'space-between')};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        gap: 10px;
    }
`;

const PositionsWrapper = styled.div<{ $noPositions?: boolean }>`
    position: relative;
    width: 100%;
    ${(props) => (props.$noPositions ? 'filter: blur(10px);' : '')}
    ${(props) => (props.$noPositions ? 'min-height: 200px;' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: unset;
    }
`;

const ButtonWrapper = styled(FlexDivEnd)`
    gap: 70px;
    padding-right: 84px;
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
    color: ${(props) => props.theme.textColor.primary};
`;

const NoPositionsText = styled.span`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 15px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.secondary};
    min-width: max-content;
`;

const LoaderWrapper = styled.div`
    min-height: 200px;
`;

export default UserActivePositions;
