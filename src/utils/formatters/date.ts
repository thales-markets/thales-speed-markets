import { format, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import i18n from 'i18n';

export const formatShortDateWithFullTime = (date: Date | number) => format(date, 'd MMM yyyy HH:mm:ss');
export const formatHoursMinutesSecondsFromTimestamp = (timestamp: number) => format(timestamp, 'HH:mm:ss');

const defaultDateTimeTranslationMap = {
    years: i18n.t('common.time-remaining.years'),
    year: i18n.t('common.time-remaining.year'),
    months: i18n.t('common.time-remaining.months'),
    month: i18n.t('common.time-remaining.month'),
    weeks: i18n.t('common.time-remaining.weeks'),
    week: i18n.t('common.time-remaining.week'),
    days: i18n.t('common.time-remaining.days'),
    day: i18n.t('common.time-remaining.day'),
    hours: i18n.t('common.time-remaining.hours'),
    hour: i18n.t('common.time-remaining.hour'),
    minutes: i18n.t('common.time-remaining.minutes'),
    minute: i18n.t('common.time-remaining.minute'),
    seconds: i18n.t('common.time-remaining.seconds'),
    second: i18n.t('common.time-remaining.second'),
    'days-short': i18n.t('common.time-remaining.days-short'),
    'hours-short': i18n.t('common.time-remaining.hours-short'),
    'minutes-short': i18n.t('common.time-remaining.minutes-short'),
    'seconds-short': i18n.t('common.time-remaining.seconds-short'),
    'months-short': i18n.t('common.time-remaining.months-short'),
};

// date-fns formatDuration does not let us customize the actual string, so we need to write this custom formatter.
export const formattedDuration = (duration: Duration, showSeconds = false, delimiter = ' ', firstTwo = false) => {
    const formatted = [];
    if (duration.years) {
        return `${duration.years} ${
            duration.years > 1 ? defaultDateTimeTranslationMap['years'] : defaultDateTimeTranslationMap['year']
        }`;
    }
    if (duration.months) {
        return `${duration.months} ${
            duration.months > 1 ? defaultDateTimeTranslationMap['months'] : defaultDateTimeTranslationMap['month']
        }`;
    }
    if (duration.days) {
        if (duration.days === 1 && duration.hours === 0) {
            return `24 ${defaultDateTimeTranslationMap['hours']}`;
        }

        return `${duration.days} ${
            duration.days > 1 ? defaultDateTimeTranslationMap['days'] : defaultDateTimeTranslationMap['day']
        } ${
            duration.hours
                ? `${duration.hours} ${
                      duration.hours > 1
                          ? defaultDateTimeTranslationMap['hours']
                          : defaultDateTimeTranslationMap['hour']
                  }`
                : ''
        }`;
    }
    if (duration.hours) {
        return `${duration.hours} ${
            duration.hours > 1 ? defaultDateTimeTranslationMap['hours'] : defaultDateTimeTranslationMap['hour']
        }`;
    }
    if (duration.minutes) {
        if (!showSeconds) {
            return `${duration.minutes} ${
                duration.minutes > 1
                    ? defaultDateTimeTranslationMap['minutes']
                    : defaultDateTimeTranslationMap['minute']
            }`;
        }
        formatted.push(`${duration.minutes}${defaultDateTimeTranslationMap['minutes-short']}`);
    }
    if (duration.seconds != null) {
        formatted.push(`${duration.seconds}${defaultDateTimeTranslationMap['seconds-short']}`);
    }
    return (firstTwo ? formatted.slice(0, 2) : formatted).join(delimiter);
};

export const formattedDurationFull = (duration: Duration, delimiter = ' ', firstTwo = false, showSeconds = false) => {
    const formatted = [];
    if (
        showSeconds &&
        duration?.months === 0 &&
        duration?.days === 0 &&
        duration?.hours === 0 &&
        duration?.minutes === 0 &&
        duration.seconds != null
    ) {
        formatted.push(`${duration.seconds}${defaultDateTimeTranslationMap['seconds-short']}`);
    } else {
        duration?.months && duration.months > 0
            ? formatted.push(`${duration.months}${defaultDateTimeTranslationMap['months-short']}`)
            : '';
        duration?.days && duration.days > 0
            ? formatted.push(`${duration.days}${defaultDateTimeTranslationMap['days-short']}`)
            : '';
        duration?.hours && duration.hours > 0
            ? formatted.push(`${duration.hours}${defaultDateTimeTranslationMap['hours-short']}`)
            : '';
        duration?.minutes && duration.minutes > 0
            ? formatted.push(`${duration.minutes}${defaultDateTimeTranslationMap['minutes-short']}`)
            : '';
    }
    return (firstTwo ? formatted.slice(0, 2) : formatted).join(delimiter);
};

export function timeToLocal(originalTime: number) {
    const d = new Date(secondsToMilliseconds(originalTime));
    return millisecondsToSeconds(
        Date.UTC(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds(),
            d.getMilliseconds()
        )
    );
}
