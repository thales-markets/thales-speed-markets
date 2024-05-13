import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput/NumericInput';
import {
    hoursToMinutes,
    hoursToSeconds,
    millisecondsToSeconds,
    minutesToHours,
    minutesToSeconds,
    secondsToHours,
    secondsToMilliseconds,
    secondsToMinutes,
} from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow, FlexDivStart } from 'styles/common';
import { AmmSpeedMarketsLimits } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { useAccount } from 'wagmi';
import { Header, HeaderText } from '../SelectPosition/styled-components';

type SelectTimeProps = {
    selectedDeltaSec: number;
    onDeltaChange: React.Dispatch<number>;
    onExactTimeChange: React.Dispatch<number>;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    isResetTriggered: boolean;
    isChained: boolean;
};

const SPEED_NUMBER_OF_BUTTONS = 4;

const CHAINED_TIMEFRAMES_MINUTES = [2, 5, 10];

const SelectTime: React.FC<SelectTimeProps> = ({
    selectedDeltaSec,
    onDeltaChange,
    onExactTimeChange,
    ammSpeedMarketsLimits,
    isResetTriggered,
    isChained,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const { isConnected } = useAccount();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [isDeltaSelected, setIsDeltaSelected] = useState(true); // false is when exact time is selected
    const [showCustomDeltaTime, setShowCustomDeltaTime] = useState(false);
    const [customDeltaTime, setCustomDeltaTime] = useState<string | number>('');
    const [isDeltaMinutesSelected, setIsDeltaMinutesSelected] = useState(true); // false is when hours is selected

    const DEFAULT_HOURS = '12';
    const DEFAULT_MINUTES = '00';
    const [exactTimeHours, setExactTimeHours] = useState(DEFAULT_HOURS);
    const [exactTimeMinutes, setExactTimeMinutes] = useState(DEFAULT_MINUTES);
    const [isAM, setIsAM] = useState(true); // false is when it is PM

    const [errorMessage, setErrorMessage] = useState('');

    const deltaTimesMinutes: number[] = useMemo(() => {
        let times: number[] = [];
        if (isChained) {
            times = CHAINED_TIMEFRAMES_MINUTES;
        } else {
            if (ammSpeedMarketsLimits && secondsToHours(ammSpeedMarketsLimits?.minimalTimeToMaturity) === 0) {
                times = ammSpeedMarketsLimits.timeThresholdsForFees
                    .filter((time: number) => time < hoursToMinutes(1))
                    .slice(0, SPEED_NUMBER_OF_BUTTONS);
                setIsDeltaMinutesSelected(true);
            } else {
                setIsDeltaMinutesSelected(false);
            }
        }

        return times;
    }, [ammSpeedMarketsLimits, isChained]);

    const deltaTimesHours: number[] = useMemo(() => {
        let times: number[] = [];
        const numberOfButtonsLeft = SPEED_NUMBER_OF_BUTTONS - deltaTimesMinutes.length;
        if (ammSpeedMarketsLimits && numberOfButtonsLeft > 0) {
            times = ammSpeedMarketsLimits.timeThresholdsForFees
                .filter((timeMinute: number) => timeMinute >= hoursToMinutes(1))
                .slice(0, numberOfButtonsLeft)
                .map((timeMinute) => minutesToHours(timeMinute));
        }

        return times;
    }, [ammSpeedMarketsLimits, deltaTimesMinutes]);

    const isValidExactTime = useCallback(
        (exactTime: Date | undefined) => {
            if (!isDeltaSelected) {
                if (
                    exactTime &&
                    ammSpeedMarketsLimits &&
                    exactTime.getTime() - Date.now() <
                        secondsToMilliseconds(ammSpeedMarketsLimits?.minimalTimeToMaturity)
                ) {
                    const minimalTimeHours = secondsToHours(ammSpeedMarketsLimits?.minimalTimeToMaturity || 0);
                    setErrorMessage(
                        t('speed-markets.errors.min-maturity-date', {
                            minTime:
                                minimalTimeHours === 0
                                    ? secondsToMinutes(ammSpeedMarketsLimits?.minimalTimeToMaturity || 0)
                                    : minimalTimeHours,
                            timeUnit:
                                minimalTimeHours === 0
                                    ? t('common.time-remaining.minutes')
                                    : minimalTimeHours === 1
                                    ? t('common.time-remaining.hour')
                                    : t('common.time-remaining.hours'),
                        })
                    );
                    return false;
                }

                setErrorMessage('');
                return true;
            }
        },
        [ammSpeedMarketsLimits, isDeltaSelected, t]
    );

    const getExactTime = useCallback(() => {
        if (!isDeltaSelected) {
            const exactTime = new Date();
            exactTime.setHours(
                isAM
                    ? Number(exactTimeHours) === 12
                        ? 0
                        : Number(exactTimeHours)
                    : Number(exactTimeHours) === 12
                    ? 12
                    : Number(exactTimeHours) + 12
            );
            exactTime.setMinutes(Number(exactTimeMinutes));
            exactTime.setSeconds(0);
            exactTime.setMilliseconds(0);
            if (exactTime.getTime() < Date.now()) {
                // if in the past move it for one day
                exactTime.setDate(exactTime.getDate() + 1);
            }
            return exactTime;
        }
    }, [isDeltaSelected, isAM, exactTimeHours, exactTimeMinutes]);

    // Exact time handler
    useEffect(() => {
        if (!isDeltaSelected) {
            const exactTime = getExactTime();

            if (!isValidExactTime(exactTime)) {
                return;
            }

            if (exactTime) {
                const exactTimeSec = millisecondsToSeconds(exactTime.getTime());
                onExactTimeChange(exactTimeSec);
            }
        }
    }, [
        ammSpeedMarketsLimits,
        isDeltaSelected,
        isAM,
        exactTimeHours,
        exactTimeMinutes,
        getExactTime,
        isValidExactTime,
        onExactTimeChange,
    ]);

    useInterval(() => isValidExactTime(getExactTime()), secondsToMilliseconds(10));

    // Validations for delta time
    useEffect(() => {
        if (isDeltaSelected && !isChained) {
            if (ammSpeedMarketsLimits && customDeltaTime !== '') {
                const customDeltaTimeSec = isDeltaMinutesSelected
                    ? minutesToSeconds(Number(customDeltaTime))
                    : hoursToSeconds(Number(customDeltaTime));

                if (customDeltaTimeSec < ammSpeedMarketsLimits.minimalTimeToMaturity) {
                    const minimalTimeHours = secondsToHours(ammSpeedMarketsLimits?.minimalTimeToMaturity || 0);
                    setErrorMessage(
                        t('speed-markets.errors.min-time', {
                            minTime:
                                isDeltaMinutesSelected || minimalTimeHours === 0
                                    ? secondsToMinutes(ammSpeedMarketsLimits?.minimalTimeToMaturity || 0)
                                    : minimalTimeHours,
                            timeUnit:
                                isDeltaMinutesSelected || minimalTimeHours === 0
                                    ? t('common.time-remaining.minutes')
                                    : t('common.time-remaining.hours'),
                        })
                    );
                    return;
                } else if (customDeltaTimeSec > ammSpeedMarketsLimits.maximalTimeToMaturity) {
                    setErrorMessage(
                        t('speed-markets.errors.max-time', {
                            maxTime: isDeltaMinutesSelected
                                ? secondsToMinutes(ammSpeedMarketsLimits?.maximalTimeToMaturity || 0)
                                : secondsToHours(ammSpeedMarketsLimits?.maximalTimeToMaturity || 0),
                            timeUnit: isDeltaMinutesSelected
                                ? t('common.time-remaining.minutes')
                                : t('common.time-remaining.hours'),
                        })
                    );
                    return;
                }
            }

            setErrorMessage('');
        }
    }, [ammSpeedMarketsLimits, customDeltaTime, isDeltaMinutesSelected, t, isDeltaSelected, isChained]);

    const resetData = useCallback(() => {
        setIsDeltaSelected(true);
        setIsDeltaMinutesSelected(!!deltaTimesMinutes.length);
        setCustomDeltaTime('');
        onDeltaChange(0);

        setIsAM(true);
        setExactTimeHours(DEFAULT_HOURS);
        setExactTimeMinutes(DEFAULT_MINUTES);
        onExactTimeChange(0);
    }, [onDeltaChange, onExactTimeChange, deltaTimesMinutes]);

    // Reset inputs
    useEffect(() => {
        if (!isConnected || isResetTriggered) {
            resetData();
        }
    }, [isConnected, resetData, isResetTriggered]);

    useEffect(() => {
        resetData();
    }, [isChained, resetData]);

    const onDeltaTimeClickHandler = (deltaHours: number, deltaMinutes: number) => {
        setIsDeltaSelected(true);
        setCustomDeltaTime(deltaHours ? deltaHours : deltaMinutes);
        setIsDeltaMinutesSelected(deltaHours ? false : true);
        onDeltaChange(deltaHours ? hoursToSeconds(deltaHours) : minutesToSeconds(deltaMinutes));
        onExactTimeChange(0);
    };

    const onDeltaTimeInputChange = (value: number | string) => {
        setCustomDeltaTime(value);
        onDeltaChange(isDeltaMinutesSelected ? minutesToSeconds(Number(value)) : hoursToSeconds(Number(value)));
        onExactTimeChange(0);
    };

    const onMinutesButtonClikHandler = () => {
        if (!isDeltaMinutesSelected) {
            setIsDeltaMinutesSelected(true);
            onDeltaChange(minutesToSeconds(Number(customDeltaTime)));
        }
    };

    const onHoursButtonClikHandler = () => {
        if (isDeltaMinutesSelected) {
            setIsDeltaMinutesSelected(false);
            onDeltaChange(hoursToSeconds(Number(customDeltaTime)));
        }
    };

    const onCustomTimeClickHandler = () => {
        setShowCustomDeltaTime(!showCustomDeltaTime);
    };

    return (
        <div>
            <Header>
                <HeaderText> {t('speed-markets.steps.choose-time')}</HeaderText>
            </Header>
            <Container>
                {isChained ? (
                    // Chained
                    <ChainedRow>
                        {deltaTimesMinutes.map((deltaMinutes, index) => (
                            <Time
                                key={'minutes' + index}
                                $isSelected={isDeltaSelected && selectedDeltaSec === minutesToSeconds(deltaMinutes)}
                                onClick={() => onDeltaTimeClickHandler(0, deltaMinutes)}
                            >{`${deltaMinutes}m`}</Time>
                        ))}
                    </ChainedRow>
                ) : (
                    // Single
                    <>
                        <FlexDivRow>
                            {deltaTimesMinutes.map((deltaMinutes, index) => (
                                <Time
                                    key={'minutes' + index}
                                    $isSelected={isDeltaSelected && selectedDeltaSec === minutesToSeconds(deltaMinutes)}
                                    onClick={() => onDeltaTimeClickHandler(0, deltaMinutes)}
                                >{`${deltaMinutes}m`}</Time>
                            ))}
                            {deltaTimesHours.map((deltaHours, index) => (
                                <Time
                                    key={'hours' + index}
                                    $isSelected={isDeltaSelected && selectedDeltaSec === hoursToSeconds(deltaHours)}
                                    onClick={() => onDeltaTimeClickHandler(deltaHours, 0)}
                                >{`${deltaHours}h`}</Time>
                            ))}
                            <Time $isSelected={showCustomDeltaTime} onClick={onCustomTimeClickHandler}>
                                {'CUSTOM'}
                            </Time>
                        </FlexDivRow>

                        {showCustomDeltaTime && (
                            <Row>
                                <InputWrapper>
                                    <NumericInput
                                        value={customDeltaTime}
                                        placeholder={
                                            isDeltaMinutesSelected ? t('common.enter-minutes') : t('common.enter-hours')
                                        }
                                        onChange={(_, value) => onDeltaTimeInputChange(value)}
                                        showValidation={!!errorMessage}
                                        validationMessage={errorMessage}
                                        margin="0"
                                        inputPadding="5px 40px 5px 10px"
                                    />
                                </InputWrapper>
                                <Column>
                                    <Button
                                        height="13px"
                                        width={isMobile ? '60px' : '70px'}
                                        padding={isDeltaMinutesSelected ? '0' : '1px'}
                                        fontSize="12px"
                                        backgroundColor={
                                            isDeltaMinutesSelected
                                                ? theme.button.background.secondary
                                                : theme.button.background.primary
                                        }
                                        borderRadius="4px"
                                        borderColor={
                                            isDeltaMinutesSelected ? undefined : theme.button.borderColor.secondary
                                        }
                                        textColor={
                                            isDeltaMinutesSelected
                                                ? theme.button.textColor.secondary
                                                : theme.button.textColor.tertiary
                                        }
                                        onClick={onMinutesButtonClikHandler}
                                    >
                                        {t('common.time-remaining.minutes')}
                                    </Button>
                                    <Button
                                        height="13px"
                                        width={isMobile ? '60px' : '70px'}
                                        padding={isDeltaMinutesSelected ? '1px' : '0'}
                                        fontSize="12px"
                                        backgroundColor={
                                            isDeltaMinutesSelected
                                                ? theme.button.background.primary
                                                : theme.button.background.secondary
                                        }
                                        borderRadius="4px"
                                        borderColor={
                                            isDeltaMinutesSelected ? theme.button.borderColor.secondary : undefined
                                        }
                                        textColor={
                                            isDeltaMinutesSelected
                                                ? theme.button.textColor.tertiary
                                                : theme.button.textColor.secondary
                                        }
                                        onClick={onHoursButtonClikHandler}
                                    >
                                        {t('common.time-remaining.hours')}
                                    </Button>
                                </Column>
                            </Row>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

const Container = styled.div`
    width: 100%;
`;

const Row = styled(FlexDivRow)`
    margin-top: 10px;
`;

const ChainedRow = styled(FlexDivStart)`
    gap: 10px;
`;

const Column = styled(FlexDivColumnCentered)`
    justify-content: space-evenly;
    margin-left: 10px;
`;

const InputWrapper = styled.div`
    width: 100%;
`;

const Time = styled(FlexDivCentered)<{ $isSelected: boolean }>`
    width: 60px;
    height: 40px;
    border-radius: 8px;
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 13px;
    font-style: normal;
    font-weight: 800;
    line-height: 100%;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 60px;
    }
`;

export default SelectTime;
