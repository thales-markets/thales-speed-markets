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
    font-size: 15px;
    font-weight: normal;
    cursor: pointer;
    position: relative;
    margin-left: 4px;
    color: white;
    &:before {
        font-family: ThalesIcons !important;
        content: '\\0043';
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 15px;
    }
`;

export default Tooltip;
