import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow } from 'styles/common';

export const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

export const Row = styled(FlexDivRow)`
    align-items: center;
    margin-bottom: 10px;
    :not(:first-child) {
        margin-top: 40px;
    }
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        padding: 0 5px;
    }
`;

export const Title = styled.span`
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    margin-left: 20px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin-left: 0;
    }
`;

export const PositionsWrapper = styled.div`
    position: relative;
    min-height: 200px;
    width: 100%;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        min-height: 120px;
    }
`;

export const ButtonWrapper = styled.div<{ $isChained?: boolean }>`
    width: 164px;
    margin-right: ${(props) => (props.$isChained ? '23px' : '16px')};
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin-right: 0;
    }
`;

export const NoPositions = styled(FlexDivCentered)`
    min-height: inherit;
`;

export const NoPositionsText = styled.span`
    text-align: center;
    font-weight: 600;
    font-size: 15px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.secondary};
    min-width: max-content;
    overflow: hidden;
`;
