import Button from 'components/Button';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';

type ToggleProps = {
    options: { label: string; value: number; resolution: string }[];
    onChange: (value: number) => void;
    selectedIndex?: number;
};

const Toggle: React.FC<ToggleProps> = ({ options, onChange, selectedIndex }) => {
    const theme: ThemeInterface = useTheme();

    const handleClick = (value: number) => {
        onChange(value);
    };

    return (
        <Wrapper>
            {options.map(({ label, resolution }, index) => (
                <Button
                    key={resolution}
                    width="40px"
                    height="31px"
                    textColor={
                        index === selectedIndex ? theme.button.textColor.secondary : theme.button.textColor.tertiary
                    }
                    backgroundColor={
                        index === selectedIndex ? theme.button.background.secondary : theme.button.background.primary
                    }
                    borderColor={theme.button.borderColor.secondary}
                    fontSize="13px"
                    borderWidth="1px"
                    borderRadius="8px"
                    additionalStyles={{
                        transition: 'all 0.2s ease-in-out',
                        textTransform: 'none',
                    }}
                    onClick={() => handleClick(index)}
                >
                    {label}
                </Button>
            ))}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
`;

export default Toggle;
