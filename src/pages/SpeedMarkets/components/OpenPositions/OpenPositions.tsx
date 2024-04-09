import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { USD_SIGN } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { CollateralSelectorContainer, InLabel } from 'pages/Profile/components/MyPositionAction/MyPositionAction';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { ChainedSpeedMarket, UserOpenPositions } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { resolveAllChainedMarkets, resolveAllSpeedPositions } from 'utils/speedAmm';
import OpenPosition from '../OpenPosition';
import { useChainId, useAccount, useClient, useWalletClient } from 'wagmi';
import { getIsBiconomy } from 'redux/modules/wallet';
import biconomyConnector from 'utils/biconomyWallet';

type OpenPositionsProps = {
    isChained?: boolean;
    maxPriceDelayForResolvingSec?: number;
    currentPrices?: { [key: string]: number };
};

const OpenPositions: React.FC<OpenPositionsProps> = ({ isChained, maxPriceDelayForResolvingSec, currentPrices }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);

    const [isSubmitting, setIsSubmitting] = useState(false);
    // For sorting purpose as claimable status is unknown until all chained positions is rendered
    const [chainedClaimableStatuses, setChainedClaimableStatuses] = useState<
        { address: string; isClaimable: boolean }[]
    >([]);
    const [chainedWithClaimableStatus, setChainedWithClaimableStatus] = useState<ChainedSpeedMarket[]>([]);

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        {
            enabled: isAppReady && isConnected && !isChained,
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
            enabled: isAppReady && isConnected && !!isChained,
        }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            userChainedSpeedMarketsDataQuery.isSuccess && userChainedSpeedMarketsDataQuery.data
                ? userChainedSpeedMarketsDataQuery.data
                : [],
        [userChainedSpeedMarketsDataQuery]
    );

    // For chained sorting purpose
    const updateChainedClaimable = (address: string, isClaimable: boolean) => {
        const status = chainedClaimableStatuses.find((s) => s.address === address);
        if (status === undefined) {
            setChainedClaimableStatuses([...chainedClaimableStatuses, { address, isClaimable }]);
        } else if (status.isClaimable !== isClaimable) {
            setChainedClaimableStatuses(
                chainedClaimableStatuses.map((s) => (s.address === address ? { ...s, isClaimable } : s))
            );
        }
    };

    // For chained sorting purpose update claimable status when it is known
    useEffect(() => {
        if (userOpenChainedSpeedMarketsData.length === chainedClaimableStatuses.length) {
            let isStatusChanged = false;
            const chainedPositionsWithStatusUpdated: ChainedSpeedMarket[] = userOpenChainedSpeedMarketsData.map(
                (position) => {
                    const claimable = chainedClaimableStatuses.find((p) => p.address === position.address)?.isClaimable;
                    const claimableUpdated = chainedWithClaimableStatus.find((p) => p.address === position.address)
                        ?.claimable;

                    isStatusChanged =
                        isStatusChanged || (position.claimable !== claimable && claimableUpdated !== claimable);

                    return {
                        ...position,
                        claimable,
                    } as ChainedSpeedMarket;
                }
            );
            if (isStatusChanged) {
                setChainedWithClaimableStatus(chainedPositionsWithStatusUpdated);
            }
        }
    }, [userOpenChainedSpeedMarketsData, chainedWithClaimableStatus, chainedClaimableStatuses]);

    const sortSpeedMarkets = (markets: (UserOpenPositions | ChainedSpeedMarket)[]) =>
        markets
            // 1. sort open by maturity asc
            .filter((position) => position.maturityDate > Date.now())
            .sort((a, b) => a.maturityDate - b.maturityDate)
            .concat(
                // 2. sort claimable by maturity desc
                markets.filter((position) => position.claimable).sort((a, b) => b.maturityDate - a.maturityDate)
            )
            .concat(
                markets
                    // 3. sort lost by maturity desc
                    .filter((position) => position.maturityDate < Date.now() && !position.claimable)
                    .sort((a, b) => b.maturityDate - a.maturityDate)
            );

    const sortedUserOpenSpeedMarketsData = sortSpeedMarkets(userOpenSpeedMarketsData) as UserOpenPositions[];

    const sortedUserOpenChainedSpeedMarketsData = sortSpeedMarkets(
        chainedWithClaimableStatus.length ? chainedWithClaimableStatus : userOpenChainedSpeedMarketsData
    ) as ChainedSpeedMarket[];

    const noPositions = isChained
        ? userOpenChainedSpeedMarketsData.length === 0
        : userOpenSpeedMarketsData.length === 0;
    const positions = noPositions ? dummyPositions : sortedUserOpenSpeedMarketsData;

    const isLoading = userActiveSpeedMarketsDataQuery.isLoading || userChainedSpeedMarketsDataQuery.isLoading;

    const claimableSpeedPositions = userOpenSpeedMarketsData.filter((p) => p.claimable);
    const claimableSpeedPositionsSum = claimableSpeedPositions.reduce((acc, pos) => acc + pos.value, 0);

    const claimableChainedPositions = chainedWithClaimableStatus.filter((p) => p.claimable);
    const claimableChainedPositionsSum = claimableChainedPositions.reduce((acc, pos) => acc + pos.payout, 0);

    const hasClaimableSpeedPositions = isChained
        ? !!claimableChainedPositions.length
        : !!claimableSpeedPositions.length;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (isChained) {
            await resolveAllChainedMarkets(claimableChainedPositions, false, { networkId, client: walletClient.data });
        } else {
            await resolveAllSpeedPositions(claimableSpeedPositions, false, { networkId, client: walletClient.data });
        }
        setIsSubmitting(false);
    };

    const getClaimAllButton = () => (
        <Button
            {...getDefaultButtonProps(isMobile)}
            disabled={isSubmitting}
            additionalStyles={additionalButtonStyle}
            backgroundColor={theme.button.textColor.quaternary}
            onClick={handleSubmit}
        >
            {`${
                isSubmitting
                    ? t('speed-markets.user-positions.claim-all-progress')
                    : t('speed-markets.user-positions.claim-all')
            } ${formatCurrencyWithSign(
                USD_SIGN,
                isChained ? claimableChainedPositionsSum : claimableSpeedPositionsSum,
                2
            )}`}
        </Button>
    );

    return (
        <Wrapper>
            <Header>
                <Title>{t('speed-markets.user-positions.your-positions')}</Title>
                {hasClaimableSpeedPositions && (
                    <ButtonWrapper>
                        {getClaimAllButton()}
                        {isMultiCollateralSupported && (
                            <CollateralSelectorContainer>
                                <InLabel color={theme.button.textColor.quaternary}>{t('common.in')}</InLabel>
                                <CollateralSelector
                                    collateralArray={[getDefaultCollateral(networkId)]}
                                    selectedItem={0}
                                    onChangeCollateral={() => {}}
                                    disabled
                                    additionalStyles={{
                                        color: theme.button.textColor.quaternary,
                                    }}
                                />
                            </CollateralSelectorContainer>
                        )}
                    </ButtonWrapper>
                )}
            </Header>
            {isLoading ? (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
            ) : (
                <>
                    <PositionsWrapper $noPositions={noPositions} $isChained={isChained}>
                        {isChained && !noPositions
                            ? sortedUserOpenChainedSpeedMarketsData.map((position, index) => (
                                  <ChainedPosition
                                      position={position}
                                      maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                                      isMultipleMarkets={userOpenChainedSpeedMarketsData.length > 1}
                                      setIsClaimable={(isClaimable) =>
                                          updateChainedClaimable(position.address, isClaimable)
                                      }
                                      key={`position${position.address}${index}`}
                                  />
                              ))
                            : positions.map((position, index) => (
                                  <OpenPosition
                                      position={position}
                                      maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                                      currentPrices={currentPrices}
                                      isMultipleMarkets={positions.length > 3}
                                      key={`position${position.market}${position.positionAddress}${index}`}
                                  />
                              ))}
                    </PositionsWrapper>
                    {noPositions && <NoPositionsText>{t('speed-markets.user-positions.no-positions')}</NoPositionsText>}
                </>
            )}
        </Wrapper>
    );
};

