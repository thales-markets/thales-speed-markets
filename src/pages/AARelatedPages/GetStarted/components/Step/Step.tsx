import Button from 'components/Button';
import Modal from 'components/Modal';
import OutsideClick from 'components/OutsideClick';
import {
    getErrorToastOptions,
    getInfoToastOptions,
    getLoadingToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { GetStartedStep } from 'enums/wizard';
import QRCodeModal from 'pages/AARelatedPages/Withdraw/components/QRCodeModal';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, GradientContainer } from 'styles/common';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getOnRamperUrl } from 'utils/particleWallet/utils';
import { buildHref, navigateTo } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';

ReactModal.setAppElement('#root');

type StepProps = {
    stepNumber: number;
    stepType: GetStartedStep;
    currentStep: GetStartedStep;
    setCurrentStep: (step: GetStartedStep) => void;
    hasFunds: boolean;
    onClose: () => void;
};

const Step: React.FC<StepProps> = ({ stepNumber, stepType, currentStep, setCurrentStep, hasFunds, onClose }) => {
    const networkId = useChainId();
    const dispatch = useDispatch();
    const { isConnected: isWalletConnected, address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { t } = useTranslation();
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [showOnramper, setShowOnramper] = useState<boolean>(false);

    const walletAddress = isBiconomy ? biconomyConnector.address : (address as string);

    const isActive = currentStep === stepType;
    const isDisabled = !isWalletConnected && stepType !== GetStartedStep.LOG_IN;

    const stepTitle = useMemo(() => {
        let transKey = 'get-started.steps.title';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                transKey += isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                transKey += '.trade';
                break;
        }
        return t(transKey);
    }, [isWalletConnected, stepType, t]);

    const stepDescription = useMemo(() => {
        let transKey = 'get-started.steps.description';
        switch (stepType) {
            case GetStartedStep.LOG_IN:
                transKey += isWalletConnected ? '.logged-in' : '.sign-up';
                break;
            case GetStartedStep.DEPOSIT:
                transKey += '.deposit';
                break;
            case GetStartedStep.TRADE:
                transKey += '.trade';
                break;
        }

        return (
            <Trans
                i18nKey={transKey}
                values={{
                    network: getNetworkNameByNetworkId(networkId, true),
                }}
                components={{ a: <Link target="_blank" href={LINKS.Tutorials.Root} /> }}
            ></Trans>
        );
    }, [stepType, networkId, isWalletConnected]);

    const showStepIcon = useMemo(() => {
        if (isWalletConnected) {
            switch (stepType) {
                case GetStartedStep.LOG_IN:
                    return isWalletConnected;

                case GetStartedStep.DEPOSIT:
                    return currentStep > stepType && hasFunds;

                case GetStartedStep.TRADE:
                    return false;
            }
        }
    }, [isWalletConnected, stepType, hasFunds, currentStep]);

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
                break;
            case GetStartedStep.TRADE:
                navigateTo(buildHref(ROUTES.Markets.Home));
                onClose();
                break;
        }
    };

    const changeCurrentStep = () => (isDisabled ? null : setCurrentStep(stepType));

    const handleCopy = () => {
        const id = toast.loading(t('user-info.copying-address'), getLoadingToastOptions());
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.update(id, getInfoToastOptions(t('user-info.copied'), id));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', id));
        }
    };

    const apiKey = import.meta.env.VITE_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(apiKey, biconomyConnector.address as string, networkId);
    }, [networkId, apiKey]);

    return (
        <>
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
                    {stepType === GetStartedStep.LOG_IN && !isWalletConnected && (
                        <ButtonWrapper>
                            <Button disabled={!isActive} width="210px" fontSize="18px">
                                {t('get-started.steps.action.log-in')}
                            </Button>
                        </ButtonWrapper>
                    )}
                    {stepType === GetStartedStep.DEPOSIT && isWalletConnected && (
                        <DepositContainer isActive={isActive}>
                            <GradientContainer>
                                <AddressContainer>
                                    <Address>{walletAddress}</Address>
                                    <CopyText
                                        onClick={() => {
                                            if (isActive) handleCopy();
                                        }}
                                    >
                                        {t('get-started.steps.action.copy')}
                                    </CopyText>
                                    <QRIcon
                                        onClick={() => {
                                            setShowQRModal(!showQRModal);
                                        }}
                                        className="social-icon icon--qr-code"
                                    />
                                    <CopyIcon
                                        onClick={() => {
                                            if (isActive) handleCopy();
                                        }}
                                        className="network-icon network-icon--copy"
                                    />
                                </AddressContainer>
                            </GradientContainer>
                            <Separator />
                            <OnRampWrapper
                                onClick={() => {
                                    if (isActive) setShowOnramper(true);
                                }}
                            >
                                <OnramperDiv>
                                    <OnramperIcons className={`social-icon icon--visa`} />
                                    <OnramperIcons className={`social-icon icon--master`} />
                                    <OnramperIcons className={`social-icon icon--applepay`} />
                                    <OnramperIcons className={`social-icon icon--googlepay`} />
                                </OnramperDiv>
                                <Button disabled={!isActive} width="100%" fontSize="18px">
                                    {t('get-started.steps.action.buy-crypto')}
                                </Button>
                            </OnRampWrapper>
                        </DepositContainer>
                    )}
                </StepDescriptionSection>
            </Container>

            {showQRModal && (
                <QRCodeModal
                    onClose={() => setShowQRModal(false)}
                    walletAddress={walletAddress}
                    title={t('deposit.qr-modal-title')}
                />
            )}
            {showOnramper && (
                <Modal
                    isOpen={showOnramper}
                    title=""
                    shouldCloseOnOverlayClick
                    onClose={() => setShowOnramper(false)}
                    width="auto"
                >
                    <OutsideClick onOutsideClick={() => setShowOnramper(false)}>
                        <ModalWrapper>
                            <IFrame
                                src={onramperUrl}
                                title="Onramper Widget"
                                allow="accelerometer; autoplay; camera; gyroscope; payment"
                            />
                        </ModalWrapper>
                    </OutsideClick>
                </Modal>
            )}
        </>
    );
};

