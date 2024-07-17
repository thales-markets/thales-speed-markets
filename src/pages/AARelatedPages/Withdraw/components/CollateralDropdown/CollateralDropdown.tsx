import OutsideClickHandler from 'components/OutsideClick';
import { USD_SIGN } from 'constants/currency';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { Coins, formatCurrencyWithSign } from 'thales-utils';
import { isStableCurrency } from 'utils/currency';

type CollateralDropDownProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    collateralBalances?: any;
    exchangeRates?: Rates | null;
    onChangeCollateral: (index: number) => void;
};

const CollateralDropdown: React.FC<CollateralDropDownProps> = ({
    collateralArray,
    selectedItem,
    collateralBalances,
    exchangeRates,
    onChangeCollateral,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

    const getUSDForCollateral = useCallback(
        (collateral: Coins) =>
            (collateralBalances ? collateralBalances[collateral] : 0) *
            (isStableCurrency(collateral) ? 1 : exchangeRates?.[collateral] || 0),
        [collateralBalances, exchangeRates]
    );

    const collateralsDetailsSorted = useMemo(() => {
        const mappedCollaterals = collateralArray.map((collateral, index) => ({ name: collateral, index }));
        return mappedCollaterals.sort(
            (collateralA, collateralB) =>
                getUSDForCollateral(collateralB.name as any) - getUSDForCollateral(collateralA.name as any)
        );
    }, [collateralArray, getUSDForCollateral]);

    return (
        <OutsideClickHandler
            onOutsideClick={() => {
                setIsOpen(false);
            }}
        >
            <Container
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                <Icon className={`currency-icon currency-icon--${collateralArray[selectedItem].toLowerCase()}`} />
                {collateralArray[selectedItem]}
                {collateralArray.length > 1 && (
                    <Arrow className={isOpen ? `icon icon--caret-up` : `icon icon--caret-down`} />
                )}
                {isOpen && (
                    <DropdownContainer>
                        {collateralsDetailsSorted.map((collateral: any, index) => (
                            <CoinsWrapper key={index}>
                                <div>
                                    <CollateralName
                                        onClick={() => {
                                            onChangeCollateral(index);
                                            dispatch(setSelectedCollateralIndex(index));
                                        }}
                                    >
                                        {collateral.name}
                                    </CollateralName>
                                </div>
                                <div>
                                    <CollateralName>
                                        {formatCurrencyWithSign(
                                            null,
                                            collateralBalances ? collateralBalances[collateral.name] : 0
                                        )}
                                    </CollateralName>
                                    <CollateralName>
                                        {!exchangeRates?.[collateral.name] && !isStableCurrency(collateral.name)
                                            ? '...'
                                            : ` (${formatCurrencyWithSign(
                                                  USD_SIGN,
                                                  getUSDForCollateral(collateral.name)
                                              )})`}
                                    </CollateralName>
                                </div>
                            </CoinsWrapper>
                        ))}
                    </DropdownContainer>
                )}
            </Container>
        </OutsideClickHandler>
    );
};

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 7px;
    border-radius: 8px;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    color: ${(props) => props.theme.textColor.secondary};
    position: relative;
    max-height: 40px;
    cursor: pointer;
`;

const DropdownContainer = styled.div`
    position: absolute;
    left: -1px;
    top: 40px;
    z-index: 20;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    padding: 20px;

    border-radius: 8px;
    border: 2px solid ${(props) => props.theme.dropDown.background.secondary};
    width: min(400px, 100%);
    background: ${(props) => props.theme.dropDown.background.primary};
`;

const Icon = styled.i`
    font-size: 25px;
    line-height: 100%;
    margin-right: 10px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const Arrow = styled.i`
    font-size: 10px;
    text-transform: none;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    right: 10px;
`;

const CollateralName = styled.span`
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.dropDown.textColor.secondary};
    }
`;

const CoinsWrapper = styled(FlexDivSpaceBetween)`
    width: 100%;
`;
export default CollateralDropdown;
