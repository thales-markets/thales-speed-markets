import Tooltip from 'components/Tooltip';
import { Positions } from 'enums/market';
import queryString from 'query-string';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';
import { formatPercentage } from 'thales-utils';
import { AmmChainedSpeedMarketsLimits } from 'types/market';
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
    Skew,
} from './styled-components';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

export type SelectedPosition = Positions.UP | Positions.DOWN | undefined;

type SelectPositionProps = {
    selected: SelectedPosition[];
    onChange: React.Dispatch<SelectedPosition>;
    onChainedChange: React.Dispatch<SelectedPosition[]>;
    setIsChained: React.Dispatch<React.SetStateAction<boolean>>;
    ammChainedSpeedMarketsLimits: AmmChainedSpeedMarketsLimits | null;
    skew: { [Positions.UP]: number; [Positions.DOWN]: number };
};

const SelectPosition: React.FC<SelectPositionProps> = ({
    selected,
    onChange,
    onChainedChange,
    setIsChained,
    ammChainedSpeedMarketsLimits,
    skew,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const discount = { [Positions.UP]: skew[Positions.DOWN] / 2, [Positions.DOWN]: skew[Positions.UP] / 2 };
    const isClearAllDisabled =
        selected.length === ammChainedSpeedMarketsLimits?.minChainedMarkets && selected.every((p) => p === undefined);

    const onPlusMinusIconHandle = (isChained: boolean) => {
        setIsChained(isChained);
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({
                isChained: isChained,
            }),
        });
    };

    const getSkewTooltip = () => (
        <Tooltip
            overlay={
                <Trans
                    i18nKey="speed-markets.tooltips.skew-info"
                    components={{
                        br: <br />,
                    }}
                    values={{
                        skewDirection: skew[Positions.UP] > 0 ? Positions.UP : Positions.DOWN,
                        skewPerc: formatPercentage(skew[Positions.UP] > 0 ? skew[Positions.UP] : skew[Positions.DOWN]),
                        discountDirection: skew[Positions.DOWN] > 0 ? Positions.UP : Positions.DOWN,
                        discountPerc: formatPercentage(
                            discount[skew[Positions.DOWN] > 0 ? Positions.UP : Positions.DOWN]
                        ),
                    }}
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
                    {selected.length > 2 && (
                        <ClearAll
                            isDisabled={isClearAllDisabled}
                            onClick={() =>
                                !isClearAllDisabled &&
                                onChainedChange(Array(ammChainedSpeedMarketsLimits?.minChainedMarkets).fill(undefined))
                            }
                        >
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

                            {discount[Positions.UP] > 0 && (
                                <Skew $isSelected={selected[0] === Positions.UP}>
                                    +{formatPercentage(discount[Positions.UP])}
                                    {getSkewTooltip()}
                                </Skew>
                            )}
                        </PositionWrapper>

                        <PositionWrapper
                            onClick={() => onChange(selected[0] === Positions.DOWN ? undefined : Positions.DOWN)}
                            $isSelected={selected[0] === Positions.DOWN}
                        >
                            <Icon className="icon icon--caret-down" />
                            {Positions.DOWN}

                            {discount[Positions.DOWN] > 0 && (
                                <Skew $isSelected={selected[0] === Positions.DOWN}>
                                    +{formatPercentage(discount[Positions.DOWN])}
                                    {getSkewTooltip()}
                                </Skew>
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
