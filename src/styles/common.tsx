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

export const GradientContainer = styled.div<{ width?: number; borderRadius?: string }>`
    padding: 2px;
    background: ${(props) => props.theme.borderColor.secondary};
    border-radius: ${(props) => props.borderRadius ?? '8px'};
    width: ${(props) => (props.width ? `${props.width}px` : '100%')};
`;

export const Colors = {
    GRAY: '#2b3139',
    GRAY_BLUE: '#808997',

    WHITE: '#FFFFFF',

    GREEN: '#8AF6A8',
    GREEN_LIGHT: '#7DDD97',
    GREEN_DARK: '#00994B',
    GREEN_DARKER: '#00A069',
    GREEN_POTENTIAL: '#BEFFCD',

    BLACK: '#000000',

    BLUE: '#169CD2',
    BLUE_LIGHT: '#00EEE8',
    BLUE_DARK: '#06B2E3',
    BLUE_DEEP_SKY: '#1D7DC0',

    RED: '#DE496D',
    RED_LIGHT: '#EC91A7',
    RED_DARK: '#EC0039',

    YELLOW_DARK: '#9b8327',
    YELLOW_LIGHT: '#FEF5AB',

    GOLD_1: '#FBD04E',
    GOLD_2: '#B77517',
    GOLD_3: '#EFC146',
    GOLD_4: '#FFF8B0',
    GOLD_5: '#804200',

    PURPLE: '#C294F5',
    PURPLE_HALF: '#C294f580', // 50%
    PURPLE_START: '#C294F566', // 40%
    PURPLE_END: '#C294F500', // 0%
    PURPLE_DARK: '#A764B7',
    PURPLE_DARK_2: '#681483',
};
