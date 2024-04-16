import { ScreenSizeBreakpoint } from 'enums/ui';
import ReactTooltip from 'rc-tooltip';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import 'styles/tooltip.css';

type TooltipProps = {
    overlay: any;
    customIconStyling?: CSSProperties;
    children?: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ overlay, customIconStyling, children }) => {
    return (
        <ReactTooltip overlay={overlay} placement="top">
            {children ? (children as any) : <InfoIcon style={customIconStyling} />}
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
