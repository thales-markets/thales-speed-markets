import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { FieldContainer, FieldLabel, Input } from '../common';

type NumericInputProps = {
    value: string | number;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
    showValidation?: boolean;
    validationMessage?: string;
    currencyComponent?: any;
    currencyLabel?: string;
    onMaxButton?: any;
    inputPadding?: string;
    margin?: string;
};

const INVALID_CHARS = ['-', '+', 'e'];
const DEFAULT_TOKEN_DECIMALS = 18;

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    label,
    placeholder,
    disabled,
    onChange,
    showValidation,
    validationMessage,
    currencyComponent,
    currencyLabel,
    onMaxButton,
    inputPadding,
    margin,
}) => {
    const { t } = useTranslation();

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        let trimmedValue = value;
        if (value.indexOf('.') > -1) {
            const numberOfDecimals = value.split('.')[1].length;
            if (numberOfDecimals > DEFAULT_TOKEN_DECIMALS) {
                trimmedValue = value.substring(0, value.length - 1);
            }
        }

        onChange(e, trimmedValue.replace(/,/g, '.').replace(/[e+-]/gi, ''));
    };

    return (
        <FieldContainer margin={margin}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <StyledInput
                value={value}
                type="number"
                onChange={handleOnChange}
                placeholder={placeholder}
                disabled={disabled}
                className={showValidation ? 'error' : ''}
                onKeyDown={(e) => {
                    if (INVALID_CHARS.includes(e.key)) {
                        e.preventDefault();
                    }
                }}
                min="0"
                title=""
                padding={inputPadding}
            />
            <RightContainer hasLabel={!!label}>
                {onMaxButton && (
                    <MaxButton disabled={disabled} onClick={onMaxButton}>
                        {t('common.max')}
                    </MaxButton>
                )}
                {currencyLabel && (
                    <CurrencyLabel
                        className={disabled ? 'currency-label disabled' : 'currency-label'}
                        $hasSeparator={onMaxButton}
                    >
                        {currencyLabel}
                    </CurrencyLabel>
                )}
                {currencyComponent && (
                    <CurrencyComponentContainer className={disabled ? 'disabled' : ''} $hasSeparator={onMaxButton}>
                        {currencyComponent}
                    </CurrencyComponentContainer>
                )}
            </RightContainer>
            {showValidation && (
                <Validation>
                    <ValidationText>{validationMessage}</ValidationText>
                </Validation>
            )}
        </FieldContainer>
    );
};

const StyledInput = styled(Input)<{ padding?: string }>`
    padding: ${(props) => props.padding || '5px 120px 5px 10px'};
`;

const RightContainer = styled(FlexDivCentered)<{ hasLabel?: boolean }>`
    position: absolute;
    right: 0;
    top: ${(props) => (props.hasLabel ? 'calc(50% + 10px)' : '50%')}; // 10px half of label height and margin
    bottom: 50%;
`;

const CurrencyLabel = styled.label<{ $hasSeparator?: boolean }>`
    border-left: ${(props) => (props.$hasSeparator ? `2px solid ${props.theme.textColor.primary}` : 'none')};
    font-weight: bold;
    font-size: 13px;
    line-height: 26px;
    color: ${(props) => props.theme.input.textColor.primary};
    padding-left: 8px;
    padding-right: 12px;
    pointer-events: none;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const MaxButton = styled.button`
    font-family: ${(props) => props.theme.fontFamily.primary};
    background: ${(props) => props.theme.button.borderColor.secondary};
    border-radius: 17px;
    border: none;
    width: 50px;
    height: 20px;
    font-weight: 700;
    font-size: 13px;
    line-height: normal;
    color: ${(props) => props.theme.button.textColor.secondary};
    text-transform: capitalize;
    cursor: pointer;
    margin-right: 4px;
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const Validation = styled.div`
    position: absolute;
    bottom: -7px;
    width: 100%;
    color: ${(props) => props.theme.input.textColor.quaternary};
    text-align: center;
`;

const ValidationText = styled.span`
    padding: 2px 4px;
    font-weight: 600;
    font-size: 13px;
    line-height: 15px;
    background-color: ${(props) => props.theme.background.primary};
`;

const CurrencyComponentContainer = styled(FlexDivCentered)<{ $hasSeparator?: boolean }>`
    ${(props) => (props.$hasSeparator ? `border-left: 2px solid ${props.theme.textColor.primary};` : '')}
    line-height: 15px;
    padding-right: 2px;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export default NumericInput;
