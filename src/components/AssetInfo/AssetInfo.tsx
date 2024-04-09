import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import styled from 'styled-components';
import { getSynthName } from 'utils/currency';

export type AssetInfoProps = {
    currencyKey: string;
    displayInRowMobile?: boolean;
};

const AssetInfo: React.FC<AssetInfoProps> = ({ currencyKey, displayInRowMobile }) => {
    return (
        <AssetContainer displayInRowMobile={displayInRowMobile}>
            <CurrencyIcon
                className={`currency-icon currency-icon--${currencyKey.toLowerCase()}`}
                displayInRowMobile={displayInRowMobile}
            />
            <AssetNameContainer displayInRowMobile={displayInRowMobile}>
                <AssetName>{getSynthName(currencyKey)}</AssetName>
                <CurrencyKey>{currencyKey}</CurrencyKey>
            </AssetNameContainer>
        </AssetContainer>
    );
};

const AssetContainer = styled.div<{ displayInRowMobile?: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    flex: 1;
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: 100%;
        flex-direction: ${(props) => (props.displayInRowMobile ? 'row' : 'column')};
        justify-content: ${(props) => (props.displayInRowMobile ? 'flex-start' : 'space-evenly')};
    }
`;

const AssetNameContainer = styled.div<{ displayInRowMobile?: boolean }>`
    display: block;
    text-align: left;
    font-size: 15px;
    color: ${(props) => props.theme.textColor.primary};
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        text-align: ${(props) => (props.displayInRowMobile ? 'left' : 'center')};
    }
`;

const AssetName = styled.span`
    display: block;
    font-weight: 700;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    line-height: 120%;
    margin-right: 2px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

const CurrencyKey = styled.span`
    display: block;
    font-weight: 700;
    line-height: 120%;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
`;

const CurrencyIcon = styled.i<{ displayInRowMobile?: boolean }>`
    font-size: 24px;
    margin-right: 6px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-right: ${(props) => (props.displayInRowMobile ? '4px' : '0')};
    }
`;

export default AssetInfo;
