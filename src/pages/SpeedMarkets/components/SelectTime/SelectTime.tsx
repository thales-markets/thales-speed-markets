import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput/NumericInput';
import {
    hoursToMinutes,
    hoursToSeconds,
    minutesToHours,
    minutesToSeconds,
    secondsToHours,
    secondsToMinutes,
} from 'date-fns';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow, FlexDivStart } from 'styles/common';
import { AmmSpeedMarketsLimits } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { useAccount } from 'wagmi';
import { Header, HeaderText, PlusMinusIcon } from '../SelectPosition/styled-components';
import { ScreenSizeBreakpoint } from 'enums/ui';

type SelectTimeProps = {
    selectedDeltaSec: number;
    onDeltaChange: React.Dispatch<number>;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    isResetTriggered: boolean;
    isChained: boolean;
};

const SPEED_NUMBER_OF_BUTTONS = 4;

const CHAINED_TIMEFRAMES_MINUTES = [2, 5, 10];

const SelectTime: React.FC<SelectTimeProps> = ({
    selectedDeltaSec,
    onDeltaChange,
    ammSpeedMarketsLimits,
    isResetTriggered,
    isChained,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const { isConnected } = useAccount();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [showCustomDeltaTime, setShowCustomDeltaTime] = useState(false);
    const [customDeltaTime, setCustomDeltaTime] = useState(0);
    const [isDeltaMinutesSelected, setIsDeltaMinutesSelected] = useState(true); // false is when hours is selected

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

    // Validations
    useEffect(() => {
        if (!isChained) {
            if (ammSpeedMarketsLimits && customDeltaTime) {
                const customDeltaTimeSec = isDeltaMinutesSelected
                    ? minutesToSeconds(customDeltaTime)
                    : hoursToSeconds(customDeltaTime);

                if (customDeltaTimeSec < ammSpeedMarketsLimits.minimalTimeToMaturity) {
                    onDeltaChange(0);
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
                    onDeltaChange(0);
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
    }, [ammSpeedMarketsLimits, customDeltaTime, isDeltaMinutesSelected, t, isChained, onDeltaChange]);

    const resetData = useCallback(() => {
        setIsDeltaMinutesSelected(!!deltaTimesMinutes.length);
        setCustomDeltaTime(0);
        onDeltaChange(0);
    }, [onDeltaChange, deltaTimesMinutes]);

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
        setCustomDeltaTime(deltaHours ? deltaHours : deltaMinutes);
        setIsDeltaMinutesSelected(deltaHours ? false : true);
        onDeltaChange(deltaHours ? hoursToSeconds(deltaHours) : minutesToSeconds(deltaMinutes));
    };

    const onDeltaTimeInputChange = (value: number) => {
        setCustomDeltaTime(value);
        onDeltaChange(isDeltaMinutesSelected ? minutesToSeconds(Number(value)) : hoursToSeconds(Number(value)));
    };

    const onMinutesButtonClikHandler = () => {
        if (!isDeltaMinutesSelected) {
            setIsDeltaMinutesSelected(true);
            onDeltaChange(minutesToSeconds(customDeltaTime));
        }
    };

    const onHoursButtonClikHandler = () => {
        if (isDeltaMinutesSelected) {
            setIsDeltaMinutesSelected(false);
            onDeltaChange(hoursToSeconds(customDeltaTime));
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
                                $isChained
                                $isSelected={selectedDeltaSec === minutesToSeconds(deltaMinutes)}
                                onClick={() => onDeltaTimeClickHandler(0, deltaMinutes)}
                            >{`${deltaMinutes}m`}</Time>
                        ))}
                    </ChainedRow>
                ) : (
                    // Single
                    <>
                        <SingleRow>
                            {deltaTimesMinutes.map((deltaMinutes, index) => (
                                <Time
                                    key={'minutes' + index}
                                    $isChained={false}
                                    $isSelected={selectedDeltaSec === minutesToSeconds(deltaMinutes)}
                                    onClick={() => onDeltaTimeClickHandler(0, deltaMinutes)}
                                >{`${deltaMinutes}m`}</Time>
                            ))}
                            {deltaTimesHours.map((deltaHours, index) => (
                                <Time
                                    key={'hours' + index}
                                    $isChained={false}
                                    $isSelected={selectedDeltaSec === hoursToSeconds(deltaHours)}
                                    onClick={() => onDeltaTimeClickHandler(deltaHours, 0)}
                                >{`${deltaHours}h`}</Time>
                            ))}
                            <PlusMinusIcon
                                className={
                                    showCustomDeltaTime
                                        ? 'network-icon network-icon--minus'
                                        : 'network-icon network-icon--plus'
                                }
                                onClick={onCustomTimeClickHandler}
                            />
                        </SingleRow>

                        {showCustomDeltaTime && (
                            <Row>
                                <InputWrapper>
                                    <NumericInput
                                        value={customDeltaTime || ''}
                                        placeholder={
                                            isDeltaMinutesSelected ? t('common.enter-minutes') : t('common.enter-hours')
                                        }
                                        onChange={(_, value) => onDeltaTimeInputChange(Number(value))}
                                        showValidation={!!errorMessage}
                                        validationMessage={errorMessage}
                                        margin="0"
                                        inputPadding="5px 40px 5px 10px"
                                    />
                                </InputWrapper>
                                <Column>
                                    <Button
                                        height="18px"
                                        width={isMobile ? '60px' : '70px'}
                                        borderWidth={isDeltaMinutesSelected ? '0px' : '1px'}
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
                                        height="18px"
                                        width={isMobile ? '60px' : '70px'}
                                        borderWidth={isDeltaMinutesSelected ? '1px' : '0px'}
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

const SingleRow = styled(FlexDivRow)`
    align-items: center;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        justify-content: center;
        gap: 14px;
    }
`;

const ChainedRow = styled(FlexDivStart)`
    gap: 10px;
`;

const Column = styled(FlexDivColumnCentered)`
    justify-content: space-between;
    margin-left: 10px;
`;

const InputWrapper = styled.div`
    width: 100%;
`;

const Time = styled(FlexDivCentered)<{ $isChained: boolean; $isSelected: boolean }>`
    min-width: 60px;

    height: 40px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: ${(props) => (props.$isChained ? '60px' : '100%')};
    }
`;

export default SelectTime;
