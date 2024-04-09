import React, { ChangeEvent } from 'react';

import styled from 'styled-components';
import { FieldContainer, Input } from '../common';

type TimeInputProps = {
    value: string | number;
    min?: string;
    max?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
    showValidation?: boolean;
    validationMessage?: string;
    inputPadding?: string;
    margin?: string;
    zIndex?: number;
};

const INVALID_CHARS = ['-', '+', 'e', '.'];

const TimeInput: React.FC<TimeInputProps> = ({
    value,
    min,
    max,
    onChange,
    showValidation,
    validationMessage,
    inputPadding,
    margin,
    zIndex,
}) => {
    const handleOnChange = (e: ChangeEvent<HTMLInputElement>, min?: string, max?: string) => {
        const { value } = e.target;
        let trimmedValue = value;

        if (value.length > 2) {
            trimmedValue = value.substring(1, 3);
        } else if (value.length < 2) {
            trimmedValue = value.padStart(2, '0');
        }
        if (min && Number(trimmedValue) < Number(min)) {
            trimmedValue = min.padStart(2, '0');
        }
        if (max && Number(trimmedValue) > Number(max)) {
            trimmedValue = max.padStart(2, '0');
        }

        onChange(e, trimmedValue);
    };

    return (
        <FieldContainer margin={margin} zIndex={zIndex}>
            <StyledInput
                value={value}
                type="number"
                onChange={(e) => handleOnChange(e, min, max)}
                className={showValidation ? 'error' : ''}
                onKeyDown={(e) => {
                    if (INVALID_CHARS.includes(e.key)) {
                        e.preventDefault();
                    }
                }}
                min={min || '0'}
                max={max || 'any'}
                title=""
                padding={inputPadding}
            />

            {showValidation && validationMessage && (
                <Validation>
                    <ValidationText>{validationMessage}</ValidationText>
                </Validation>
            )}
        </FieldContainer>
    );
};

const StyledInput = styled(Input)<{ padding?: string }>`
    padding: ${(props) => props.padding || '5px 120px 5px 10px'};
    text-align: center;
`;

const Validation = styled.div`
    position: absolute;
    bottom: -7px;
    width: 212%;
    color: ${(props) => props.theme.input.textColor.quaternary};
    text-align: center;
    white-space: nowrap;
`;

const ValidationText = styled.span`
    padding: 2px 4px;
    font-weight: 600;
    font-size: 13px;
    line-height: 15px;
    background-color: ${(props) => props.theme.background.primary};
`;

export default TimeInput;
