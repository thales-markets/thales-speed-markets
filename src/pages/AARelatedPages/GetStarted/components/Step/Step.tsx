import ROUTES from 'constants/routes';
import { GetStartedStep } from 'enums/wizard';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { RootState } from 'types/ui';
import { getDefaultCollateral } from 'utils/currency';
import { getNetworkNameByNetworkId } from 'utils/network';
import { buildHref, navigateTo } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';
import InsertCard from 'assets/images/wizard/insert-card.svg?react';

type StepProps = {
    stepNumber: number;
    stepType: GetStartedStep;
    currentStep: GetStartedStep;
    setCurrentStep: (step: GetStartedStep) => void;
    hasFunds: boolean;
};

const Step: React.FC<StepProps> = ({ stepNumber, stepType, currentStep, setCurrentStep, hasFunds }) => {
    const networkId = useChainId();
    const dispatch = useDispatch();
    const { isConnected: isWalletConnected } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const { t } = useTranslation();

    const isActive = currentStep === stepType;
    const isDisabled = !isWalletConnected && stepType !== GetStartedStep.LOG_IN;

    const stepTitle = useMemo(() => {
        let transKey = 'get-started.steps.title';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                transKey += isBiconomy && isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                transKey += '.trade';
                break;
        }
        return t(transKey);
    }, [isBiconomy, isWalletConnected, stepType, t]);

    const stepDescription = useMemo(() => {
        let transKey = 'get-started.steps.description';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                transKey += isBiconomy && isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                transKey += '.trade';
                break;
        }

        return t(transKey, {
            network: getNetworkNameByNetworkId(networkId, true),
            collateral: getDefaultCollateral(networkId),
        });
    }, [stepType, networkId, isBiconomy, isWalletConnected, t]);

    const showStepIcon = useMemo(() => {
        if (isWalletConnected) {
            switch (stepType) {
                case GetStartedStep.LOG_IN:
                    return isWalletConnected;

                case GetStartedStep.DEPOSIT:
                    return hasFunds;

                case GetStartedStep.TRADE:
                    return false;
            }
        }
    }, [isWalletConnected, stepType, hasFunds]);

    const getStepAction = () => {
        let className = '';
        let transKey = 'get-started.steps.action';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                className = 'icon--card';
                transKey += isBiconomy && isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                className = 'icon--card';
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                className = 'icon--markets';
                transKey += '.trade';
                break;
        }
        return (
            <StepAction>
                <StepActionIconWrapper isActive={isActive} pulsate={!isMobile}>
                    {stepType === GetStartedStep.DEPOSIT ? (
                        <StyledInsertCard completed={!isActive && showStepIcon} isActive={isActive} />
                    ) : (
                        <StepActionIcon
                            className={`icon ${className}`}
                            isDisabled={isDisabled}
                            isActive={isActive}
                            completed={!isActive && showStepIcon}
                        />
                    )}
                </StepActionIconWrapper>
                <StepActionLabel isDisabled={isDisabled} onClick={onStepActionClickHandler}>
                    <StepActionName isActive={isActive} completed={!isActive && showStepIcon}>
                        {t(transKey)}
                    </StepActionName>
                    {!isMobile && (
                        <LinkIcon
                            className={`icon icon--external`}
                            isActive={isActive}
                            completed={!isActive && showStepIcon}
                        />
                    )}
                </StepActionLabel>
            </StepAction>
        );
    };

    const onStepActionClickHandler = () => {
        if (isDisabled) {
            return;
        }
        setCurrentStep(stepType);
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                dispatch(
                    setWalletConnectModalVisibility({
                        visibility: true,
                    })
                );
                break;
            case GetStartedStep.DEPOSIT:
                navigateTo(buildHref(ROUTES.Deposit));
                break;
            case GetStartedStep.TRADE:
                navigateTo(buildHref(ROUTES.Home));
                break;
        }
    };

    const changeCurrentStep = () => (isDisabled ? null : setCurrentStep(stepType));

    return (
        <Container onClick={isActive ? onStepActionClickHandler : () => {}}>
            <StepNumberSection>
                <StepNumberWrapper
                    completed={!isActive && showStepIcon}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    onClick={changeCurrentStep}
                >
                    <StepNumber isActive={isActive}>
                        {!isActive && showStepIcon ? <CorrectIcon className="icon icon--correct" /> : stepNumber}
                    </StepNumber>
                </StepNumberWrapper>
            </StepNumberSection>
            <StepDescriptionSection isActive={isActive} isDisabled={isDisabled} onClick={changeCurrentStep}>
                <StepTitle completed={!isActive && showStepIcon}>{stepTitle}</StepTitle>
                <StepDescription completed={!isActive && showStepIcon}>{stepDescription}</StepDescription>
            </StepDescriptionSection>
            {stepType !== GetStartedStep.LOG_IN && (
                <StepActionSection isActive={isActive} isDisabled={isDisabled}>
                    {getStepAction()}
                </StepActionSection>
            )}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    margin-top: 20px;
    margin-bottom: 20px;
    gap: 30px;
    @media (max-width: 600px) {
        gap: 16px;
    }
`;

const StepNumberSection = styled(FlexDivCentered)``;

const StepDescriptionSection = styled(FlexDivColumn)<{ isActive: boolean; isDisabled?: boolean }>`
    color: ${(props) => (props.isActive ? props.theme.textColor.primary : props.theme.textColor.secondary)};
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
`;

const StepActionSection = styled(FlexDivCentered)<{ isActive: boolean; isDisabled?: boolean }>`
    text-align: center;
    color: ${(props) => (props.isActive ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
`;

const StepAction = styled.div`
    width: 180px;
    @media (max-width: 600px) {
        width: 80px;
    }
`;

const StepTitle = styled.span<{ completed?: boolean }>`
    font-weight: 700;
    font-size: 20px;
    line-height: 27px;
    color: ${(props) => (props.completed ? props.theme.background.quinary : '')};
    margin-bottom: 10px;
`;

const StepDescription = styled.p<{ completed?: boolean }>`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    text-align: justify;
    color: ${(props) => (props.completed ? props.theme.background.quinary : '')};
`;

const StepNumberWrapper = styled.div<{ isActive: boolean; isDisabled?: boolean; completed?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 2px solid ${(props) => (props.completed ? props.theme.textColor.quinary : props.theme.textColor.primary)};
    ${(props) =>
        props.isActive ? '' : `background: ${props.completed ? props.theme.background.quinary : 'transparent'};`}
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
    @media (max-width: 600px) {
        width: 36px;
        height: 36px;
    }
    opacity: ${(props) => (props.completed || props.isActive ? 1 : 0.7)};
`;

const StepNumber = styled.span<{ isActive: boolean }>`
    font-weight: 700;
    font-size: 29px;
    @media (max-width: 600px) {
        font-size: 20px;
    }
    line-height: 43px;
    text-transform: uppercase;
    color: ${(props) => props.theme.button.textColor.primary};
`;

const StepActionIconWrapper = styled.div<{ isActive: boolean; pulsate?: boolean }>`
    text-align: center;
    animation: ${(props) => (props.pulsate && props.isActive ? 'pulsing 1s ease-in' : '')};
    animation-iteration-count: ${(props) => (props.pulsate && props.isActive ? 'infinite;' : '')};

    @keyframes pulsing {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.3);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

const StepActionIcon = styled.i<{ isDisabled?: boolean; isActive?: boolean; completed?: boolean }>`
    font-size: 35px;
    padding-bottom: 15px;
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
    color: ${(props) => (props.completed ? props.theme.textColor.quinary : props.theme.textColor.primary)};
    opacity: ${(props) => (props.completed || props.isActive ? 1 : 0.7)};
`;

const StepActionLabel = styled.div<{ isDisabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
`;

const StepActionName = styled.span<{ isActive?: boolean; completed?: boolean }>`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: ${(props) => (props.completed ? props.theme.textColor.quinary : props.theme.textColor.primary)};
    opacity: ${(props) => (props.completed || props.isActive ? 1 : 0.7)};
    white-space: nowrap;
    @media (max-width: 600px) {
        display: none;
    }
`;

const LinkIcon = styled.i<{ isActive: boolean; completed?: boolean }>`
    font-size: 14px;
    margin-left: 10px;
    animation: ${(props) => (props.isActive ? 'pulsing 1s ease-in' : '')};
    animation-iteration-count: ${(props) => (props.isActive ? 'infinite;' : '')};
    opacity: ${(props) => (props.completed || props.isActive ? 1 : 0.7)};
    color: ${(props) => (props.completed ? props.theme.textColor.quinary : props.theme.textColor.primary)};
`;

const CorrectIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.background.primary};
`;

const StyledInsertCard = styled(InsertCard)<{ isActive: boolean; completed?: boolean }>`
    width: 54px;
    height: 44px;
    margin-bottom: 4px;
    opacity: ${(props) => (props.completed || props.isActive ? 1 : 0.7)};
    path {
        fill: ${(props) => (props.completed ? props.theme.textColor.quinary : props.theme.textColor.primary)};
    }
`;

export default Step;
