import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivStart } from 'styles/common';
import Step from './components/Step';
import { useTranslation } from 'react-i18next';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import { getCollaterals } from 'utils/currency';
import { useAccount, useChainId, useClient } from 'wagmi';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { GetStartedStep } from 'enums/wizard';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

const defaultStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        padding: '2px',
        background: 'linear-gradient(90deg, #a764b7 0%, #169cd2 100%)',
        width: '720px',
        borderRadius: '15px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'none',
        height: 'auto',
        border: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 200,
    },
};

type GetStartedProps = {
    isOpen: boolean;
    onClose: () => void;
};

const GetStarted: React.FC<GetStartedProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
    const client = useClient();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const steps: GetStartedStep[] = [GetStartedStep.LOG_IN, GetStartedStep.DEPOSIT, GetStartedStep.TRADE];
    const [currentStep, setCurrentStep] = useState<GetStartedStep>(
        isWalletConnected ? GetStartedStep.DEPOSIT : GetStartedStep.LOG_IN
    );

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        { networkId, client },
        {
            enabled: isAppReady && isWalletConnected,
            refetchInterval: 5000,
        }
    );
    const exchangeRatesQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total ? total : 0;
        } catch (e) {
            return 0;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    useEffect(() => {
        if (totalBalanceValue > 0) {
            setCurrentStep(GetStartedStep.TRADE);
            return;
        }
        if (isWalletConnected) {
            setCurrentStep(GetStartedStep.DEPOSIT);
        } else {
            setCurrentStep(GetStartedStep.LOG_IN);
        }
    }, [isWalletConnected, totalBalanceValue]);

    return (
        <ReactModal isOpen={isOpen} shouldCloseOnOverlayClick={false} style={defaultStyle}>
            <Container>
                <CloseIconContainer>
                    <CloseIcon onClick={onClose} />
                </CloseIconContainer>
                <Title>{t('get-started.title')}</Title>
                <ProgressDisplayWrapper>
                    {steps.map((step, index) => {
                        return <ProgressBar key={`progress-${index}`} selected={step <= currentStep} />;
                    })}
                </ProgressDisplayWrapper>
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    return (
                        <React.Fragment key={index}>
                            <Step
                                stepNumber={stepNumber}
                                stepType={step}
                                currentStep={currentStep}
                                setCurrentStep={setCurrentStep}
                                hasFunds={totalBalanceValue > 0}
                                onClose={onClose}
                            />
                        </React.Fragment>
                    );
                })}
            </Container>
        </ReactModal>
    );
};

const Container = styled(FlexDivColumn)`
    max-width: 900px;
    width: 100%;
    background-color: ${(props) => props.theme.background.primary};
    border-radius: 15px;
    padding: 20px 60px;
    position: relative;
`;

const Title = styled(FlexDivStart)`
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    color: ${(props) => props.theme.textColor.primary};
    margin: auto;
`;

const ProgressDisplayWrapper = styled(FlexDiv)`
    margin-top: 30px;
    height: 20px;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
`;

const ProgressBar = styled(FlexDiv)<{ selected?: boolean }>`
    height: 6px;
    width: 32%;
    border-radius: 10px;
    background: ${(props) => (props.selected ? props.theme.textColor.quinary : props.theme.textColor.primary)};
`;

const CloseIconContainer = styled(FlexDiv)`
    position: absolute;
    top: 20px;
    right: 20px;
`;

const CloseIcon = styled.i`
    font-size: 16px;
    margin-top: 1px;
    cursor: pointer;

    &:before {
        font-family: Icons !important;
        content: '\\0042';
        color: ${(props) => props.theme.textColor.quinary};
    }
    @media (max-width: 575px) {
        padding: 15px;
    }
`;

export default GetStarted;
