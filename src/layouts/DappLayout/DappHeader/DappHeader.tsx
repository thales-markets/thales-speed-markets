import Button from 'components/Button';
import ConnectWalletModal from 'components/ConnectWalletModal';
import NetworkSwitch from 'components/NetworkSwitch';
import { ScreenSizeBreakpoint } from 'enums/ui';
import GetStarted from 'pages/AARelatedPages/GetStarted';
import Withdraw from 'pages/AARelatedPages/Withdraw';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getWalletConnectModalVisibility, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered, PAGE_MAX_WIDTH } from 'styles/common';
import { RootState } from 'types/ui';
import { useAccount, useChainId, useClient } from 'wagmi';
import Logo from '../components/Logo';
import Notifications from '../components/Notifications';
import ReferralModal from '../components/ReferralModal';
import UserInfo from '../components/UserInfo';
import UserWallet from '../components/UserWallet';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import { getIsAppReady } from 'redux/modules/app';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, isStableCurrency } from 'utils/currency';
import { Coins } from 'thales-utils';
import { navigateTo } from 'utils/routes';
import ROUTES from 'constants/routes';
import PythModal from '../components/PythModal';

const DappHeader: React.FC = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));
    const { isConnected } = useAccount();
    const networkId = useChainId();
    const client = useClient();
    const { address } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = isBiconomy ? biconomyConnector.address : address;

    const [openReferralModal, setOpenReferralModal] = useState(false);
    const [openGetStarted, setOpenGetStarted] = useState(false);
    const [openUserInfo, setOpenUserInfo] = useState(false);
    const [openWithdraw, setOpenWithdraw] = useState(false);
    const [openPythModal, setPythModalOpen] = useState(false);

    const burgerMenuRef = useRef<HTMLElement>(null);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress as any,
        { networkId, client },
        {
            enabled: isAppReady,
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

    const getUSDForCollateral = useCallback(
        (token: Coins) =>
            (multipleCollateralBalances.data ? multipleCollateralBalances.data[token] : 0) *
            (isStableCurrency(token as Coins) ? 1 : exchangeRates?.[token] || 0),
        [multipleCollateralBalances, exchangeRates]
    );

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token: Coins) => {
                    total += getUSDForCollateral(token);
                });
            }

            return total ? total : 0;
        } catch (e) {
            return 0;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, getUSDForCollateral]);

    return (
        <Container>
            <LeftContainer>
                <FlexDivRow>
                    <Logo />
                    {!isMobile && (
                        <Button
                            width="140px"
                            height="30px"
                            margin="auto 0"
                            fontSize="12px"
                            onClick={() =>
                                totalBalanceValue > 0 ? navigateTo(ROUTES.Deposit) : setOpenGetStarted(true)
                            }
                        >
                            {t(totalBalanceValue > 0 ? 'deposit.title' : 'common.header.get-started')}
                        </Button>
                    )}
                </FlexDivRow>
            </LeftContainer>
            <RightContainer>
                {!isConnected && (
                    <Button
                        width="140px"
                        height="30px"
                        fontSize="12px"
                        margin={isMobile ? '10px' : '0px'}
                        fontWeight={800}
                        onClick={() =>
                            dispatch(
                                setWalletConnectModalVisibility({
                                    visibility: true,
                                })
                            )
                        }
                    >
                        <LoginIcon className={`network-icon network-icon--login`} />
                        {t('common.wallet.connect-your-wallet')}
                    </Button>
                )}
                {isMobile && isConnected && (
                    <Button
                        width="140px"
                        height="30px"
                        margin="10px"
                        fontSize="12px"
                        onClick={() => (totalBalanceValue > 0 ? navigateTo(ROUTES.Deposit) : setOpenGetStarted(true))}
                    >
                        {t(totalBalanceValue > 0 ? 'deposit.title' : 'common.header.get-started')}
                    </Button>
                )}

                <NetworkSwitch />

                {isConnected && (
                    <>
                        {!isMobile && <UserWallet />}
                        <Notifications />
                        <HeaderIcons
                            ref={burgerMenuRef}
                            onClick={() => setOpenUserInfo(!openUserInfo)}
                            className={`network-icon network-icon--burger`}
                        />
                    </>
                )}

                {openUserInfo && (
                    <UserInfo
                        setUserInfoOpen={setOpenUserInfo}
                        setOpenWithdraw={setOpenWithdraw}
                        setOpenReferralModal={setOpenReferralModal}
                        setPythModalOpen={setPythModalOpen}
                        skipOutsideClickOnElement={burgerMenuRef}
                    />
                )}
            </RightContainer>
            {openReferralModal && <ReferralModal onClose={() => setOpenReferralModal(false)} />}
            {openGetStarted && <GetStarted onClose={() => setOpenGetStarted(false)} />}
            {openWithdraw && <Withdraw onClose={() => setOpenWithdraw(false)} />}
            {openPythModal && <PythModal onClose={() => setPythModalOpen(false)} />}

            <ConnectWalletModal
                isOpen={connectWalletModalVisibility}
                onClose={() => {
                    dispatch(
                        setWalletConnectModalVisibility({
                            visibility: !connectWalletModalVisibility,
                        })
                    );
                }}
            />
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    margin: 30px auto 16px auto;
    max-height: 40px;
`;

const LeftContainer = styled(FlexDivRowCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
    }
`;

const RightContainer = styled(FlexDivRowCentered)`
    position: relative;
    gap: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        justify-content: flex-end;
        gap: 0;
    }
`;

const HeaderIcons = styled.i`
    font-size: 26px;
    color: ${(props) => props.theme.button.textColor.tertiary};
    margin-left: 10px;
    cursor: pointer;
`;

const LoginIcon = styled.i`
    font-size: 18px;
    position: relative;
    left: -10px;
`;

export default DappHeader;
