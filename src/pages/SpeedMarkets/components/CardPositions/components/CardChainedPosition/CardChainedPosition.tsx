import CollateralSelector from 'components/CollateralSelector';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { getCollaterals } from 'utils/currency';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { getHistoryStatus } from 'utils/position';
import { getStatusColor } from 'utils/style';
import { useChainId } from 'wagmi';
import ChainedMarketPrice from '../../../ChainedMarketPrice';
import ChainedPositionAction from '../../../ChainedPositionAction';
import SharePosition from '../../../SharePosition';
import { DirectionIcon } from '../../../UserOpenPositions/components/TablePositions/TablePositions';
import { Action, Info, InfoColumn, InfoRow, Label, Value } from '../CardPosition/CardPosition';

type CardChainedPositionProps = {
    position: UserChainedPosition;
    maxPriceDelayForResolvingSec?: number;
    isOverview?: boolean;
    isHistory?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
    onVisibilityChange?: React.Dispatch<boolean>;
};

const CardChainedPosition: React.FC<CardChainedPositionProps> = ({
    position,
    maxPriceDelayForResolvingSec,
    isOverview,
    isHistory,
    isAdmin,
    isSubmittingBatch,
    onVisibilityChange,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);
    const [resolveIndex, setResolveindex] = useState(position.resolveIndex);
    const [isActionInProgress, setIsActionInProgress] = useState(false);

    useInterval(() => {
        if (Date.now() > position.maturityDate) {
            if (!isMatured) {
                setIsMatured(true);
            }
        }
    }, secondsToMilliseconds(10));

    // when new position is added, refresh maturity status
    useEffect(() => {
        setIsMatured(Date.now() > position.maturityDate);
    }, [position.maturityDate]);

    // refresh resolve index
    useEffect(() => {
        setResolveindex(position.resolveIndex);
    }, [position.resolveIndex]);

    const cardRef = useRef<HTMLDivElement>(null);

    // check visibility of card element in the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                onVisibilityChange && onVisibilityChange(entry.isIntersecting);
            },
            {
                root: null, // viewport
                rootMargin: '0px', // no margin
                threshold: 0.5, // 50% of target visible
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        // Clean up the observer
        const cardRefElement = cardRef.current;
        return () => {
            if (cardRefElement) {
                observer.unobserve(cardRefElement);
            }
        };
    }, [onVisibilityChange]);

    const strikeTimeIndex = position.strikeTimes.findIndex((t) => t > Date.now());
    const endTime =
        position.isResolved && position.resolveIndex !== undefined
            ? position.strikeTimes[position.resolveIndex]
            : resolveIndex !== undefined
            ? position.strikeTimes[resolveIndex]
            : strikeTimeIndex > -1
            ? position.strikeTimes[strikeTimeIndex]
            : position.maturityDate;

    const historyStatus = isHistory ? getHistoryStatus(position) : undefined;

    return (
        <Container ref={cardRef} $borderColor={historyStatus && getStatusColor(historyStatus, theme)}>
            <Info>
                <InfoColumn $isChainedHistory={isHistory}>
                    <InfoRow>
                        <Label>{t('common.market')}:</Label>
                        <Value>
                            {position.currencyKey} <ChainedMarketPrice position={position} isStrikePrice />
                        </Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>
                            {resolveIndex !== undefined || isMatured
                                ? t('speed-markets.user-positions.price')
                                : t('speed-markets.user-positions.current-price')}
                            :
                        </Label>
                        <Value>
                            <ChainedMarketPrice position={position} />
                        </Value>
                    </InfoRow>
                    {isHistory && (
                        <InfoRow>
                            <Label>{t('speed-markets.user-positions.created')}:</Label>
                            <Value>{formatShortDateWithFullTime(position.createdAt)}</Value>
                        </InfoRow>
                    )}
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.end-time')}:</Label>
                        <Value>{formatShortDateWithFullTime(endTime)}</Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>{t('speed-markets.chained.directions')}:</Label>
                        <DirectionsWrapper>
                            {position.sides.map((side, index) => {
                                const hasFinalPrice = position.finalPrices[index];
                                const isPositionLost = !position.isClaimable && index === resolveIndex;
                                const isPositionIrrelevant =
                                    !position.isClaimable && resolveIndex !== undefined && index > resolveIndex;
                                const isEmptyIcon = !hasFinalPrice || isPositionLost || isPositionIrrelevant;

                                return (
                                    <DirectionIcon
                                        key={index}
                                        className={
                                            isEmptyIcon
                                                ? `icon icon--caret-${side.toLowerCase()}-empty`
                                                : `icon icon--caret-${side.toLowerCase()}`
                                        }
                                        size={25}
                                        isDisabled={isPositionIrrelevant}
                                        $alignUp={!isEmptyIcon && side === Positions.UP}
                                        $alignEmptyUp={isEmptyIcon && side === Positions.UP}
                                    />
                                );
                            })}
                        </DirectionsWrapper>
                    </InfoRow>
                </InfoColumn>
                <InfoColumn $isChainedHistory={isHistory}>
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.paid')}:</Label>
                        <Value>{formatCurrencyWithSign(USD_SIGN, position.paid)}</Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.payout')}:</Label>
                        <Value>{formatCurrencyWithSign(USD_SIGN, position.payout)}</Value>
                    </InfoRow>
                    {position.isClaimable && (
                        <InfoRow>
                            <Label>{t('speed-markets.user-positions.claim-in')}:</Label>
                            <CollateralSelector
                                collateralArray={getCollaterals(networkId)}
                                selectedItem={selectedCollateralIndex}
                                onChangeCollateral={() => {}}
                                disabled={isActionInProgress}
                                isIconHidden
                                additionalStyles={{ margin: '0' }}
                            />
                        </InfoRow>
                    )}
                </InfoColumn>
            </Info>
            <Action>
                {historyStatus ? (
                    <Value $alignCenter $hasShare={position.canResolve} $color={getStatusColor(historyStatus, theme)}>
                        {historyStatus}
                    </Value>
                ) : (
                    <ChainedPositionAction
                        position={position}
                        maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                        isOverview={isOverview}
                        isAdmin={isAdmin}
                        isSubmittingBatch={isSubmittingBatch}
                        isCollateralHidden
                        setIsActionInProgress={setIsActionInProgress}
                    />
                )}
                {!isOverview && <SharePosition position={position} isChained />}
            </Action>
        </Container>
    );
};

const Container = styled(FlexDivColumn)<{ $borderColor?: string }>`
    justify-content: space-between;
    width: 100%;
    min-width: 100%;
    min-height: 155px;
    border: 1px solid ${(props) => (props.$borderColor ? props.$borderColor : props.theme.borderColor.quaternary)};
    border-radius: 8px;
    padding: 14px 10px;
`;

const DirectionsWrapper = styled(FlexDivCentered)`
    gap: 10px;
`;

export default CardChainedPosition;
