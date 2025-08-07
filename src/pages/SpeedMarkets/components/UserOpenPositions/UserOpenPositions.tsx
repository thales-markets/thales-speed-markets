import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { millisecondsToSeconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { uniq } from 'lodash';
import { Tab, Tabs } from 'pages/Profile/styled-components';
import { CollateralSelectorContainer } from 'pages/SpeedMarkets/components/PositionAction/PositionAction';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivEnd, FlexDivRow } from 'styles/common';
import { UserChainedPosition, UserPosition } from 'types/market';
import { SupportedNetwork } from 'types/network';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import {
    formatValueWithCollateral,
    getCollateralAddress,
    getCollateralByAddress,
    getDefaultCollateral,
    getNativeCollateralsText,
} from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { sortSpeedMarkets } from 'utils/position';
import { getPriceId } from 'utils/pyth';
import { isUserWinner, resolveAllChainedMarkets, resolveAllSpeedPositions } from 'utils/speedAmm';
import { Address } from 'viem';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import CardPositions from '../CardPositions/';
import TableChainedPositions from './components/TableChainedPositions';
import TablePositions from './components/TablePositions';

type UserOpenPositionsProps = {
    isChained: boolean;
    currentPrices: { [key: string]: number };
    onChainedSelectedChange?: React.Dispatch<boolean>;
};

