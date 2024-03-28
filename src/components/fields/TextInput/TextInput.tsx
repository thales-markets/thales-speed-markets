import React from 'react';
import styled from 'styled-components';
import { FieldContainer, Input } from '../common';

type TextInputProps = {
    value: string;
    placeholder?: string;
    onChange?: any;
    inputPadding?: string;
    margin?: string;
    width?: string;
    height?: string;
};

const TextInput: React.FC<TextInputProps> = ({ value, placeholder, onChange, inputPadding, margin, width, height }) => {
    return (
        <FieldContainer width={width} margin={margin}>
            <StyledInput
                readOnly={!onChange}
                value={value}
                type="text"
                onChange={onChange}
                placeholder={placeholder}
                title=""
                padding={inputPadding}
                width={width}
                height={height}
            />
        </FieldContainer>
    );
};

const StyledInput = styled(Input)<{ padding?: string; readOnly: boolean }>`
    padding: ${(props) => props.padding || '5px 10px 5px 10px'};
    &:focus {
        ${(props) => (props.readOnly ? `border: 1px solid ${props.theme.input.borderColor.primary};` : '')}
    }
`;

export default TextInput;