const dummyPositions: UserOpenPositions[] = [
    {
        positionAddress: ZERO_ADDRESS,
        market: '0x1',
        currencyKey: 'BTC',
        payout: 15,
        paid: 100,
        maturityDate: 1684483200000,
        strikePrice: 25000,
        side: Positions.UP,
        value: 0,
    },
    {
        positionAddress: ZERO_ADDRESS,
        market: '0x2',
        currencyKey: 'BTC',
        payout: 10,
        paid: 200,
        maturityDate: 1684483200000,
        strikePrice: 35000,
        side: Positions.DOWN,
        value: 0,
    },
];

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const PositionsWrapper = styled.div<{ $noPositions?: boolean; $isChained?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${(props) => (props.$isChained ? '16' : '6')}px;
    overflow-y: auto;
    max-height: ${(props) => (props.$isChained ? '624' : '560')}px;
    ${(props) => (props.$noPositions ? 'filter: blur(10px);' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: row;
        overflow: auto;
    }
`;

const Header = styled(FlexDivRowCentered)`
    min-height: 37px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex: 1;
        flex-direction: column;
        align-items: start;
        justify-content: center;
    }
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 13px;
    line-height: 100%;
    margin-left: 20px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-left: 5px;
    }
`;

const ButtonWrapper = styled(FlexDivRow)`
    height: 27px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: 34px;
        margin-left: 5px;
        padding: 5px 0;
    }
`;

const getDefaultButtonProps = (isMobile: boolean) => ({
    width: isMobile ? '175px' : '220px',
    height: isMobile ? '24px' : '27px',
    fontSize: isMobile ? '12px' : '13px',
    padding: '0px 5px',
});

const additionalButtonStyle: CSSProperties = {
    lineHeight: '100%',
    border: 'none',
};

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 200px;
    width: 100%;
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

export default OpenPositions;
