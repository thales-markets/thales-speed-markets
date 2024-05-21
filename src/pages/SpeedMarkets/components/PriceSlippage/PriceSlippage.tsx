import OutsideClickHandler from 'components/OutsideClick';
import Tooltip from 'components/Tooltip';
import NumericInput from 'components/fields/NumericInput';
import {
    DEFAULT_PRICE_SLIPPAGE_PERCENTAGE,
    DOUBLE_DEFAULT_PRICE_SLIPPAGE_PERCENTAGE,
    MIN_STRIKE_PRICE_SLIPPAGE_PERCENTAGE,
} from 'constants/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivStart } from 'styles/common';
import { decimalToPercentage, percentageToDecimal } from 'utils/formatters/number';

const PriceSlippage: React.FC<{ slippage: number; onChange: React.Dispatch<number> }> = ({ slippage, onChange }) => {
    const { t } = useTranslation();

    const [showPriceSlippage, setShowPriceSlippage] = useState(false);

    return (
        <Container>
            {`${decimalToPercentage(slippage)}% ${t('speed-markets.slippage')}`}
            <GearIcon className={'icon icon--gear'} onClick={() => setShowPriceSlippage(true)} />
            {showPriceSlippage && (
                <OutsideClickHandler onOutsideClick={() => setShowPriceSlippage(false)}>
                    <SlippageDetailsWrapper>
                        <SlippageDetails>
                            <SlippageInfo>
                                {t('speed-markets.slippage-info')}
                                <Tooltip
                                    overlay={'TODO'}
                                    customIconStyling={{
                                        fontSize: '13px',
                                        marginTop: '2px',
                                    }}
                                />
                            </SlippageInfo>
                            <SlippageRow>
                                <SlippageButton
                                    $isSelected={slippage === DEFAULT_PRICE_SLIPPAGE_PERCENTAGE}
                                    onClick={() => onChange(DEFAULT_PRICE_SLIPPAGE_PERCENTAGE)}
                                >
                                    {decimalToPercentage(DEFAULT_PRICE_SLIPPAGE_PERCENTAGE)}%
                                </SlippageButton>
                                <SlippageButton
                                    $isSelected={slippage === DOUBLE_DEFAULT_PRICE_SLIPPAGE_PERCENTAGE}
                                    onClick={() => onChange(DOUBLE_DEFAULT_PRICE_SLIPPAGE_PERCENTAGE)}
                                >
                                    {decimalToPercentage(DOUBLE_DEFAULT_PRICE_SLIPPAGE_PERCENTAGE)}%
                                </SlippageButton>
                                <NumericInput
                                    value={decimalToPercentage(slippage)}
                                    onChange={(_, value) => onChange(percentageToDecimal(Number(value)))}
                                    min={decimalToPercentage(MIN_STRIKE_PRICE_SLIPPAGE_PERCENTAGE)}
                                    currencyComponent={<Percent>%</Percent>}
                                    width="80px"
                                    height="30px"
                                    inputPadding="5px 8px"
                                    margin="0"
                                />
                            </SlippageRow>
                        </SlippageDetails>
                    </SlippageDetailsWrapper>
                </OutsideClickHandler>
            )}
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    position: absolute;
    top: 12px;
    right: 12px;
    width: 152px;
    max-width: 152px;
    height: 40px;
    padding: 5px;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 8px;
    color: ${(props) => props.theme.textColor.quinary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        left: 12px;
        bottom: 12px;
        top: auto;
        right: auto;
    }
`;

const SlippageDetailsWrapper = styled.div`
    position: absolute;
    top: -2px;
    right: -2px;
    padding: 1px;
    background: ${(props) => props.theme.borderColor.tertiary};
    border-radius: 8px;
    z-index: 2;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        left: -2px;
        bottom: -2px;
        top: auto;
        right: auto;
    }
`;

const SlippageDetails = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
    padding: 10px;
    gap: 20px;
`;

const SlippageInfo = styled(FlexDivStart)`
    align-items: center;
    color: ${(props) => props.theme.button.textColor.tertiary};
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
`;

const SlippageRow = styled(FlexDivRow)`
    gap: 10px;
`;

const SlippageButton = styled(FlexDivCentered)<{ $isSelected: boolean }>`
    width: 50px;
    height: 30px;
    padding: 5px;
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    border-radius: 8px;
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
`;

const Percent = styled.span`
    color: ${(props) => props.theme.input.textColor.secondary};
    margin-right: 6px;
`;

const GearIcon = styled.i`
    cursor: pointer;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.quinary};
    margin-left: 5px;
`;

export default PriceSlippage;
