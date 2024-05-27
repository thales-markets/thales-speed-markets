import OutsideClickHandler from 'components/OutsideClick';
import { USD_SIGN } from 'constants/currency';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { Coins, formatCurrencyWithSign } from 'thales-utils';
import { isStableCurrency } from 'utils/currency';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
    disabled?: boolean;
    isDetailedView?: boolean;
    collateralBalances?: any;
    exchangeRates?: Rates | null;
    dropDownWidth?: string;
    additionalStyles?: CSSProperties;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
    disabled,
    isDetailedView,
    collateralBalances,
    exchangeRates,
    dropDownWidth,
    additionalStyles,
}) => {
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);

    const getUSDForCollateral = useCallback(
        (collateral: Coins) =>
            (collateralBalances ? collateralBalances[collateral] : 0) *
            (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0),
        [collateralBalances, exchangeRates]
    );

    const collateralsDetailsSorted = useMemo(() => {
        const mappedCollaterals = collateralArray.map((collateral, index) => ({ name: collateral as Coins, index }));
        if (!isDetailedView) {
            return mappedCollaterals;
        }
        return mappedCollaterals.sort(
            (collateralA, collateralB) => getUSDForCollateral(collateralB.name) - getUSDForCollateral(collateralA.name)
        );
    }, [collateralArray, isDetailedView, getUSDForCollateral]);

    disabled = disabled || collateralArray.length === 1;

    return (
        <Container margin={additionalStyles?.margin?.toString()} position={additionalStyles?.position}>
            <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
                <SelectedCollateral disabled={!!disabled} onClick={() => !disabled && setOpen(!open)}>
                    <TextCollateralWrapper>
                        <AssetIcon
                            className={`currency-icon currency-icon--${collateralArray[selectedItem].toLowerCase()}`}
                        />
                        <SelectedTextCollateral color={additionalStyles?.color}>
                            {collateralArray[selectedItem]}
                        </SelectedTextCollateral>
                    </TextCollateralWrapper>
                    {collateralArray.length > 1 && (
                        <Arrow
                            color={additionalStyles?.color}
                            className={open ? `icon icon--caret-up` : `icon icon--caret-down`}
                        />
                    )}
                </SelectedCollateral>
                {isDetailedView
                    ? open && (
                          <DetailedDropdown width={dropDownWidth} onClick={() => setOpen(!open)}>
                              {collateralsDetailsSorted.map((collateral, i) => {
                                  return (
                                      <DetailedCollateralOption
                                          key={i}
                                          onClick={() => {
                                              onChangeCollateral(collateral.index);
                                              dispatch(setSelectedCollateralIndex(collateral.index));
                                          }}
                                      >
                                          <div>
                                              <Icon
                                                  className={`currency-icon currency-icon--${collateral.name.toLowerCase()}`}
                                              />
                                              <TextCollateral fontWeight="400">{collateral.name}</TextCollateral>
                                          </div>
                                          <div>
                                              <TextCollateral fontWeight="400">
                                                  {formatCurrencyWithSign(
                                                      null,
                                                      collateralBalances ? collateralBalances[collateral.name] : 0
                                                  )}
                                              </TextCollateral>
                                              <TextCollateral fontWeight="800">
                                                  {!exchangeRates?.[collateral.name] &&
                                                  !isStableCurrency(collateral.name as Coins)
                                                      ? '...'
                                                      : ` (${formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            getUSDForCollateral(collateral.name as Coins)
                                                        )})`}
                                              </TextCollateral>
                                          </div>
                                      </DetailedCollateralOption>
                                  );
                              })}
                          </DetailedDropdown>
                      )
                    : open && (
                          <Dropdown width={dropDownWidth} onClick={() => setOpen(!open)}>
                              {collateralArray.map((collateral, index) => {
                                  return (
                                      <CollateralOption
                                          key={index}
                                          onClick={() => {
                                              onChangeCollateral(index);
                                              dispatch(setSelectedCollateralIndex(index));
                                          }}
                                      >
                                          <TextCollateral>{collateral}</TextCollateral>
                                      </CollateralOption>
                                  );
                              })}
                          </Dropdown>
                      )}
            </OutsideClickHandler>
        </Container>
    );
};

const Container = styled(FlexDivStart)<{ margin?: string; position?: string }>`
    position: relative;
    margin: ${(props) => (props.margin ? props.margin : '0 7px')};
    align-items: center;
`;

const Text = styled.span<{ fontWeight?: string }>`
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '600')};
    font-size: 13px;
    line-height: 20px;
`;

const TextCollateral = styled(Text)<{ color?: string }>`
    color: ${(props) => (props.color ? props.color : props.theme.dropDown.textColor.primary)};
    font-weight: 700;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const SelectedTextCollateral = styled(TextCollateral)`
    color: ${(props) => (props.color ? props.color : props.theme.dropDown.textColor.primary)};
    margin-right: 4px;
`;

const TextCollateralWrapper = styled.div`
    min-width: 45px;
    white-space: pre;
`;

const Arrow = styled.i<{ color?: string }>`
    font-size: 10px;
    text-transform: none;
    color: ${(props) => (props.color ? props.color : props.theme.dropDown.textColor.primary)};
`;

const SelectedCollateral = styled(FlexDivRowCentered)<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;

const Dropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    top: 12px;
    margin-top: 8px;
    margin-left: -10px;
    width: ${(props) => (props.width ? props.width : '71px')};
    padding: 5px 3px;
    border-radius: 8px;
    border: 2px solid ${(props) => props.theme.dropDown.background.secondary};
    background: ${(props) => props.theme.dropDown.background.primary};
    z-index: 100;
`;

const DetailedDropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    top: 34px;
    right: -9px;
    width: ${(props) => (props.width ? props.width : '340px')};
    padding: 5px 3px;
    border-radius: 8px;
    border: 2px solid ${(props) => props.theme.dropDown.background.secondary};
    background: ${(props) => props.theme.dropDown.background.primary};
    z-index: 100;
`;

const CollateralOption = styled.div`
    display: flex;
    align-items: center;
    padding: 5px 7px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        ${TextCollateral} {
            color: ${(props) => props.theme.dropDown.textColor.secondary};
        }
    }
`;

const Icon = styled.i`
    font-size: 25px;
    line-height: 100%;
    margin-right: 10px;
    background: ${(props) => props.theme.dropDown.background.primary};
    color: ${(props) => props.theme.dropDown.textColor.primary};
    border-radius: 50%;
`;

const AssetIcon = styled(Icon)`
    font-size: 20px;
    margin-right: 4px;
`;

const DetailedCollateralOption = styled(FlexDivSpaceBetween)`
    padding: 5px 24px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        ${Icon}, ${TextCollateral} {
            color: ${(props) => props.theme.dropDown.textColor.secondary};
        }
    }
`;

export default CollateralSelector;
