import { Positions } from 'enums/market';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';
import { formatPercentage } from 'thales-utils';
import { AmmChainedSpeedMarketsLimits } from 'types/market';
import {
    ChainedPositions,
    ClearAll,
    Container,
    Icon,
    IconWrong,
    PlusIcon,
    PositionsSymbol,
    PositionWrapper,
    PositionWrapperChained,
    PositionsContainer,
    PositionsWrapper,
    Skew,
    Header,
    HeaderText,
    HeaderSubText,
} from './styled-components';

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
    const discount = skew[Positions.UP] > 0 ? skew[Positions.UP] / 2 : skew[Positions.DOWN] / 2;
    const isClearAllDisabled =
        selected.length === ammChainedSpeedMarketsLimits?.minChainedMarkets && selected.every((p) => p === undefined);

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
            <Container>
                {selected.length === 1 ? (
                    // Single
                    <>
                        <PositionWrapper
                            $isSelected={selected[0] !== undefined ? selected[0] === Positions.UP : undefined}
                            onClick={() => onChange(selected[0] === Positions.UP ? undefined : Positions.UP)}
                        >
                            <Icon className="icon icon--caret-up" />
                            {Positions.UP}

                            {discount > 0 && (
                                <Skew $isDiscount={skew[Positions.UP] > 0 ? false : discount > 0 ? true : undefined}>
                                    {skew[Positions.UP] > 0 ? '-' : discount > 0 ? '+' : ''}
                                    {formatPercentage(skew[Positions.UP] || discount)}
                                </Skew>
                            )}
                        </PositionWrapper>

                        <PositionWrapper
                            onClick={() => onChange(selected[0] === Positions.DOWN ? undefined : Positions.DOWN)}
                            $isSelected={selected[0] !== undefined ? selected[0] === Positions.DOWN : undefined}
                        >
                            <Icon className="icon icon--caret-down" />
                            {Positions.DOWN}
                            {discount > 0 && (
                                <Skew $isDiscount={skew[Positions.DOWN] > 0 ? false : discount > 0 ? true : undefined}>
                                    {skew[Positions.DOWN] > 0 ? '-' : discount > 0 ? '+' : ''}
                                    {formatPercentage(skew[Positions.DOWN] || discount)}
                                </Skew>
                            )}
                        </PositionWrapper>
                        <PlusIcon className="network-icon network-icon--plus" onClick={() => setIsChained(true)} />
                    </>
                ) : (
                    // Chained
                    <FlexDivColumnCentered>
                        <FlexDivSpaceBetween>
                            <PlusIcon
                                className="network-icon network-icon--minus"
                                onClick={() => {
                                    if (selected.length === 2) {
                                        setIsChained(false);
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
                                <PlusIcon
                                    className="network-icon network-icon--plus"
                                    onClick={() => {
                                        onChainedChange([...selected, undefined]);
                                    }}
                                />
                            )}
                        </FlexDivSpaceBetween>
                    </FlexDivColumnCentered>
                )}
            </Container>
        </div>
    );
};

export default SelectPosition;