const UserOpenPositions: React.FC<UserOpenPositionsProps> = ({ isChained, currentPrices, onChainedSelectedChange }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);

    const [isChainedSelected, setIsChainedSelected] = useState(!!isChained);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // SINGLE
    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress || '',
        { enabled: isAppReady && isConnected && !isChainedSelected }
    );

    const userOpenSpeedMarketsData = useMemo(
        () =>
            userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data
                ? userActiveSpeedMarketsDataQuery.data
                : [],
        [userActiveSpeedMarketsDataQuery]
    );

    const activeSpeedNotMatured: UserPosition[] = userOpenSpeedMarketsData
        .filter((marketData) => marketData.maturityDate >= Date.now())
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
    const maturedUserSpeedMarketsWithPrices: UserPosition[] = activeSpeedMatured.map((marketData, index) => {
        const finalPrice = pythPricesQueries[index].data || 0;
        const isClaimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
        return {
            ...marketData,
            finalPrice,
            isClaimable,
        };
    });

    const allUserOpenSpeedMarketsData = activeSpeedNotMatured.concat(maturedUserSpeedMarketsWithPrices);

    const sortedUserOpenSpeedMarketsData = sortSpeedMarkets(allUserOpenSpeedMarketsData) as UserPosition[];

    // CHAINED
    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress || '',
        { enabled: isAppReady && isConnected && isChainedSelected }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            userChainedSpeedMarketsDataQuery.isSuccess && userChainedSpeedMarketsDataQuery.data
                ? userChainedSpeedMarketsDataQuery.data
                : [],
        [userChainedSpeedMarketsDataQuery]
    );

    const chainedWithoutMaturedPositions: UserChainedPosition[] = userOpenChainedSpeedMarketsData
        .filter((marketData) => marketData.strikeTimes[0] >= Date.now())
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
    const partiallyMaturedWithPrices: UserChainedPosition[] = partiallyMaturedChainedMarkets.map((marketData) => {
        const currentPrice = currentPrices[marketData.currencyKey];
        const finalPrices = marketData.strikeTimes.map(
            (_, i) =>
                chainedPythPricesWithMarket.filter((pythPrice) => pythPrice.market === marketData.market)[i]?.price || 0
        );
        const strikePrices = marketData.strikePrices.map((strikePrice, i) =>
            i > 0 ? finalPrices[i - 1] : strikePrice
        );
        const userWonStatuses = marketData.sides.map((side, i) => isUserWinner(side, strikePrices[i], finalPrices[i]));
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
    });

    const allUserOpenChainedMarketsData = chainedWithoutMaturedPositions.concat(partiallyMaturedWithPrices);

    const sortedUserOpenChainedMarketsData = sortSpeedMarkets(allUserOpenChainedMarketsData) as UserChainedPosition[];

    // ALL
    const isLoading =
        userChainedSpeedMarketsDataQuery.isLoading ||
        userActiveSpeedMarketsDataQuery.isLoading ||
        pythPricesQueries.filter((query) => query.isLoading).length > 1;

    const noPositions =
        !isLoading &&
        (isChainedSelected ? allUserOpenChainedMarketsData.length === 0 : allUserOpenSpeedMarketsData.length === 0);

    const positions = noPositions
        ? getDummyPositions(networkId)
        : isChainedSelected
        ? sortedUserOpenChainedMarketsData
        : sortedUserOpenSpeedMarketsData;

    const claimableSpeedPositions = allUserOpenSpeedMarketsData.filter((p) => p.isClaimable);
    const claimableChainedPositions = sortedUserOpenChainedMarketsData.filter((p) => p.isClaimable);

    const claimableSelectedPositions = isChainedSelected ? claimableChainedPositions : claimableSpeedPositions;
    const isAllClaimablePositionsInSameCollateral =
        claimableSelectedPositions.every((marketData) => marketData.isDefaultCollateral) ||
        claimableSelectedPositions.every(
            (marketData) =>
                !marketData.isDefaultCollateral &&
                !!positions.length &&
                positions[0].collateralAddress === marketData.collateralAddress
        );

    const hasPositionsDefaultCollateral = claimableSelectedPositions.some(
        (marketData) => marketData.isDefaultCollateral
    );

    const nativeCollateralAddress = claimableSelectedPositions.find(
        (marketData) => !hasPositionsDefaultCollateral && !marketData.isDefaultCollateral
    )?.collateralAddress;

    const nativeCollateral = nativeCollateralAddress
        ? getCollateralByAddress(nativeCollateralAddress, networkId)
        : null;

    const claimableAllPositions = claimableSelectedPositions.filter((marketData) =>
        nativeCollateralAddress
            ? nativeCollateralAddress === marketData.collateralAddress
            : marketData.isDefaultCollateral
    );

    const claimableAllPositionsPayout = claimableAllPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const allPositionsCollaterals = uniq(
        positions.map((position) => getCollateralByAddress(position.collateralAddress, networkId))
    );

    // Table tab selection to follow choosen direction(s)
    useEffect(() => {
        setIsChainedSelected(isChained);
        onChainedSelectedChange && onChainedSelectedChange(isChained);
    }, [isChained, onChainedSelectedChange]);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (isChainedSelected) {
            await resolveAllChainedMarkets(
                claimableAllPositions as UserChainedPosition[],
                false,
                { networkId, client: walletClient.data },
                isBiconomy,
                claimableAllPositions[0].collateralAddress as Address
            );
        } else {
            await resolveAllSpeedPositions(
                claimableAllPositions as UserPosition[],
                false,
                { networkId, client: walletClient.data },
                isBiconomy,
                claimableAllPositions[0].collateralAddress as Address
            );
        }

        setIsSubmitting(false);
    };

    const getClaimAllButton = () => (
        <Button
            disabled={isSubmitting}
            additionalStyles={getAdditionalButtonStyle(isMobile)}
            fontSize="13px"
            onClick={handleSubmit}
        >
            <>
                {t(
                    `speed-markets.user-positions.claim-all${nativeCollateral ? '-in' : ''}${
                        isSubmitting ? '-progress' : ''
                    }`
                )}
                <CollateralText>
                    {` ${formatValueWithCollateral(claimableAllPositionsPayout, nativeCollateral, networkId)}`}
                </CollateralText>
            </>
            <Tooltip
                overlay={
                    !isMobile && !isAllClaimablePositionsInSameCollateral
                        ? t('speed-markets.tooltips.claim-all-except-native', {
                              collaterals: getNativeCollateralsText(
                                  allPositionsCollaterals,
                                  nativeCollateral,
                                  networkId
                              ),
                          })
                        : ''
                }
            />
        </Button>
    );

    return (
        <Container>
            <Header>
                <>
                    <MobileTitle>{t('speed-markets.user-positions.your-positions')}</MobileTitle>
                    <Tabs>
                        <Tab
                            $active={!isChainedSelected}
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
                            $active={isChainedSelected}
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
                </>

                {!!claimableSelectedPositions.length && (
                    <PositionsControl>
                        {!!claimableSelectedPositions.length && (
                            <>
                                <ClaimAllWrapper>
                                    {isMultiCollateralSupported && (
                                        <CollateralSelectorContainer>
                                            <ClaimAll>
                                                {isMobile
                                                    ? t('speed-markets.user-positions.claim-all-in')
                                                    : t('speed-markets.user-positions.claim-all-win-in')}
                                                :
                                            </ClaimAll>
                                            <CollateralSelector
                                                collateralArray={[
                                                    nativeCollateral
                                                        ? nativeCollateral
                                                        : getDefaultCollateral(networkId),
                                                ]}
                                                selectedItem={0}
                                                onChangeCollateral={() => {}}
                                                preventPaymentCollateralChange
                                                isIconHidden
                                                invertCollors
                                            />
                                        </CollateralSelectorContainer>
                                    )}
                                    <ButtonWrapper>{getClaimAllButton()}</ButtonWrapper>
                                </ClaimAllWrapper>
                                {isMobile && !isAllClaimablePositionsInSameCollateral && (
                                    <FlexDivRow>
                                        <InfoText>{`* ${t('speed-markets.tooltips.claim-all-except-native', {
                                            collaterals: getNativeCollateralsText(
                                                allPositionsCollaterals,
                                                nativeCollateral,
                                                networkId
                                            ),
                                        })}`}</InfoText>
                                    </FlexDivRow>
                                )}
                            </>
                        )}
                    </PositionsControl>
                )}
            </Header>
            <PositionsWrapper $noPositions={noPositions}>
                {isLoading ? (
                    <LoaderWrapper>
                        <SimpleLoader />
                    </LoaderWrapper>
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
                        status: t('speed-markets.user-positions.status-open'),
                    })}
                </NoPositionsText>
            )}
        </Container>
    );
};

