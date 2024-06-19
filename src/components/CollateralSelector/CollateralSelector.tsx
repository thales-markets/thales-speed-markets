import OutsideClickHandler from 'components/OutsideClick';
import { USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { Coins, formatCurrencyWithSign } from 'thales-utils';
import { isStableCurrency } from 'utils/currency';

type CollateralSelectorProps = {
    collateralArray: Array<Coins>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
    disabled?: boolean;
    isDetailedView?: boolean;
    isIconHidden?: boolean;
    collateralBalances?: any;
    exchangeRates?: Rates | null;
    dropDownWidth?: string;
    additionalStyles?: CSSProperties;
    invertCollors?: boolean;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
    disabled,
    isDetailedView,
    isIconHidden,
    collateralBalances,
    exchangeRates,
    dropDownWidth,
    additionalStyles,
    invertCollors,
}) => {
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);

    const getUSDForCollateral = useCallback(
        (collateral: Coins) =>
            (collateralBalances ? collateralBalances[collateral] : 0) *
            (isStableCurrency(collateral) ? 1 : exchangeRates?.[collateral] || 0),
        [collateralBalances, exchangeRates]
    );

    const collateralsDetailsSorted = useMemo(() => {
        const mappedCollaterals = collateralArray.map((collateral, index) => ({ name: collateral, index }));
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
                <SelectedCollateral
                    disabled={!!disabled}
                    onClick={() => !disabled && setOpen(!open)}
                    className="clickable"
                >
                    {!isIconHidden && (
                        <AssetIcon
                            className={`currency-icon currency-icon--${collateralArray[selectedItem].toLowerCase()}`}
                        />
                    )}
                    <SelectedTextCollateral invertCollors={invertCollors}>
                        {collateralArray[selectedItem]}
                    </SelectedTextCollateral>
                    {collateralArray.length > 1 && (
                        <Arrow
                            invertCollors={invertCollors}
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
                                          invertCollors={invertCollors}
                                      >
                                          {collateralArray[selectedItem] === collateral.name && <SelectedIndicator />}
                                          <div>
                                              <Icon
                                                  invertCollors={invertCollors}
                                                  className={`currency-icon currency-icon--${collateral.name.toLowerCase()}`}
                                              />
                                              <TextCollateral invertCollors={invertCollors} fontWeight="400">
                                                  {collateral.name}
                                              </TextCollateral>
                                          </div>
                                          <div>
                                              <TextCollateral invertCollors={invertCollors} fontWeight="400">
                                                  {formatCurrencyWithSign(
                                                      null,
                                                      collateralBalances ? collateralBalances[collateral.name] : 0
                                                  )}
                                              </TextCollateral>
                                              <TextCollateral invertCollors={invertCollors} fontWeight="800">
                                                  {!exchangeRates?.[collateral.name] &&
                                                  !isStableCurrency(collateral.name)
                                                      ? '...'
                                                      : ` (${formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            getUSDForCollateral(collateral.name)
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
                                          invertCollors={invertCollors}
                                      >
                                          {collateralArray[selectedItem] === collateral && <SelectedIndicator />}
                                          <TextCollateral invertCollors={invertCollors}>{collateral}</TextCollateral>
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
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        line-height: 13px;
    }
`;

const TextCollateral = styled(Text)<{ invertCollors?: boolean }>`
    color: ${(props) =>
        props.invertCollors ? props.theme.dropDown.textColor.secondary : props.theme.dropDown.textColor.primary};
    font-weight: 700;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const SelectedTextCollateral = styled(TextCollateral)`
    color: ${(props) =>
        props.invertCollors ? props.theme.dropDown.textColor.secondary : props.theme.dropDown.textColor.primary};
    margin-right: 4px;
`;

const Arrow = styled.i<{ invertCollors?: boolean }>`
    font-size: 10px;
    text-transform: none;
    color: ${(props) =>
        props.invertCollors ? props.theme.dropDown.textColor.secondary : props.theme.dropDown.textColor.primary};
    margin-bottom: 2px;
`;

const SelectedCollateral = styled(FlexDivRowCentered)<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;

const Dropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    top: 20px;
    right: 0;
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

const CollateralOption = styled.div<{ invertCollors?: boolean }>`
    display: flex;
    align-items: center;
    padding: 5px 7px 5px 17px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        ${TextCollateral} {
            color: ${(props) =>
                props.invertCollors
                    ? props.theme.dropDown.textColor.primary
                    : props.theme.dropDown.textColor.secondary};
        }
    }
`;

const Icon = styled.i<{ invertCollors?: boolean }>`
    font-size: 25px;
    line-height: 100%;
    margin-right: 10px;
    background: ${(props) => props.theme.dropDown.background.primary};
    color: ${(props) =>
        props.invertCollors ? props.theme.dropDown.textColor.secondary : props.theme.dropDown.textColor.primary};
    border-radius: 50%;
`;

const AssetIcon = styled(Icon)`
    font-size: 20px;
    margin-right: 4px;
`;

const DetailedCollateralOption = styled(FlexDivSpaceBetween)<{ invertCollors?: boolean }>`
    padding: 5px 24px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        ${Icon}, ${TextCollateral} {
            color: ${(props) =>
                props.invertCollors
                    ? props.theme.dropDown.textColor.primary
                    : props.theme.dropDown.textColor.secondary};
        }
    }
`;

export const SelectedIndicator = styled.div`
    position: absolute;
    left: 8px;
    background: ${(props) => props.theme.button.textColor.tertiary};
    border-radius: 20px;
    width: 6px;
    height: 6px;
`;

export default CollateralSelector;
