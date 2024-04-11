import CollateralSelector from 'components/CollateralSelector';
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
    CollateralContainer,
    FormContainer,
    InputContainer,
    InputLabel,
    PrimaryHeading,
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

const Deposit: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useChainId();
    const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
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
        if (selectedTokenFromUrl != selectedToken.toString()) {
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

    const inputRef = useRef<HTMLDivElement>(null);

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
                    {!isMobile && <PrimaryHeading>{t('deposit.deposit-crypto')}</PrimaryHeading>}
                    <InputLabel>{t('deposit.select-token')}</InputLabel>
                    <InputContainer ref={inputRef}>
                        <CollateralContainer ref={inputRef}>
                            <CollateralSelector
                                collateralArray={COLLATERALS[networkId]}
                                selectedItem={selectedToken}
                                onChangeCollateral={(index) => handleChangeCollateral(index)}
                                disabled={false}
                                collateralBalances={[multipleCollateralBalances.data]}
                                exchangeRates={exchangeRates}
                                dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                            />
                        </CollateralContainer>
                    </InputContainer>
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
                            <CopyButton onClick={() => handleCopy()}>{'Copy'}</CopyButton>
                        </WalletAddressInputWrapper>
                        <WarningContainer>
                            <WarningIcon className={'icon icon--warning'} />
                            {t('deposit.send', {
                                token: getCollaterals(networkId)[selectedToken],
                                network: getNetworkNameByNetworkId(networkId),
                            })}
                        </WarningContainer>
                    </DepositAddressFormContainer>
                    <BuyWithText>Or buy with</BuyWithText>
                    <OnramperDiv
                        onClick={() => {
                            setShowOnramper(true);
                        }}
                    >
                        <OnramperIcons className={`social-icon icon--visa`} />
                        <OnramperIcons className={`social-icon icon--master`} />
                        <OnramperIcons className={`social-icon icon--applepay`} />
                        <OnramperIcons className={`social-icon icon--googlepay`} />
                    </OnramperDiv>
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
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: capitalize;
    margin: auto;
    margin-top: 55px;
    margin-bottom: 30px;
    color: ${(props) => props.theme.textColor.primary};
`;

const OnramperIcons = styled.i`
    font-size: 100px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 500px) {
        font-size: 75px;
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
    transition: transform 0.3s ease-out;
    :hover {
        transform: scale(1.2);
    }
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
    background-color: ${(props) => props.theme.input.background.primary};
    border: ${(props) => `1px ${props.theme.input.borderColor.secondary} solid`};
`;

const QRIcon = styled.i`
    font-size: 24px;
    position: absolute;
    cursor: pointer;
    right: 5px;
    top: 5px;
    color: ${(props) => props.theme.input.textColor.primary};
`;

const CopyButton = styled(FlexDiv)`
    font-size: 18px;
    border-radius: 5px;
    font-weight: 700;
    padding: 7px 20px;
    height: auto;
    cursor: pointer;
    text-transform: uppercase;
    line-height: 18px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.button.background.primary};
`;

const SectionLabel = styled.span`
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 24px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const TutorialLinksContainer = styled(FlexDiv)`
    flex-direction: column;
    border-radius: 5px;
    margin-bottom: 13px;

    padding: 19px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
`;

const Link = styled.a`
    width: fit-content;
    font-size: 12px;
    font-weight: 700;
    text-decoration: underline;
    text-transform: capitalize;
    padding-bottom: 15px;
    color: ${(props) => props.theme.textColor.primary};
`;
export default Deposit;