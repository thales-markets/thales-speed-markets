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

    const dateTimeTranslationMap = {
        years: t('common.time-remaining.years'),
        year: t('common.time-remaining.year'),
        months: t('common.time-remaining.months'),
        month: t('common.time-remaining.month'),
        weeks: t('common.time-remaining.weeks'),
        week: t('common.time-remaining.week'),
        days: t('common.time-remaining.days'),
        day: t('common.time-remaining.day'),
        hours: t('common.time-remaining.hours'),
        hour: t('common.time-remaining.hour'),
        minutes: t('common.time-remaining.minutes'),
        minute: t('common.time-remaining.minute'),
        seconds: t('common.time-remaining.seconds'),
        second: t('common.time-remaining.second'),
        'days-short': t('common.time-remaining.days-short'),
        'hours-short': t('common.time-remaining.hours-short'),
        'minutes-short': t('common.time-remaining.minutes-short'),
        'seconds-short': t('common.time-remaining.seconds-short'),
        'months-short': t('common.time-remaining.months-short'),
    };

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
            {children}
            <Time duration={duration}>
                {timeElapsed
                    ? t('common.time-remaining.ended')
                    : showRemainingInWeeks
                    ? `${weeksDiff} ${t('common.time-remaining.weeks')}`
                    : showFullCounter
                    ? formattedDurationFull(duration, dateTimeTranslationMap, undefined, undefined, showSecondsCounter)
                    : formattedDuration(duration, dateTimeTranslationMap)}
            </Time>
        </Container>
    );
};

const getColor = (duration: Duration, theme: ThemeInterface) => {
    if (
        duration.years ||
        duration.months ||
        duration.days ||
        duration.hours ||
        (duration.minutes && duration.minutes >= 2)
    ) {
        return theme.textColor.quinary;
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
    fontSize?: number;
}>`
    display: inline-block;
    ${(props) => (props.duration.minutes === 0 ? 'min-width: 23px;' : '')}
    font-size: 13px;
    font-weight: 800;
    border: none;
    text-align: center;
    white-space: pre;
`;

export default TimeRemaining;
