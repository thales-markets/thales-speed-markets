import TextInput from 'components/fields/TextInput';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { RootState } from 'types/ui';

type SearchInputProps = {
    placeholder?: string;
    text: string;
    handleChange: (event: any) => void;
    width?: string;
    height?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, text, handleChange, width, height }) => {
    const { t } = useTranslation();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper>
            <TextInput
                placeholder={`${placeholder || t('common.search-placeholder')}`}
                value={text}
                onChange={(event: any) => handleChange(event.target.value)}
                width={width}
                height={height}
                margin={'0px'}
                inputPadding={isMobile ? '5px 10px 5px 35px' : '5px 10px 5px 60px'}
            />
            <Icon className="icon icon--search" />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivCentered)`
    position: relative;
    width: fit-content;
    height: fit-content;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
    }
`;

const Icon = styled.i`
    position: absolute;
    left: 18px;
    font-size: 22px;
    color: ${(props) => props.theme.icon.textColor.tertiary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        left: 8px;
    }
`;

export default SearchInput;
