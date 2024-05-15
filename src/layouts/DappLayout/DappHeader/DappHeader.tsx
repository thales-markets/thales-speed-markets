import Button from 'components/Button';
import ConnectWalletModal from 'components/ConnectWalletModal';
import NetworkSwitch from 'components/NetworkSwitch';
import { ScreenSizeBreakpoint } from 'enums/ui';
import Deposit from 'pages/AARelatedPages/Deposit';
import GetStarted from 'pages/AARelatedPages/GetStarted';
import Withdraw from 'pages/AARelatedPages/Withdraw';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import { getWalletConnectModalVisibility, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered, PAGE_MAX_WIDTH } from 'styles/common';
import { RootState } from 'types/ui';
import { useAccount } from 'wagmi';
import Logo from '../components/Logo';
import Notifications from '../components/Notifications';
import ReferralModal from '../components/ReferralModal';
import UserInfo from '../components/UserInfo';
import UserWallet from '../components/UserWallet';

const DappHeader: React.FC = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));
    const { isConnected } = useAccount();

    const [openReferralModal, setOpenReferralModal] = useState(false);
    const [openGetStarted, setOpenGetStarted] = useState(false);
    const [openDeposit, setOpenDeposit] = useState(false);
    const [openUserInfo, setOpenUserInfo] = useState(false);
    const [openWithdraw, setOpenWithdraw] = useState(false);

    return (
        <Container>
            <LeftContainer>
                <FlexDivRow>
                    {isMobile && <Icon className="sidebar-icon icon--nav-menu" onClick={sidebarMenuClickHandler} />}
                    <Logo />
                    <Button
                        width="140px"
                        height="30px"
                        margin="10px 0"
                        fontSize="12px"
                        onClick={() => setOpenGetStarted(true)}
                    >
                        {t('common.header.get-started')}
                    </Button>
                </FlexDivRow>
                {isMobile && <Notifications />}
            </LeftContainer>
            <RightContainer>
                {!isConnected && (
                    <Button
                        width="140px"
                        height="30px"
                        fontSize="12px"
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

                <NetworkSwitch />
                {isConnected && (
                    <>
                        <UserWallet />
                        <HeaderIcons
                            onClick={() => setOpenUserInfo(!openUserInfo)}
                            className={`network-icon network-icon--burger`}
                        />
                    </>
                )}

                {!isMobile && <Notifications />}
                {openUserInfo && <UserInfo setUserInfoOpen={setOpenUserInfo} setOpenWithdraw={setOpenWithdraw} />}
            </RightContainer>
            {openReferralModal && <ReferralModal onClose={() => setOpenReferralModal(false)} />}
            {openGetStarted && <GetStarted isOpen={openGetStarted} onClose={() => setOpenGetStarted(false)} />}
            {openDeposit && <Deposit isOpen={openDeposit} onClose={() => setOpenDeposit(false)} />}
            {openWithdraw && <Withdraw isOpen={openWithdraw} onClose={() => setOpenWithdraw(false)} />}

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

const sidebarMenuClickHandler = () => {
    const root = document.getElementById('root');
    const content = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    if (root?.classList.contains('collapse')) {
        sidebar?.classList.remove('collapse');
        content?.classList.remove('collapse');
        root?.classList.remove('collapse');
    } else {
        root?.classList.add('collapse');
        content?.classList.add('collapse');
        sidebar?.classList.add('collapse');
    }
};

const Container = styled(FlexDivRowCentered)`
    width: 100%;
    max-width: ${PAGE_MAX_WIDTH};
    margin-left: auto;
    margin-right: auto;
    max-height: 40px;
    margin-bottom: 6px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
    }
`;

const LeftContainer = styled(FlexDivRowCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-bottom: 10px;
        width: 100%;
    }
`;

const RightContainer = styled(FlexDivRowCentered)`
    position: relative;
    @media (max-width: 500px) {
        width: 100%;
    }
    gap: 10px;
`;

const Icon = styled.i`
    margin-right: 13px;
    font-size: 26px;
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