const Container = styled.div`
    display: flex;
    margin: 10px 0;
    gap: 10px;
    align-items: flex-start;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        gap: 16px;
    }
`;

const StepNumberSection = styled(FlexDivCentered)``;

const StepDescriptionSection = styled(FlexDivColumn)<{ isActive: boolean; isDisabled?: boolean }>`
    color: ${(props) => props.theme.textColor.secondary};
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
    overflow: hidden;
    ${(props) => (!props.isActive ? 'opacity: 0.5;' : '')}
`;

const StepTitle = styled.span<{ completed?: boolean }>`
    font-weight: 700;
    font-size: 20px;
    line-height: 27px;
    color: ${(props) => (props.completed ? props.theme.background.secondary : '')};
    margin-bottom: 4px;
`;

const StepDescription = styled.p<{ completed?: boolean }>`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    text-align: justify;
    color: ${(props) => (props.completed ? props.theme.background.secondary : '')};
`;

const StepNumberWrapper = styled.div<{ isActive: boolean; isDisabled?: boolean; completed?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 2px solid ${(props) => (props.completed ? props.theme.textColor.primary : props.theme.textColor.secondary)};
    ${(props) =>
        props.isActive ? '' : `background: ${props.completed ? props.theme.background.secondary : 'transparent'};`}
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : props.isActive ? 'default' : 'pointer')};
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: 36px;
        height: 36px;
    }
    opacity: ${(props) => (props.completed || props.isActive ? 1 : 0.7)};
`;

const StepNumber = styled.span<{ isActive: boolean }>`
    font-weight: 700;
    font-size: 29px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
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

const AddressContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    border-radius: 6px;
    padding: 12px;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.secondary};
`;

const Address = styled.span`
    font-size: 14px;
    font-weight: 800;
    line-height: normal;
    letter-spacing: -0.28px;
    text-transform: lowercase;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 60px;
`;

const QRIcon = styled.i`
    font-size: 20px;
    position: absolute;
    cursor: pointer;
    right: 90px;
    top: 8px;
    color: ${(props) => props.theme.input.textColor.primary};
`;

const CopyText = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 14px;
    font-weight: 800;
    line-height: 100%; /* 14px */
    text-transform: uppercase;
    cursor: pointer;
`;

const Separator = styled.div`
    height: 1px;
    margin: 20px 6px 4px;
    background: ${(props) => props.theme.button.borderColor.primary};
    position: relative;
    &:after {
        position: absolute;

        content: 'or';
        font-family: ${(props) => props.theme.fontFamily.secondary};
        font-size: 14px;
        font-weight: 800;
        line-height: 12px;
        letter-spacing: -0.5px;
        color: ${(props) => props.theme.textColor.secondary};
        background: ${(props) => props.theme.background.primary};
        top: 50%; /* position the top  edge of the element at the middle of the parent */
        left: 50%; /* position the left edge of the element at the middle of the parent */

        transform: translate(-50%, -50%);
        padding: 0 11px;
    }
`;

const OnramperDiv = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
`;

const OnRampWrapper = styled(OnramperDiv)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
    }
`;

const OnramperIcons = styled.i`
    font-size: 70px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 60px;
    }
`;

const DepositContainer = styled.div<{ isActive: boolean }>`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    opacity: ${(props) => (props.isActive ? 1 : 0.7)};
`;

const CopyIcon = styled.i`
    position: absolute;
    right: 60px;
    top: 6px;
    font-size: 22px;
`;

const ButtonWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 10px;
`;

const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    text-decoration: underline;
`;

const ModalWrapper = styled.div`
    background: ${(props) => props.theme.background.primary};
    margin-bottom: 2px;
`;

const IFrame = styled.iframe`
    height: 630px;
    width: 420px;
`;

export default Step;
