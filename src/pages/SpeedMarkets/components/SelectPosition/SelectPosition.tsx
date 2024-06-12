import Tooltip from 'components/Tooltip';
import { Positions } from 'enums/market';
import queryString from 'query-string';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';
import { formatPercentage } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { history } from 'utils/routes';
import {
    ChainedPositions,
    ClearAll,
    Header,
    HeaderSubText,
    HeaderText,
    Icon,
    IconWrong,
    PlusMinusIcon,
    PositionContainer,
    PositionWrapper,
    PositionWrapperChained,
    PositionsContainer,
    PositionsSymbol,
    PositionsWrapper,
    Bonus,
} from './styled-components';

export type SelectedPosition = Positions.UP | Positions.DOWN | undefined;

type SelectPositionProps = {
    selected: SelectedPosition[];
    onChange: React.Dispatch<SelectedPosition>;
    onChainedChange: React.Dispatch<SelectedPosition[]>;
    setIsChained: React.Dispatch<React.SetStateAction<boolean>>;
    resetData: React.Dispatch<void>;
    profitAndSkewPerPosition: {
        profit: { [Positions.UP]: number; [Positions.DOWN]: number };
        skew: { [Positions.UP]: number; [Positions.DOWN]: number };
    };
};

const SelectPosition: React.FC<SelectPositionProps> = ({
    selected,
    onChange,
    onChainedChange,
    setIsChained,
    resetData,
    profitAndSkewPerPosition,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    /*
     * Calculate ROI bonus as:
     * ROI on UP = 60%
     * ROI on DOWN = 70%
     * ROI Bonus = (70 - 60) / 60 = 16.67%
     */
    const profit = profitAndSkewPerPosition.profit;
    const skew = profitAndSkewPerPosition.skew;
    const bonusPercentage = {
        [Positions.UP]:
            profit[Positions.UP] > profit[Positions.DOWN]
                ? (profit[Positions.UP] - profit[Positions.DOWN]) / (profit[Positions.DOWN] - 1)
                : 0,
        [Positions.DOWN]:
            profit[Positions.DOWN] > profit[Positions.UP]
                ? (profit[Positions.DOWN] - profit[Positions.UP]) / (profit[Positions.UP] - 1)
                : 0,
    };

    const onPlusMinusIconHandle = (isChained: boolean) => {
        setIsChained(isChained);
        resetData();
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({
                isChained: isChained,
            }),
        });
    };

    const onClearAllHandle = () => {
        setIsChained(false);
        resetData();
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({
                isChained: false,
            }),
        });
    };

    const getBonusTooltip = (isBonusUnknown: boolean, direction: Positions, bonus: string) => (
        <Tooltip
            overlay={
                <Trans
                    i18nKey={
                        isBonusUnknown ? 'speed-markets.tooltips.bonus-unknown' : 'speed-markets.tooltips.bonus-info'
                    }
                    components={{
                        br: <br />,
                    }}
                    values={{ bonusDirection: direction, bonusPerc: bonus }}
                />
            }
            customIconStyling={{ fontSize: '11px', color: theme.textColor.quaternary }}
        />
    );

    return (
        <div>
            <Header>
                <FlexDivSpaceBetween>
                    <HeaderText> {t('speed-markets.steps.choose-direction')}</HeaderText>
                    {selected.length > 1 && (
                        <ClearAll onClick={onClearAllHandle}>
                            {t('speed-markets.chained.clear-all')}
                            <IconWrong className="icon icon--wrong" />
                        </ClearAll>
                    )}
                </FlexDivSpaceBetween>

                <HeaderSubText> {t('speed-markets.steps.choose-direction-sub')}</HeaderSubText>
            </Header>
            <PositionContainer>
                {selected.length === 1 ? (
                    // Single
                    <>
                        <PositionWrapper
                            $isSelected={selected[0] === Positions.UP}
                            onClick={() => onChange(selected[0] === Positions.UP ? undefined : Positions.UP)}
                        >
                            <Icon className="icon icon--caret-up" />
                            {Positions.UP}

                            {(bonusPercentage[Positions.UP] > 0 || skew[Positions.DOWN] > 0) && (
                                <Bonus $isSelected={selected[0] === Positions.UP}>
                                    {bonusPercentage[Positions.UP]
                                        ? `+${formatPercentage(bonusPercentage[Positions.UP])}`
                                        : t('common.bonus')}
                                    {getBonusTooltip(
                                        bonusPercentage[Positions.UP] === 0,
                                        Positions.UP,
                                        formatPercentage(bonusPercentage[Positions.UP])
                                    )}
                                </Bonus>
                            )}
                        </PositionWrapper>

                        <PositionWrapper
                            onClick={() => onChange(selected[0] === Positions.DOWN ? undefined : Positions.DOWN)}
                            $isSelected={selected[0] === Positions.DOWN}
                        >
                            <Icon className="icon icon--caret-down" />
                            {Positions.DOWN}

                            {(bonusPercentage[Positions.DOWN] > 0 || skew[Positions.UP] > 0) && (
                                <Bonus $isSelected={selected[0] === Positions.DOWN}>
                                    {bonusPercentage[Positions.DOWN]
                                        ? `+${formatPercentage(bonusPercentage[Positions.DOWN])}`
                                        : t('common.bonus')}
                                    {getBonusTooltip(
                                        bonusPercentage[Positions.DOWN] === 0,
                                        Positions.DOWN,
                                        formatPercentage(bonusPercentage[Positions.DOWN])
                                    )}
                                </Bonus>
                            )}
                        </PositionWrapper>
                        <PlusMinusIcon
                            className="network-icon network-icon--plus"
                            onClick={() => onPlusMinusIconHandle(true)}
                        />
                    </>
                ) : (
                    // Chained
                    <FlexDivColumnCentered>
                        <FlexDivSpaceBetween>
                            <PlusMinusIcon
                                className="network-icon network-icon--minus"
                                onClick={() => {
                                    if (selected.length === 2) {
                                        onPlusMinusIconHandle(false);
                                    } else {
                                        onChainedChange(selected.slice(0, selected.length - 1));
                                    }
                                }}
                            />
                            <ChainedPositions>
                                {selected.map((position, index) => {
                                    const isUpSelected = position !== undefined ? position === Positions.UP : undefined;
                                    const isDownSelected =
                                        position !== undefined ? position === Positions.DOWN : undefined;
                                    return (
                                        <PositionsContainer key={index}>
                                            <PositionsWrapper>
                                                <PositionWrapperChained
                                                    $isSelected={isUpSelected}
                                                    onClick={() =>
                                                        onChainedChange(
                                                            selected.map((pos, i) =>
                                                                i === index
                                                                    ? pos === Positions.UP
                                                                        ? undefined
                                                                        : Positions.UP
                                                                    : pos
                                                            )
                                                        )
                                                    }
                                                >
                                                    <PositionsSymbol $isSelected={isUpSelected}>
                                                        <Icon className="icon icon--caret-up" />
                                                    </PositionsSymbol>
                                                </PositionWrapperChained>
                                                <PositionWrapperChained
                                                    $isSelected={isDownSelected}
                                                    onClick={() =>
                                                        onChainedChange(
                                                            selected.map((pos, i) =>
                                                                i === index
                                                                    ? pos === Positions.DOWN
                                                                        ? undefined
                                                                        : Positions.DOWN
                                                                    : pos
                                                            )
                                                        )
                                                    }
                                                >
                                                    <PositionsSymbol $isSelected={isDownSelected}>
                                                        <Icon className="icon icon--caret-down" />
                                                    </PositionsSymbol>
                                                </PositionWrapperChained>
                                            </PositionsWrapper>
                                        </PositionsContainer>
                                    );
                                })}
                            </ChainedPositions>
                            {selected.length !== 6 && (
                                <PlusMinusIcon
                                    className="network-icon network-icon--plus"
                                    onClick={() => {
                                        onChainedChange([...selected, undefined]);
                                    }}
                                />
                            )}
                        </FlexDivSpaceBetween>
                    </FlexDivColumnCentered>
                )}
            </PositionContainer>
        </div>
    );
};

export default SelectPosition;
