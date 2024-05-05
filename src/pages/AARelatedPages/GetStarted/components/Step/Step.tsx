import ROUTES from 'constants/routes';
import { GetStartedStep } from 'enums/wizard';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { RootState } from 'types/ui';
import { getDefaultCollateral } from 'utils/currency';
import { getNetworkNameByNetworkId } from 'utils/network';
import { buildHref, navigateTo } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';

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

const CorrectIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.background.primary};
`;

export default Step;
