import styled from 'styled-components';

export const PAGE_MAX_WIDTH = '1150px';

export const FlexDiv = styled.div`
    display: flex;
    outline: none !important;
`;

export const FlexDivCentered = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
`;

export const FlexDivSpaceBetween = styled(FlexDiv)`
    align-items: center;
    justify-content: space-between;
`;

export const FlexDivEnd = styled(FlexDiv)`
    justify-content: end;
`;

export const FlexDivStart = styled(FlexDiv)`
    justify-content: start;
`;

export const FlexDivRow = styled(FlexDiv)`
    justify-content: space-between;
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
    align-items: center;
`;

export const FlexDivColumn = styled(FlexDiv)`
    flex: 1;
    flex-direction: column;
`;

export const FlexDivColumnCentered = styled(FlexDivColumn)`
    justify-content: center;
`;

export const BoldText = styled.span`
    font-weight: 700;
`;
export const ExtraBoldText = styled.span`
    font-weight: 800;
`;

export const Colors = {
    GRAY: '#2b3139',
    GRAY_LIGHT: '#848E9C',
    GRAY_DARK: '#181A20',
    GRAY_BLUE: '#808997',

    WHITE: '#FFFFFF',

    GREEN: '#00DA3C',
    GREEN_LIGHT: '#00C149',
    GREEN_DARK: '#00994B',
    GREEN_DARKER: '#00754D',
    GREEN_DARK_START: 'rgb(76, 211, 163, 0.4)',
    GREEN_DARK_END: 'rgb(76, 211, 163, 0)',

    BLACK: '#000000',

    BLUE: '#169CD2',
    BLUE_LIGHT: '#06B2E3',
    BLUE_DARK: '#00EEE8',
    BLUE_SKY: '#5FB9C6',
    BLUE_DEEP_SKY: '#1D7DC0',

    RED: '#EC0000',
    RED_LIGHT: '#C40000',
    RED_DARK: '#FF5E3A',
    RED_START: 'rgb(109, 18, 40, 0.4)',
    RED_END: 'rgb(222, 73, 109, 0)',

    ORANGE: '#E27A93',
    ORANGE_DARK: '#FF8800',

    YELLOW_DARK: '#9b8327',

    PURPLE: '#C294F5',
    PURPLE_DARK: '#A764B7',
    PURPLE_DARK_2: '#681483',
};
