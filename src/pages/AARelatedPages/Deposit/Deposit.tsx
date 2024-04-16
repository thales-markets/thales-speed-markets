import { getErrorToastOptions, getInfoToastOptions } from 'components/ToastMessage/ToastMessage';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { getOnRamperUrl } from 'utils/biconomy';
import { getNetworkNameByNetworkId } from 'utils/network';
import {
    BalanceSection,
    FormContainer,
    InputContainer,
    InputLabel,
    Link,
    PrimaryHeading,
    SectionLabel,
    TutorialLinksContainer,
    WarningContainer,
    WarningIcon,
    Wrapper,
} from '../styled-components';
import AllSetModal from './components/AllSetModal';
import BalanceDetails from './components/BalanceDetails';
import QRCodeModal from './components/QRCodeModal';
import { getIsMobile } from 'redux/modules/ui';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import queryString from 'query-string';
import Modal from 'components/Modal';
import { RootState } from 'types/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import { useAccount, useChainId, useClient } from 'wagmi';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/currency';
import { COLLATERALS } from 'constants/currency';
import CollateralDropdown from './components/CollateralDropdown';
import { GradientContainer } from 'components/Common/GradientBorder';
import Button from 'components/Button';

const Deposit: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const walletAddress = biconomyConnector.address;
    const { isConnected: isWalletConnected } = useAccount();
    const client = useClient();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [totalValue, setTotalValue] = useState<number | undefined>(undefined);
    const [showSuccessfulDepositModal, setShowSuccessfulDepositModal] = useState<boolean>(false);
    const [showOnramper, setShowOnramper] = useState<boolean>(false);

    const selectedTokenFromUrl = queryString.parse(location.search)['coin-index'];
    const [selectedToken, setSelectedToken] = useState<number>(selectedTokenFromUrl || 0);

    useEffect(() => {
        if (selectedTokenFromUrl && selectedTokenFromUrl != selectedToken.toString()) {
            setSelectedToken(Number(selectedTokenFromUrl));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTokenFromUrl]);

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

            return total;
        } catch (e) {
            return undefined;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    useEffect(() => {
        if (totalBalanceValue == 0) {
            setTotalValue(0);
            return;
        }
        if (totalValue == 0 && totalBalanceValue && totalBalanceValue > 0) {
            setTotalValue(totalBalanceValue);
            setShowSuccessfulDepositModal(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalBalanceValue]);

    const walletAddressInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        const id = toast.loading(t('deposit.copying-address'));
        try {
            walletAddressInputRef.current?.value && navigator.clipboard.writeText(walletAddressInputRef.current?.value);
            toast.update(id, getInfoToastOptions(t('deposit.copied'), ''));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error', ''));
        }
    };

    const handleChangeCollateral = (index: number) => {
        setSelectedToken(index);
    };

    const apiKey = process.env.REACT_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(
            apiKey,
            (isBiconomy ? biconomyConnector.address : walletAddress) as string,
            networkId,
            selectedToken
        );
    }, [walletAddress, networkId, apiKey, selectedToken, isBiconomy]);

    return (
        <>
            {isMobile && <PrimaryHeading>{t('deposit.deposit-crypto')}</PrimaryHeading>}
            <Wrapper>
                <FormContainer>
                    <div>
                        {!isMobile && <PrimaryHeading>{t('deposit.deposit-crypto')}</PrimaryHeading>}
                        <InputLabel>{t('deposit.select-token')}</InputLabel>

                        <CollateralDropdown
                            onChangeCollateral={handleChangeCollateral}
                            collateralArray={COLLATERALS[networkId]}
                            selectedItem={selectedToken}
                        />

                        <DepositAddressFormContainer>
                            <InputLabel>
                                {t('deposit.address-input-label', {
                                    token: getCollaterals(networkId)[selectedToken],
                                    network: getNetworkNameByNetworkId(networkId),
                                })}
                            </InputLabel>
                            <WalletAddressInputWrapper>
                                <InputContainer>
                                    <WalletAddressInput
                                        type={'text'}
                                        value={walletAddress}
                                        readOnly
                                        ref={walletAddressInputRef}
                                    />
                                    <QRIcon
                                        onClick={() => {
                                            setShowQRModal(!showQRModal);
                                        }}
                                        className="social-icon icon--qr-code"
                                    />
                                </InputContainer>
                                <GradientContainer width={68}>
                                    <CopyButton onClick={() => handleCopy()}>{'Copy'}</CopyButton>
                                </GradientContainer>
                            </WalletAddressInputWrapper>
                            <WarningContainer>
                                <WarningIcon className={'icon icon--warning'} />
                                {t('deposit.send', {
                                    token: getCollaterals(networkId)[selectedToken],
                                    network: getNetworkNameByNetworkId(networkId),
                                })}
                            </WarningContainer>
                        </DepositAddressFormContainer>
                    </div>
                    <div>
                        <BuyWithText>{t('deposit.buy-with')}</BuyWithText>
                    </div>
                    <div>
                        <Description>{t('deposit.description')}</Description>
                        <OnramperDiv
                            onClick={() => {
                                setShowOnramper(true);
                            }}
                        >
                            <OnramperDiv>
                                <OnramperIcons className={`social-icon icon--visa`} />
                                <OnramperIcons className={`social-icon icon--master`} />
                                <OnramperIcons className={`social-icon icon--applepay`} />
                                <OnramperIcons className={`social-icon icon--googlepay`} />
                            </OnramperDiv>
                            <Button width="100%" fontSize="14px">
                                Buy Crypto
                            </Button>
                        </OnramperDiv>
                    </div>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                    <TutorialLinksContainer>
                        <SectionLabel>{'Tutorials'}</SectionLabel>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                    </TutorialLinksContainer>
                </BalanceSection>
            </Wrapper>
            {showQRModal && (
                <QRCodeModal
                    onClose={() => setShowQRModal(false)}
                    walletAddress={(isBiconomy ? biconomyConnector.address : walletAddress) as string}
                    title={t('deposit.qr-modal-title', {
                        token: getCollaterals(networkId)[selectedToken],
                        network: getNetworkNameByNetworkId(networkId),
                    })}
                />
            )}
            {showSuccessfulDepositModal && <AllSetModal onClose={() => setShowSuccessfulDepositModal(false)} />}
            {showOnramper && (
                <Modal title={''} onClose={() => setShowOnramper(false)}>
                    <ModalWrapper>
                        <iframe
                            src={onramperUrl}
                            title="Onramper Widget"
                            height="630px"
                            width="420px"
                            allow="accelerometer; autoplay; camera; gyroscope; payment"
                        />
                    </ModalWrapper>
                </Modal>
            )}
        </>
    );
};