export const getDummyPositions = (networkId: SupportedNetwork): UserPosition[] => [
    {
        user: '',
        market: '0x1',
        currencyKey: 'BTC',
        side: Positions.UP,
        strikePrice: 25000,
        maturityDate: 1684483200000,
        paid: 100,
        payout: 15,
        collateralAddress: getCollateralAddress(networkId, 0),
        isDefaultCollateral: true,
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
        collateralAddress: getCollateralAddress(networkId, 0),
        isDefaultCollateral: true,
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
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 15px;
    }
`;

const Header = styled(FlexDivColumn)`
    gap: 15px;
`;

const Notification = styled.span<{ $isSelected: boolean }>`
    display: inline-block;
    position: relative;
    top: -2px;
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
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        top: 0px;
    }
`;

const MobileTitle = styled.span`
    display: none;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: flex;
        font-weight: 700;
        font-size: 18px;
        line-height: 100%;
        color: ${(props) => props.theme.textColor.secondary};
        text-transform: uppercase;
    }
`;

const PositionsControl = styled(FlexDiv)`
    justify-content: end;
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

const ClaimAllWrapper = styled(FlexDivCentered)`
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        justify-content: space-between;
        gap: unset;
    }
`;

const ButtonWrapper = styled(FlexDivEnd)`
    width: 360px;
    padding-right: 60px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: min-content;
        padding-right: 0;
    }
`;

const getAdditionalButtonStyle = (isMobile: boolean): CSSProperties => ({
    lineHeight: '100%',
    border: 'none',
    minWidth: !isMobile ? '236px' : '',
});

const ClaimAll = styled.span`
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
`;

const InfoText = styled.span`
    font-size: 13px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.secondary};
`;

const CollateralText = styled.span`
    text-transform: none;
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

export default UserOpenPositions;
