import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, PAGE_MAX_WIDTH } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    gap: 30px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 15px;
    }
`;

export const Header = styled(FlexDivRow)`
    width: 100%;
    color: ${(props) => props.theme.textColor.primary};
`;

export const PositionsWrapper = styled(FlexDivColumn)`
    width: 100%;
`;

export const Tabs = styled.div`
    display: flex;
    justify-content: center;
    align-items: stretch;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 40px;
    }
`;

export const Tab = styled.span<{
    $active?: boolean;
}>`
    font-weight: 800;
    font-size: 18px;
    line-height: 40px;
    text-transform: uppercase;
    color: ${(props) => (props.$active ? props.theme.textColor.quinary : props.theme.textColor.primary)};
    cursor: pointer;
    padding: 0 50px;
    white-space: pre;
    box-shadow: ${(props) => (props.$active ? `0px 2px ${props.theme.borderColor.quaternary};` : '')};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 14px;
        line-height: 24px;
        padding: 0 20px;
    }
`;

export const TabSection = styled.div<{ $isEmpty?: boolean }>`
    ${(props) => (!props.$isEmpty ? 'min-height: 390px;' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: unset;
    }
`;

export const TabSectionTitle = styled.p`
    font-weight: 800;
    font-size: 18px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 20px;
`;

export const TabSectionSubtitle = styled.span`
    font-size: 13px;
    font-weight: 700;
    line-height: 11px;
    color: ${(props) => props.theme.textColor.quinary};
    text-align: left;
`;

export const Notification = styled.span`
    background: ${(props) => props.theme.button.background.secondary};
    border-radius: 30px;
    color: ${(props) => props.theme.button.textColor.secondary};
    margin-left: 8px;
    min-width: 24px;
    padding: 0 5px;
    text-align: center;
    font-size: 18px;
    line-height: 24px;
    display: inline-block;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 13px;
        line-height: 20px;
        min-width: 20px;
        margin-left: 6px;
        padding: 0 5px 0 4px;
    }
`;
