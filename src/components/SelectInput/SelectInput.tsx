import React from 'react';
import Select, { CSSObjectWithLabel, ControlProps, GroupBase, OptionProps, components } from 'react-select';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';

type SelectOption = { value: number | string; label: string };

type SelectInputProps = {
    options: Array<SelectOption>;
    handleChange: (value: number | undefined | null) => void;
    defaultValue?: number;
    value?: SelectOption;
};

const SelectInput: React.FC<SelectInputProps> = ({ options, handleChange, defaultValue, value }) => {
    const theme: ThemeInterface = useTheme();
    const defaultOption = value ?? options[defaultValue ? defaultValue : 0];

    const customStyled = {
        container: (base: CSSObjectWithLabel) => ({ ...base, width: '100%' }),
        valueContainer: (base: CSSObjectWithLabel) => ({ ...base, height: '100%' }),
        menu: (base: CSSObjectWithLabel) => ({
            ...base,
            width: '100%',
            // color: props.selectProps.menuColor,
            backgroundColor: theme.background.primary,
            border: `2px solid ${theme.borderColor.primary}`,
            marginTop: 5,
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 16,
        }),
        menuList: (base: CSSObjectWithLabel) => ({
            ...base,
            padding: '4px',
        }),
        option: (base: CSSObjectWithLabel, props: OptionProps<SelectOption, boolean, GroupBase<SelectOption>>) => ({
            ...base,
            color: theme.textColor.secondary,
            backgroundColor: props?.isFocused ? theme.background.primary : 'transparent',
            cursor: 'pointer',
            borderRadius: 8,
            '&:hover': {
                color: theme.textColor.primary,
            },
            '&:active': {
                backgroundColor: theme.background.primary,
            },
        }),
        control: (base: CSSObjectWithLabel, props: ControlProps<SelectOption, boolean, GroupBase<SelectOption>>) => ({
            ...base,
            backgroundColor: theme.background.primary,
            border: `2px solid ${theme.borderColor.primary}`,
            color: theme.textColor.secondary,
            borderRadius: '8px',
            minHeight: 38,
            height: 38,
            cursor: 'pointer',
            boxShadow: 'none',
            '&:hover': {
                border: `2px solid ${theme.borderColor.primary}`,
                boxShadow: 'none',
            },
            opacity: props.isDisabled ? 0.4 : 1,
            fontSize: 16,
            lineHeight: 20,
        }),
        placeholder: (base: CSSObjectWithLabel) => ({
            ...base,
            color: theme.textColor.secondary,
        }),
        singleValue: (base: CSSObjectWithLabel) => ({
            ...base,
            color: theme.textColor.secondary,
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (base: CSSObjectWithLabel) => ({
            ...base,
            color: theme.textColor.primary,
            [':hover']: {
                ...base[':hover'],
                color: theme.textColor.primary,
            },
        }),
    };

    return (
        <Select
            components={{ DropdownIndicator }}
            options={options}
            defaultValue={defaultOption}
            value={defaultOption}
            isSearchable={false}
            onChange={(props: any) => handleChange(Number((props as SelectOption).value))}
            styles={customStyled}
        />
    );
};

const DropdownIndicator: React.FC<any> = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <Icon className={`icon ${props.selectProps.menuIsOpen ? 'icon--caret-up' : 'icon--caret-down'}`} />
        </components.DropdownIndicator>
    );
};

const Icon = styled.i`
    font-size: 12px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
`;

export default SelectInput;
