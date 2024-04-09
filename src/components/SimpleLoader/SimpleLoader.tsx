import React from 'react';
import styled from 'styled-components';

const WIDTH = 80;
const STROKE_WIDTH = 4;

type SimpleLoaderProps = {
    width?: number;
    strokeWidth?: number;
};

const SimpleLoader: React.FC<SimpleLoaderProps> = ({ width = WIDTH, strokeWidth = STROKE_WIDTH }) => {
    return (
        <SVG width={width}>
            <ProgressTrack
                $strokeWidth={strokeWidth}
                width={width}
                cx={width / 2 + 'px'}
                cy={width / 2 + 'px'}
                r={width / 3 + 'px'}
            ></ProgressTrack>
            <ProgressIndicator
                $strokeWidth={strokeWidth}
                width={width}
                cx={width / 2 + 'px'}
                cy={width / 2 + 'px'}
                r={width / 3 + 'px'}
            ></ProgressIndicator>
        </SVG>
    );
};

const SVG = styled.svg<{ width: number }>`
    width: ${(props) => props.width}px;
    height: ${(props) => props.width}px;
    position: absolute;
    left: calc(50% - ${(props) => props.width / 2}px);
    top: calc(50% - ${(props) => props.width / 2}px);
`;

const Circle = styled.circle<{ width: number }>`
    width: ${(props) => props.width}px;
    height: ${(props) => props.width}px;
    position: relative;
`;

const ProgressTrack = styled(Circle)<{ $strokeWidth: number }>`
    fill: none;
    stroke: ${(props) => props.theme.borderColor.primary};
    stroke-width: ${(props) => props.$strokeWidth}px;
`;

const ProgressIndicator = styled(Circle)<{ $strokeWidth: number }>`
    fill: none;
    stroke: ${(props) => props.theme.borderColor.quaternary};
    stroke-width: ${(props) => props.$strokeWidth}px;
    stroke-linecap: round;
    stroke-dasharray: ${(props) => props.width * 2};
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: animate-progress 1s linear infinite;

    @keyframes animate-progress {
        0% {
            stroke-dashoffset: ${(props) => props.width};
            transform: rotate(0deg);
        }
        25% {
            stroke-dashoffset: ${(props) => props.width};
            transform: rotate(90deg);
        }
        50% {
            stroke-dashoffset: ${(props) => props.width}; /* Half of the circumference */
            transform: rotate(180deg);
        }
        75% {
            stroke-dashoffset: ${(props) => props.width}; /* Half of the circumference */
            transform: rotate(270deg);
        }
        100% {
            stroke-dashoffset: ${(props) => props.width};
            transform: rotate(360deg);
        }
    }
`;

export default SimpleLoader;
