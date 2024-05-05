import OutsideClickHandler from 'components/OutsideClick';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';

type CollateralDropDownProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
};

const CollateralDropdown: React.FC<CollateralDropDownProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

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
                        {collateralArray.map((collateral: any, index) => (
                            <CollateralName
                                onClick={() => {
                                    onChangeCollateral(index);
                                    dispatch(setSelectedCollateralIndex(index));
                                }}
                                key={index}
                            >
                                {collateral}
                            </CollateralName>
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
    border: 2px solid ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    position: relative;
    max-height: 34px;
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
    border: 2px solid ${(props) => props.theme.background.secondary};
    width: 400px;
    background: ${(props) => props.theme.background.primary};
`;

const Icon = styled.i`
    font-size: 25px;
    line-height: 100%;
    margin-right: 10px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Arrow = styled.i`
    font-size: 10px;
    text-transform: none;
    color: ${(props) => props.theme.background.quinary};
    position: absolute;
    right: 10px;
`;

const CollateralName = styled.span`
    cursor: pointer;
    font-family: ${(props) => props.theme.fontFamily.tertiary};
`;

export default CollateralDropdown;
