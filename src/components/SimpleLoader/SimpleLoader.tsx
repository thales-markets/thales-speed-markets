import React from 'react';
import styled from 'styled-components';

const WIDTH = 80;
const STROKE_WIDTH = 4;

const SimpleLoader: React.FC = () => {
    return (
        <SVG>
            <ProgressTrack cx={WIDTH / 2 + 'px'} cy={WIDTH / 2 + 'px'} r={WIDTH / 3 + 'px'}></ProgressTrack>
            <ProgressIndicator cx={WIDTH / 2 + 'px'} cy={WIDTH / 2 + 'px'} r={WIDTH / 3 + 'px'}></ProgressIndicator>
        </SVG>
    );
};

const SVG = styled.svg`
    width: ${WIDTH}px;
    height: ${WIDTH}px;
    position: absolute;
    left: calc(50% - ${WIDTH / 2}px);
    top: calc(50% - ${WIDTH / 2}px);
`;

const Circle = styled.circle`
    width: ${WIDTH}px;
    height: ${WIDTH}px;
    position: relative;
`;

const ProgressTrack = styled(Circle)`
    fill: none;
    stroke: ${(props) => props.theme.borderColor.primary};
    stroke-width: ${STROKE_WIDTH};
`;

const ProgressIndicator = styled(Circle)`
    fill: none;
    stroke: ${(props) => props.theme.borderColor.quaternary};
    stroke-width: ${STROKE_WIDTH};
    stroke-linecap: round;
    stroke-dasharray: ${WIDTH * 2};
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: animate-progress 1s linear infinite;

    @keyframes animate-progress {
        0% {
            stroke-dashoffset: ${WIDTH};
            transform: rotate(0deg);
        }
        25% {
            stroke-dashoffset: ${WIDTH};
            transform: rotate(90deg);
        }
        50% {
            stroke-dashoffset: ${WIDTH}; /* Half of the circumference */
            transform: rotate(180deg);
        }
        75% {
            stroke-dashoffset: ${WIDTH}; /* Half of the circumference */
            transform: rotate(270deg);
        }
        100% {
            stroke-dashoffset: ${WIDTH};
            transform: rotate(360deg);
        }
    }
`;

export default SimpleLoader;
