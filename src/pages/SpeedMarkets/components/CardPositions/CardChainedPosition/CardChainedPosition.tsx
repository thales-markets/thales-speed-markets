import CollateralSelector from 'components/CollateralSelector';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { RootState } from 'types/ui';
import { getCollaterals } from 'utils/currency';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { useChainId } from 'wagmi';
import ChainedMarketPrice from '../../ChainedMarketPrice';
import ChainedPositionAction from '../../ChainedPositionAction';
import SharePosition from '../../SharePosition';
import { DirectionIcon } from '../../TablePositions/TablePositions';

type CardChainedPositionProps = {
    position: UserChainedPosition;
    isOverview?: boolean;
    maxPriceDelayForResolvingSec?: number;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
    onVisibilityChange?: React.Dispatch<boolean>;
};

const CardChainedPosition: React.FC<CardChainedPositionProps> = ({
    position,
    maxPriceDelayForResolvingSec,
    isOverview,
    isAdmin,
    isSubmittingBatch,
    onVisibilityChange,
}) => {
    const { t } = useTranslation();

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
        resolveIndex !== undefined
            ? position.strikeTimes[resolveIndex]
            : strikeTimeIndex > -1
            ? position.strikeTimes[strikeTimeIndex]
            : position.maturityDate;

    return (
        <Container ref={cardRef}>
            <Info>
                <InfoColumn>
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
                <InfoColumn>
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
                <ChainedPositionAction
                    position={position}
                    maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                    isOverview={isOverview}
                    isAdmin={isAdmin}
                    isSubmittingBatch={isSubmittingBatch}
                    isCollateralHidden
                    setIsActionInProgress={setIsActionInProgress}
                />
                {!isOverview && <SharePosition position={position} isChained />}
            </Action>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    justify-content: space-between;
    width: 100%;
    min-width: 100%;
    min-height: 155px;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 8px;
    padding: 14px 10px;
`;

const Info = styled(FlexDivRow)`
    height: 100%;
`;

const InfoColumn = styled(FlexDivColumn)`
    gap: 6px;

    &:first-child {
        min-width: 214px;
    }
`;

const InfoRow = styled(FlexDivStart)`
    align-items: center;
`;

const Action = styled(FlexDivSpaceBetween)``;

const Text = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 800;
    line-height: 13px;
`;

const Label = styled(Text)`
    color: ${(props) => props.theme.textColor.quinary};
    font-weight: 500;
    margin-right: 5px;
`;

const Value = styled(Text)<{ $color?: string }>`
    ${(props) => (props.$color ? `color: ${props.$color};` : '')}
`;

const DirectionsWrapper = styled(FlexDivCentered)`
    gap: 10px;
`;

export default CardChainedPosition;
