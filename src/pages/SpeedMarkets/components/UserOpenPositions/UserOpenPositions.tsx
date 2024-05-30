import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { CollateralSelectorContainer } from 'pages/SpeedMarkets/components/MyPositionAction/MyPositionAction';
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
import { FlexDivColumn, FlexDivEnd, FlexDivStart, GradientContainer } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { ChainedSpeedMarket, UserPosition } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getCollateral, getDefaultCollateral } from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId } from 'utils/pyth';
import { isUserWinner, resolveAllChainedMarkets, resolveAllSpeedPositions } from 'utils/speedAmm';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import CardPositions from '../CardPositions';
import TableChainedPositions from '../TableChainedPositions/ChainedTablePositions';
import TablePositions from '../TablePositions';

type UserOpenPositionsProps = {
    isChained: boolean;
    currentPrices: { [key: string]: number };
    maxPriceDelayForResolvingSec?: number;
};

const UserOpenPositions: React.FC<UserOpenPositionsProps> = ({ isChained, currentPrices }) => {
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
    // For sorting purpose as claimable status is unknown until all chained positions is rendered
    const [chainedClaimableStatuses] = useState<{ address: string; isClaimable: boolean }[]>([]); // TODO: set
    const [chainedWithClaimableStatus, setChainedWithClaimableStatus] = useState<ChainedSpeedMarket[]>([]);

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
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

    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
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
        const claimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
        return {
            ...marketData,
            finalPrice,
            claimable,
        };
    });
    const allUserOpenSpeedMarketsData = activeSpeedNotMatured.concat(maturedUserSpeedMarketsWithPrices);

    // TODO: For chained sorting purpose
    // const updateChainedClaimable = (address: string, isClaimable: boolean) => {
    //     const status = chainedClaimableStatuses.find((s) => s.address === address);
    //     if (status === undefined) {
    //         setChainedClaimableStatuses([...chainedClaimableStatuses, { address, isClaimable }]);
    //     } else if (status.isClaimable !== isClaimable) {
    //         setChainedClaimableStatuses(
    //             chainedClaimableStatuses.map((s) => (s.address === address ? { ...s, isClaimable } : s))
    //         );
    //     }
    // };

    // For chained sorting purpose update claimable status when it is known
    useEffect(() => {
        if (userOpenChainedSpeedMarketsData.length === chainedClaimableStatuses.length) {
            let isStatusChanged = false;
            const chainedPositionsWithStatusUpdated: ChainedSpeedMarket[] = userOpenChainedSpeedMarketsData.map(
                (position) => {
                    const claimable = chainedClaimableStatuses.find((p) => p.address === position.address)?.isClaimable;
                    const claimableUpdated = chainedWithClaimableStatus.find((p) => p.address === position.address)
                        ?.isClaimable;

                    isStatusChanged =
                        isStatusChanged || (position.isClaimable !== claimable && claimableUpdated !== claimable);

                    return {
                        ...position,
                        isClaimable: claimable,
                    } as ChainedSpeedMarket;
                }
            );
            if (isStatusChanged) {
                setChainedWithClaimableStatus(chainedPositionsWithStatusUpdated);
            }
        }
    }, [userOpenChainedSpeedMarketsData, chainedWithClaimableStatus, chainedClaimableStatuses]);

    const sortedUserOpenSpeedMarketsData = sortSpeedMarkets(allUserOpenSpeedMarketsData) as UserPosition[];

    const sortedUserOpenChainedSpeedMarketsData = sortSpeedMarkets(
        chainedWithClaimableStatus.length ? chainedWithClaimableStatus : userOpenChainedSpeedMarketsData
    ) as ChainedSpeedMarket[];

    const isLoading =
        userActiveSpeedMarketsDataQuery.isLoading ||
        (isChainedSelected && userChainedSpeedMarketsDataQuery.isLoading) ||
        pythPricesQueries.filter((query) => query.isLoading).length > 1;

    const noPositions =
        !isLoading &&
        (isChainedSelected ? userOpenChainedSpeedMarketsData.length === 0 : allUserOpenSpeedMarketsData.length === 0);
    const positions = noPositions ? dummyPositions : sortedUserOpenSpeedMarketsData;

    const claimableSpeedPositions = allUserOpenSpeedMarketsData.filter((p) => p.isClaimable);
    const claimableSpeedPositionsSum = claimableSpeedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const claimableChainedPositions = chainedWithClaimableStatus.filter((p) => p.isClaimable);
    const claimableChainedPositionsSum = claimableChainedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const hasClaimableSpeedPositions = isChainedSelected
        ? !!claimableChainedPositions.length
        : !!claimableSpeedPositions.length;

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
                <Title>{t('speed-markets.user-positions.your-positions')}</Title>
                <Tabs>
                    <Tab $isSelected={!isChainedSelected} onClick={() => setIsChainedSelected(false)}>
                        {isMobile ? t('speed-markets.single') : t('speed-markets.user-positions.open-single')}
                        {claimableSpeedPositions.length > 0 && (
                            <Notification $isSelected={!isChainedSelected}>
                                {claimableSpeedPositions.length}
                            </Notification>
                        )}
                    </Tab>
                    <Tab $isSelected={isChainedSelected} onClick={() => setIsChainedSelected(true)}>
                        {isMobile ? t('speed-markets.chained.label') : t('speed-markets.user-positions.open-chained')}
                        {claimableChainedPositions.length > 0 && (
                            <Notification $isSelected={isChainedSelected}>
                                {claimableChainedPositions.length}
                            </Notification>
                        )}
                    </Tab>
                </Tabs>
                <TabsSeparator />
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
                                />
                            </CollateralSelectorContainer>
                        )}
                        {getClaimAllButton()}
                    </ButtonWrapper>
                )}
            </Header>
            <PositionsWrapper $noPositions={noPositions}>
                {isLoading ? (
                    <SimpleLoader />
                ) : isChainedSelected ? (
                    <TableChainedPositions data={sortedUserOpenChainedSpeedMarketsData} />
                ) : isMobile ? (
                    <CardPositions data={positions} />
                ) : (
                    <TablePositions data={positions} />
                )}
            </PositionsWrapper>
            {noPositions && <NoPositionsText>{t('speed-markets.user-positions.no-positions')}</NoPositionsText>}
        </Container>
    );
};

const sortSpeedMarkets = (markets: (UserPosition | ChainedSpeedMarket)[]) =>
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
        finalPrice: 0,
        isClaimable: false,
        isResolved: false,
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
        finalPrice: 0,
        isClaimable: false,
        isResolved: false,
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

const PositionsWrapper = styled.div<{ $noPositions?: boolean }>`
    position: relative;
    min-height: 200px;
    width: 100%;
    ${(props) => (props.$noPositions ? 'filter: blur(10px);' : '')}
`;

const Title = styled.span`
    display: none;
    font-weight: 700;
    font-size: 18px;
    line-height: 100%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: flex;
    }
`;

const ButtonWrapper = styled(FlexDivEnd)`
    gap: 70px;
    padding-right: 66px;
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

export default UserOpenPositions;
