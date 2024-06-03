import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { millisecondsToSeconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { formatCurrencyWithSign, formatShortDate } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { formatHoursMinutesSecondsFromTimestamp, formatShortDateWithFullTime } from 'utils/formatters/date';
import { formatNumberShort } from 'utils/formatters/number';
import { getPriceId } from 'utils/pyth';
import { refetchPythPrice } from 'utils/queryConnector';
import { isUserWinner } from 'utils/speedAmm';
import { getColorPerPosition } from 'utils/style';
import { useChainId } from 'wagmi';
import ChainedPositionAction from '../ChainedPositionAction';
import { AssetIcon, Icon, PositionsSymbol } from '../SelectPosition/styled-components';
import { DirectionIcon } from '../TablePositions/TablePositions';

type ChainedPositionProps = {
    position: UserChainedPosition;
    maxPriceDelayForResolvingSec?: number;
    isOverview?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
    setIsClaimable?: (isClaimable: boolean) => void;
};

const ChainedPosition: React.FC<ChainedPositionProps> = ({
    position,
    maxPriceDelayForResolvingSec,
    isOverview,
    isAdmin,
    isSubmittingBatch,
    setIsClaimable,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [fetchLastFinalPriceIndex, setFetchLastFinalPriceIndex] = useState(0);

    const isMissingPrices = position.finalPrices.some((finalPrice) => !finalPrice);
    const maturedStrikeTimes = isMissingPrices
        ? position.strikeTimes.slice(0, fetchLastFinalPriceIndex + 1).filter((strikeTime) => strikeTime < Date.now())
        : position.strikeTimes;

    const pythPriceId = !position.isResolved ? getPriceId(networkId, position.currencyKey) : '';
    const priceRequests = !position.isResolved
        ? maturedStrikeTimes.map((strikeTime) => ({
              priceId: pythPriceId,
              publishTime: millisecondsToSeconds(strikeTime),
          }))
        : [];

    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, { enabled: !position.isResolved });

    const finalPrices =
        isMissingPrices && !position.isResolved
            ? position.finalPrices.map((_, i) => {
                  if (!pythPricesQueries[i]?.data) {
                      refetchPythPrice(pythPriceId, millisecondsToSeconds(maturedStrikeTimes[i]));
                  }
                  return pythPricesQueries[i]?.data || 0;
              })
            : position.finalPrices;
    const strikePrices =
        isMissingPrices && !position.isResolved
            ? position.strikePrices.map((strikePrice, i) =>
                  i > 0 && i <= fetchLastFinalPriceIndex ? finalPrices[i - 1] : strikePrice
              )
            : position.strikePrices;
    const userWonStatuses = position.sides.map((side, i) => isUserWinner(side, strikePrices[i], finalPrices[i]));
    const canResolve = position.isResolved
        ? position.canResolve
        : userWonStatuses.some((status) => status === false) || userWonStatuses.every((status) => status !== undefined);
    const isClaimable = useMemo(
        () => (position.isResolved ? position.isClaimable : userWonStatuses.every((status) => status)),
        [position.isResolved, position.isClaimable, userWonStatuses]
    );

    const positionWithPrices = {
        ...position,
        strikePrices,
        finalPrices,
        canResolve,
        isClaimable,
    };

    const size = useMemo(() => position.sides.length, [position.sides]);
    const userFirstLostIndex = userWonStatuses.findIndex((wonStatus) => wonStatus === false);
    const userFirstLostOrWonIndex = userFirstLostIndex > -1 ? userFirstLostIndex : size - 1;

    const statusDecisionIndex = positionWithPrices.isClaimable
        ? size - 1
        : position.isResolved
        ? userFirstLostOrWonIndex
        : fetchLastFinalPriceIndex;

    useEffect(() => {
        if (
            !position.isResolved &&
            !canResolve &&
            finalPrices[fetchLastFinalPriceIndex] &&
            fetchLastFinalPriceIndex < size
        ) {
            setFetchLastFinalPriceIndex(fetchLastFinalPriceIndex + 1);
        }
    }, [canResolve, finalPrices, size, position.isResolved, fetchLastFinalPriceIndex]);

    useEffect(() => {
        setIsClaimable && setIsClaimable(isClaimable);
    }, [setIsClaimable, isClaimable]);

    return (
        <Container>
            {isMobile ? (
                <AlignedFlex>
                    {isOverview && (
                        <FlexContainer>
                            <Text>{t('speed-markets.overview.user')}</Text>
                            <Text isActiveColor>{positionWithPrices.user}</Text>
                        </FlexContainer>
                    )}
                    <AssetIcon className={`currency-icon currency-icon--${position.currencyKey.toLowerCase()}`} />
                    <FlexContainer>
                        <Text>{positionWithPrices.currencyKey}</Text>
                        <Text isActiveColor>
                            {formatCurrencyWithSign(USD_SIGN, positionWithPrices.strikePrices[statusDecisionIndex])}
                        </Text>
                    </FlexContainer>
                    <FlexContainer>
                        <Text>{t('profile.final-price')}</Text>
                        <Text isActiveColor>
                            {positionWithPrices.finalPrices[statusDecisionIndex] ? (
                                formatCurrencyWithSign(USD_SIGN, positionWithPrices.finalPrices[statusDecisionIndex])
                            ) : (
                                <>
                                    {'. . .'}
                                    {positionWithPrices.canResolve && (
                                        <Tooltip overlay={t('speed-markets.tooltips.final-price-missing')} />
                                    )}
                                </>
                            )}
                        </Text>
                    </FlexContainer>
                    <FlexContainer>
                        <Text>{t('speed-markets.user-positions.end-time')}</Text>
                        <Text isActiveColor>
                            {formatShortDateWithFullTime(
                                positionWithPrices.canResolve
                                    ? positionWithPrices.strikeTimes[statusDecisionIndex]
                                    : positionWithPrices.maturityDate
                            )}
                        </Text>
                    </FlexContainer>
                    <FlexContainer>
                        <Text>{t('common.direction')}</Text>
                        {positionWithPrices.sides.map((side, i) => (
                            <Text key={i} color={getColorPerPosition(side, theme)}>
                                {side + (i !== positionWithPrices.sides.length - 1 ? ',' : '')}
                            </Text>
                        ))}
                    </FlexContainer>
                    <FlexContainer>
                        <Text>{t('speed-markets.user-positions.size')}</Text>
                        <Text isActiveColor>{formatNumberShort(positionWithPrices.payout)}</Text>
                    </FlexContainer>
                    <FlexContainer>
                        <Text>{t('speed-markets.user-positions.paid')}</Text>
                        <Text isActiveColor>{formatCurrencyWithSign(USD_SIGN, positionWithPrices.paid, 2)}</Text>
                    </FlexContainer>
                    <ChainedPositionAction
                        position={positionWithPrices}
                        maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                        isOverview={isOverview}
                        isAdmin={isAdmin}
                        isSubmittingBatch={isSubmittingBatch}
                    />
                </AlignedFlex>
            ) : (
                <>
                    <PositionInfo>
                        <Text lineHeight="30px">{t('speed-markets.user-positions.direction')}</Text>
                        <Text lineHeight="28px">{t('speed-markets.user-positions.end-time')}</Text>
                        <Text>{t('common.strike-price')}</Text>
                        <Text>{t('profile.final-price')}</Text>
                        <Text>{t('common.status-label')}</Text>
                    </PositionInfo>
                    <Separator />
                    <PositionDetails>
                        {positionWithPrices.sides.map((side, index) => {
                            const hasFinalPrice = position.finalPrices[index];
                            const isPositionLost = userFirstLostIndex > -1 && index === userFirstLostIndex;
                            const isPositionIrrelevant = userFirstLostIndex > -1 && index > userFirstLostIndex;
                            const isEmptyIcon = !hasFinalPrice || isPositionLost || isPositionIrrelevant;

                            return (
                                <Postion isDisabled={isPositionIrrelevant} key={index}>
                                    {side === Positions.UP ? (
                                        <PositionsSymbol size={30}>
                                            <DirectionIcon
                                                size={20}
                                                className={
                                                    isEmptyIcon ? 'icon icon--caret-up-empty' : 'icon icon--caret-up'
                                                }
                                                $alignUp={!isEmptyIcon}
                                                $alignEmptyUp={isEmptyIcon}
                                            />
                                        </PositionsSymbol>
                                    ) : (
                                        <PositionsSymbol size={30}>
                                            <DirectionIcon
                                                size={20}
                                                className={
                                                    isEmptyIcon
                                                        ? 'icon icon--caret-down-empty'
                                                        : 'icon icon--caret-down'
                                                }
                                            />
                                        </PositionsSymbol>
                                    )}
                                    <Text fontWeight={400} lineHeight="13px" padding="1px 0 0 0">
                                        {formatShortDate(positionWithPrices.strikeTimes[index])}
                                    </Text>
                                    <Text fontWeight={800} lineHeight="13px" padding="0 0 1px 0">
                                        {formatHoursMinutesSecondsFromTimestamp(positionWithPrices.strikeTimes[index])}
                                    </Text>
                                    {!isPositionIrrelevant && positionWithPrices.strikePrices[index] ? (
                                        <Text fontWeight={800} isActiveColor={!maturedStrikeTimes[index]}>
                                            {formatCurrencyWithSign(USD_SIGN, positionWithPrices.strikePrices[index])}
                                        </Text>
                                    ) : (
                                        <Dash />
                                    )}
                                    {!isPositionIrrelevant && positionWithPrices.finalPrices[index] ? (
                                        <Text fontWeight={800}>
                                            {formatCurrencyWithSign(USD_SIGN, positionWithPrices.finalPrices[index])}
                                        </Text>
                                    ) : !isPositionIrrelevant && !position.isResolved && maturedStrikeTimes[index] ? (
                                        <Text fontWeight={800} fontSize={16}>
                                            {'. . .'}
                                            <Tooltip overlay={t('speed-markets.tooltips.final-price-missing')} />
                                        </Text>
                                    ) : (
                                        <Dash />
                                    )}
                                    {!isPositionIrrelevant && userWonStatuses[index] !== undefined ? (
                                        <Text lineHeight="100%">
                                            <Icon
                                                size={userWonStatuses[index] ? 18 : 16}
                                                padding={userWonStatuses[index] ? undefined : '1px 0'}
                                                color={
                                                    userWonStatuses[index]
                                                        ? theme.textColor.quinary
                                                        : theme.error.textColor.primary
                                                }
                                                className={
                                                    userWonStatuses[index] ? 'icon icon--correct' : 'icon icon--wrong'
                                                }
                                            />
                                        </Text>
                                    ) : (
                                        <Dash />
                                    )}
                                </Postion>
                            );
                        })}
                    </PositionDetails>
                </>
            )}
        </Container>
    );
};

const Container = styled(FlexDivSpaceBetween)`
    background: ${(props) => props.theme.background.primary};
    border-bottom: 1px solid ${(props) => props.theme.borderColor.quaternary};
    min-height: 144px;
    width: 100%;
    padding: 10px;
    justify-content: flex-end;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 172px;
        padding: 10px 10px;
        margin-bottom: 10px;
        gap: 6px;
    }
`;

const PositionInfo = styled(FlexDivColumn)`
    max-width: 70px;
`;

const Text = styled.span<{
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: string;
    isActiveColor?: boolean;
    color?: string;
    padding?: string;
}>`
    font-size: ${(props) => (props.fontSize ? props.fontSize : '13')}px;
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '600')};
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '20px')};
    color: ${(props) =>
        props.color
            ? props.color
            : props.isActiveColor
            ? props.theme.textColor.primary
            : props.theme.textColor.primary};
    white-space: nowrap;
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        line-height: 100%;
    }
`;

const PositionDetails = styled(FlexDivStart)`
    width: 710px;
    gap: 10px;
`;

const Dash = styled.div`
    width: 14px;
    height: 3px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 3px;
    margin: 9px 0 8px 0;
`;

const Postion = styled(FlexDivColumnCentered)<{ isDisabled: boolean }>`
    position: relative;
    max-width: 110px;
    align-items: center;

    span,
    div {
        ${(props) => (props.isDisabled ? `opacity: 0.4;` : '')}
    }
`;

const Separator = styled.div`
    min-width: 2px;
    width: 2px;
    height: 110px;
    background: ${(props) => props.theme.borderColor.quaternary};
    border-radius: 3px;
    margin: 10px 60px 0px 10px;
`;

const AlignedFlex = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-end;
    width: 100%;
    flex-direction: column;
`;

const FlexContainer = styled(AlignedFlex)`
    gap: 4px;
    flex: 1;
    flex-direction: row;
    justify-content: center;
`;

export default ChainedPosition;
