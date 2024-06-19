import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

type CheckboxProps = {
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    checked: boolean;
    label?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ value, onChange, disabled, checked, label }) => {
    return (
        <CheckboxContainer className={disabled ? 'disabled' : ''}>
            {label}
            <CheckboxInput type="checkbox" checked={checked} value={value} onChange={onChange} disabled={disabled} />
            <Checkmark className="checkmark" />
        </CheckboxContainer>
    );
};

const CheckboxInput = styled.input`
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
`;

const CheckboxContainer = styled.label`
    width: 100%;
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 18px;
    line-height: 22px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    input:checked ~ .checkmark:after {
        display: block;
    }
    &.disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const Checkmark = styled.span`
    position: absolute;
    top: 0;
    right: 0;
    height: 22px;
    width: 22px;
    border-radius: 5px;
    border: 2px solid ${(props) => props.theme.textColor.secondary};
    background-color: transparent;

    :after {
        content: '';
        position: absolute;
        display: none;
        left: 5px;
        top: -1px;
        width: 5px;
        height: 14px;
        border: solid ${(props) => props.theme.textColor.secondary};
        border-width: 0 2px 2px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

export default Checkbox;
