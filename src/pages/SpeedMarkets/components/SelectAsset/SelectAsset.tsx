import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { getSynthAsset } from 'utils/currency';

type SelectAssetProps = {
    selectedAsset: string;
    allAssets: string[];
    onChange: React.Dispatch<string>;
};

const SelectAsset: React.FC<SelectAssetProps> = ({ selectedAsset, allAssets, onChange }) => {
    const [asset, setAsset] = useState(selectedAsset);

    useEffect(() => {
        setAsset(selectedAsset);
    }, [selectedAsset]);

    return (
        <Container>
            {allAssets.map((currentAsset, index) => {
                const isSelected = asset === currentAsset || selectedAsset === currentAsset;
                return (
                    <Asset
                        key={index}
                        $isSelected={isSelected}
                        onClick={() => {
                            onChange(currentAsset);
                            setAsset(currentAsset);
                        }}
                    >
                        <IconWrapper>
                            <AssetIcon
                                $isSelected={isSelected}
                                className={`currency-icon currency-icon--${currentAsset.toLowerCase()}`}
                            />
                        </IconWrapper>
                        <AssetName>{getSynthAsset(currentAsset)}</AssetName>
                    </Asset>
                );
            })}
        </Container>
    );
};

const Container = styled(FlexDivSpaceBetween)`
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        justify-content: center;
        width: 100%;
    }
`;

const Asset = styled.div<{ $isSelected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: start;
    padding-left: 15px;
    min-width: 165px;
    width: 100%;
    height: 40px;
    border-radius: 8px;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
    font-size: 18px;
    line-height: 90%;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 16px;
    }
`;

const IconWrapper = styled.div`
    background: radial-gradient(${(props) => props.theme.background.primary} 60%, transparent 40%);
    border-radius: 50%;
    margin-right: 12px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-right: 8px;
    }
`;

const AssetIcon = styled.i<{ $isSelected: boolean }>`
    font-size: 24px;
    line-height: 100%;
    border-radius: 50%;
    background: ${(props) =>
        props.$isSelected ? props.theme.icon.textColor.primary : props.theme.icon.textColor.secondary};
    color: ${(props) =>
        props.$isSelected ? props.theme.icon.textColor.secondary : props.theme.icon.textColor.primary};
`;

const AssetName = styled.p`
    font-size: 18px;
    font-weight: 800;
    line-height: 100%;
    text-transform: uppercase;
`;

export default SelectAsset;
