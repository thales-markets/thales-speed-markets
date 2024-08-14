import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import intervalToDuration from 'date-fns/intervalToDuration';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import { formattedDuration, formattedDurationFull } from 'utils/formatters/date';
import useInterval from 'hooks/useInterval';
import styled from 'styled-components';
import { ThemeInterface } from 'types/ui';

type TimeRemainingProps = {
    end: Date | number;
    showFullCounter?: boolean;
    showSecondsCounter?: boolean;
    children?: React.ReactNode;
};

const ONE_SECOND_IN_MS = 1000;
const SHOW_WEEKS_THRESHOLD = 4;

const TimeRemaining: React.FC<TimeRemainingProps> = ({ end, showFullCounter, showSecondsCounter, children }) => {
    const { t } = useTranslation();

    const now = Date.now();

    const [timeElapsed, setTimeElapsed] = useState(now >= Number(end));
    const [weeksDiff, setWeekDiff] = useState(Math.abs(differenceInWeeks(now, end)));
    const [showRemainingInWeeks, setShowRemainingInWeeks] = useState(weeksDiff > SHOW_WEEKS_THRESHOLD);
    const [countdownDisabled, setCountdownDisabled] = useState(timeElapsed || showRemainingInWeeks);
    const [timeInterval, setTimeInterval] = useState<number | null>(countdownDisabled ? null : ONE_SECOND_IN_MS);
    const [duration, setDuration] = useState<Duration>(intervalToDuration({ start: now, end }));

    useEffect(() => {
        const nowValue = Date.now();

        const timeElapsedValue = nowValue >= Number(end);
        setTimeElapsed(timeElapsedValue);

        const weekDiffValue = Math.abs(differenceInWeeks(nowValue, end));
        setWeekDiff(weekDiffValue);

        const showRemainingInWeeksValue = weekDiffValue > SHOW_WEEKS_THRESHOLD;
        setShowRemainingInWeeks(showRemainingInWeeksValue);

        const countdownDisabledValue = timeElapsedValue || showRemainingInWeeksValue;
        setCountdownDisabled(countdownDisabledValue);

        setTimeInterval(countdownDisabledValue ? null : ONE_SECOND_IN_MS);
        setDuration(intervalToDuration({ start: timeElapsed ? end : nowValue, end }));
    }, [end, timeElapsed]);

    useInterval(() => {
        const nowValue = Date.now();
        if (nowValue <= Number(end)) {
            setDuration(intervalToDuration({ start: nowValue, end }));
        } else {
            setTimeElapsed(true);
            setTimeInterval(null);
        }
    }, timeInterval);

    return (
        <Container duration={duration}>
            {timeElapsed ? (
                <Message>{t('speed-markets.user-positions.waiting-price')}</Message>
            ) : (
                <>
                    {children}
                    <Time duration={duration}>
                        {showRemainingInWeeks
                            ? `${weeksDiff} ${t('common.time-remaining.weeks')}`
                            : showFullCounter
                            ? formattedDurationFull(duration, undefined, undefined, showSecondsCounter)
                            : formattedDuration(duration)}
                    </Time>
                </>
            )}
        </Container>
    );
};

const MINUTES_COLOR_THRESHOLD = 2;
const getColor = (duration: Duration, theme: ThemeInterface) => {
    if (
        duration.years ||
        duration.months ||
        duration.days ||
        duration.hours ||
        (duration.minutes && duration.minutes >= MINUTES_COLOR_THRESHOLD)
    ) {
        return theme.textColor.primary;
    }
    return theme.error.textColor.primary;
};

const Container = styled.span<{ duration: Duration }>`
    color: ${(props) => getColor(props.duration, props.theme)};

    i {
        color: ${(props) => getColor(props.duration, props.theme)};
    }
`;

const Time = styled.span<{
    duration: Duration;
}>`
    display: inline-block;
    ${(props) => (props.duration.minutes === 0 ? 'min-width: 23px;' : '')}
    font-size: 13px;
    font-weight: 800;
    border: none;
    text-align: center;
    white-space: pre;
`;

const Message = styled.span`
    display: inline-block;
    min-width: 23px;
    text-transform: uppercase;
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    text-align: center;
    white-space: pre;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default TimeRemaining;
