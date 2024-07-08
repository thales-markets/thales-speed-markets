import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, PAGE_MAX_WIDTH } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    gap: 30px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 15px;
    }
`;

export const Header = styled(FlexDiv)`
    width: 100%;
    gap: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
    }
`;

export const PositionsWrapper = styled(FlexDivColumn)`
    width: 100%;
    gap: 20px;
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
    $disabled?: boolean;
}>`
    font-weight: 800;
    font-size: 18px;
    line-height: 40px;
    text-transform: uppercase;
    color: ${(props) => (props.$active ? props.theme.textColor.primary : props.theme.textColor.secondary)};
    cursor: ${(props) => (props.$disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.$disabled ? '0.4' : '1')};
    padding: 0 50px;
    white-space: pre;
    box-shadow: ${(props) => (props.$active ? `0px 2px ${props.theme.borderColor.primary};` : '')};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 14px;
        line-height: 30px;
        padding: 0 20px;
    }
`;

export const TabSection = styled.div<{ $isEmpty?: boolean }>`
    ${(props) => (!props.$isEmpty ? 'min-height: 393px;' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-height: unset;
    }
`;

export const TabSectionTitle = styled.p`
    font-weight: 800;
    font-size: 18px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.secondary};
`;

export const TabSectionSubtitle = styled.span`
    font-size: 13px;
    font-weight: 700;
    line-height: 11px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: left;
`;

export const Notification = styled.span<{ $isSelected: boolean }>`
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.quaternary};
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
        padding: 0 5px;
    }
`;