const DepositAddressFormContainer = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
    margin-top: 20px;
`;

const BuyWithText = styled.span`
    display: block;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: capitalize;
    margin: auto;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
`;

const OnramperIcons = styled.i`
    font-size: 70px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 500px) {
        font-size: 45px;
    }
`;

const WalletAddressInputWrapper = styled(FlexDiv)`
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

const OnramperDiv = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
`;

const ModalWrapper = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 440px;
`;

const WalletAddressInput = styled.input`
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    padding: 5px;
    opacity: 0.75;
    border-radius: 5px;
    color: ${(props) => props.theme.input.textColor.primary};
    background-color: ${(props) => props.theme.background.primary};
    border: 1px solid ${(props) => props.theme.background.secondary};
`;

const QRIcon = styled.i`
    font-size: 20px;
    position: absolute;
    cursor: pointer;
    right: 5px;
    top: 7px;
    color: ${(props) => props.theme.input.textColor.primary};
`;

const CopyButton = styled(FlexDiv)`
    font-size: 14px;
    font-weight: 800;
    line-height: 100%;
    text-transform: uppercase;
    border-radius: 5px;
    padding: 7px 20px;
    height: auto;
    cursor: pointer;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.button.background.primary};
    font-family: ${(props) => props.theme.fontFamily.tertiary};
`;

const Description = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
`;
export default Deposit;
