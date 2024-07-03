import CollateralSelector from 'components/CollateralSelector';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import PositionAction from 'pages/SpeedMarkets/components/PositionAction';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { getCollaterals } from 'utils/currency';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { getHistoryStatus, mapUserPositionToHistory } from 'utils/position';
import { getColorPerPosition, getStatusColor } from 'utils/style';
import { useChainId } from 'wagmi';
import MarketPrice from '../../../MarketPrice';
import SharePosition from '../../../SharePosition';

type CardPositionProps = {
    position: UserPosition;
    maxPriceDelayForResolvingSec?: number;
    isOverview?: boolean;
    isHistory?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
    onVisibilityChange?: React.Dispatch<boolean>;
};

const CardPosition: React.FC<CardPositionProps> = ({
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

    const historyStatus = isHistory ? getHistoryStatus(mapUserPositionToHistory(position)) : undefined;

    return (
        <Container ref={cardRef} $borderColor={historyStatus && getStatusColor(historyStatus, theme)}>
            <Info>
                <InfoColumn>
                    <InfoRow>
                        <Label>{t('common.market')}:</Label>
                        <Value>
                            {position.currencyKey} {formatCurrencyWithSign(USD_SIGN, position.strikePrice)}{' '}
                            <Value $color={getColorPerPosition(position.side, theme)}>{position.side}</Value>
                        </Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>
                            {isMatured
                                ? t('speed-markets.user-positions.price')
                                : t('speed-markets.user-positions.current-price')}
                            :
                        </Label>
                        <Value>
                            <MarketPrice position={position} />
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
                        <Value>{formatShortDateWithFullTime(position.maturityDate)}</Value>
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
                    {position.isClaimable && !isOverview && (
                        <InfoRow>
                            <Label>{t('speed-markets.user-positions.claim-in')}:</Label>
                            <CollateralSelector
                                collateralArray={getCollaterals(networkId)}
                                selectedItem={selectedCollateralIndex}
                                onChangeCollateral={() => {}}
                                disabled={isActionInProgress}
                                isIconHidden
                                additionalStyles={{ margin: '0' }}
                                invertCollors
                            />
                        </InfoRow>
                    )}
                </InfoColumn>
            </Info>
            <Action>
                {historyStatus ? (
                    <Value
                        $alignCenter
                        $hasShare={position.isClaimable || !isMatured}
                        $color={getStatusColor(historyStatus, theme)}
                    >
                        {historyStatus}
                    </Value>
                ) : (
                    <PositionAction
                        position={position}
                        maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                        isOverview={isOverview}
                        isAdmin={isAdmin}
                        isSubmittingBatch={isSubmittingBatch}
                        isCollateralHidden
                        setIsActionInProgress={setIsActionInProgress}
                    />
                )}
                {!isOverview && <SharePosition position={position} />}
            </Action>
        </Container>
    );
};

const Container = styled(FlexDivColumn)<{ $borderColor?: string }>`
    justify-content: space-between;
    width: 100%;
    min-width: 100%;
    min-height: 123px;
    border: 1px solid ${(props) => (props.$borderColor ? props.$borderColor : props.theme.borderColor.primary)};
    border-radius: 8px;
    padding: 14px 10px;
`;

export const Info = styled(FlexDivRow)`
    height: 100%;
`;

export const InfoColumn = styled(FlexDivColumn)<{ $isChainedHistory?: boolean }>`
    gap: ${(props) => (props.$isChainedHistory ? '5px' : '6px')};

    &:first-child {
        min-width: 214px;
    }
`;

export const InfoRow = styled(FlexDivStart)`
    align-items: center;
`;

export const Action = styled(FlexDivSpaceBetween)``;

export const Text = styled.span`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 13px;
    font-weight: 800;
    line-height: 13px;
`;

export const Label = styled(Text)`
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 500;
    margin-right: 5px;
`;

export const Value = styled(Text)<{ $color?: string; $alignCenter?: boolean; $hasShare?: boolean }>`
    ${(props) => (props.$color ? `color: ${props.$color};` : '')}
    ${(props) => (props.$alignCenter ? 'width: 100%;;' : '')}
    ${(props) => (props.$alignCenter ? 'text-align: center;' : '')}
    ${(props) => (props.$alignCenter ? 'text-align: center;' : '')}
    ${(props) => (props.$hasShare ? 'padding-left: 20px;' : '')}
`;

export default CardPosition;
