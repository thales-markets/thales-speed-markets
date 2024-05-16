import { ScreenSizeBreakpoint } from 'enums/ui';
import ReactTooltip from 'rc-tooltip';
import React, { CSSProperties } from 'react';
import styled, { useTheme } from 'styled-components';
import 'styles/tooltip.css';
import { ThemeInterface } from 'types/ui';

type TooltipProps = {
    overlay: any;
    children?: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ overlay, children }) => {
    const theme: ThemeInterface = useTheme();

    const toolipInnerStyle: CSSProperties = {
        background: theme.background.primary,
        color: theme.textColor.primary,
        fontWeight: 700,
    };

    return (
        <ReactTooltip overlay={overlay} overlayInnerStyle={toolipInnerStyle} placement="top">
            {children ? (children as any) : <InfoIcon />}
        </ReactTooltip>
    );
};

const InfoIcon = styled.i`
    position: relative;
    font-size: 15px;
    line-height: 100%;
    vertical-align: middle;
    font-weight: normal;
    cursor: pointer;
    margin-top: 1px;
    margin-left: 4px;
    color: ${(props) => props.theme.textColor.primary};
    &:before {
        font-family: Icons !important;
        content: '\\20AC';
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 15px;
    }
`;

export default Tooltip;
