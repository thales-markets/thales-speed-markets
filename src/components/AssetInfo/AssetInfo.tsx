import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import styled from 'styled-components';
import { getSynthName } from 'utils/currency';

export type AssetInfoProps = {
    currencyKey: string;
    iconFontSize?: string;
    currencyKeyFontSize?: string;
    displayInRow?: boolean;
    displayInRowMobile?: boolean;
    width?: string;
};

const AssetInfo: React.FC<AssetInfoProps> = ({
    currencyKey,
    iconFontSize,
    currencyKeyFontSize,
    displayInRow,
    displayInRowMobile,
    width,
}) => {
    return (
        <AssetContainer displayInRowMobile={displayInRowMobile} width={width}>
            <CurrencyIcon
                className={`currency-icon currency-icon--${currencyKey.toLowerCase()}`}
                fontSize={iconFontSize}
                displayInRowMobile={displayInRowMobile}
            />
            <AssetNameContainer displayInRow={displayInRow} displayInRowMobile={displayInRowMobile}>
                <AssetName>{getSynthName(currencyKey)}</AssetName>
                <CurrencyKey fontSize={currencyKeyFontSize}>{currencyKey}</CurrencyKey>
            </AssetNameContainer>
        </AssetContainer>
    );
};

const AssetContainer = styled.div<{ displayInRowMobile?: boolean; width?: string }>`
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    flex: 1;
    max-width: ${(props) => props.width || ''};
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: 100%;
        flex-direction: ${(props) => (props.displayInRowMobile ? 'row' : 'column')};
        justify-content: ${(props) => (props.displayInRowMobile ? 'flex-start' : 'space-evenly')};
    }
`;

const AssetNameContainer = styled.div<{ displayInRow?: boolean; displayInRowMobile?: boolean }>`
    display: ${(props) => (props.displayInRow ? 'flex' : 'block')};
    ${(props) => (props.displayInRow ? 'flex-direction: row;' : '')}
    ${(props) => (props.displayInRow ? 'align-items: baseline;' : '')}
    text-align: left;
    font-size: 15px;
    color: ${(props) => props.theme.textColor.primary};
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        text-align: ${(props) => (props.displayInRowMobile ? 'left' : 'center')};
    }
`;

const AssetName = styled.span<{ fontSize?: string }>`
    display: block;
    font-weight: 700;
    font-size: ${(props) => props.fontSize || '12px'};
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    line-height: 120%;
    margin-right: 2px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

const CurrencyKey = styled.span<{ fontSize?: string }>`
    display: block;
    font-weight: 700;
    line-height: 120%;
    font-size: ${(props) => props.fontSize || '12px'};
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
`;

const CurrencyIcon = styled.i<{ fontSize?: string; displayInRowMobile?: boolean }>`
    font-size: ${(props) => props.fontSize || '24px'};
    margin-right: 6px;
    @media screen and (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-right: ${(props) => (props.displayInRowMobile ? '4px' : '0')};
    }
`;

export default AssetInfo;
