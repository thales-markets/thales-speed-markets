import Button from 'components/Button';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from 'types/ui';
import { getIsMobile } from '../../../redux/modules/ui';
import { FlexDivRow, FlexDivRowCentered } from '../../../styles/common';
import Logo from '../components/Logo';
import Notifications from '../components/Notifications';
import ReferralModal from '../components/ReferralModal';
import UserWallet from '../components/UserWallet';
import NetworkSwitch from 'components/NetworkSwitch';
import { useAccount } from 'wagmi';
import { getIsBiconomy } from 'redux/modules/wallet';
import GetStarted from 'pages/AARelatedPages/GetStarted';

const DappHeader: React.FC = () => {
    const { t } = useTranslation();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { isConnected } = useAccount();

    const [openReferralModal, setOpenReferralModal] = useState(false);
    const [openGetStarted, setOpenGetStarted] = useState(false);

    return (
        <Container $maxWidth={getMaxWidth()}>
            <LeftContainer>
                <FlexDivRow>
                    {isMobile && <Icon className="sidebar-icon icon--nav-menu" onClick={sidebarMenuClickHandler} />}
                    <Logo />
                    {isBiconomy && (
                        <Button
                            width="140px"
                            height="30px"
                            margin="10px 0"
                            fontSize="12px"
                            onClick={() => setOpenGetStarted(true)}
                        >
                            {t('common.header.get-started')}
                        </Button>
                    )}
                </FlexDivRow>
                {isMobile && <Notifications />}
            </LeftContainer>
            <RightContainer>
                <Button width="140px" height="30px" fontSize="12px" onClick={() => setOpenReferralModal(true)}>
                    {t('common.header.refer-earn')}
                </Button>
                <UserWallet />
                <NetworkSwitch />
                {isConnected && (
                    <>
                        <HeaderIcons className={`network-icon network-icon--settings`} />
                        <HeaderIcons className={`network-icon network-icon--home`} />
                    </>
                )}

                {!isMobile && <Notifications />}
            </RightContainer>
            {openReferralModal && <ReferralModal onClose={() => setOpenReferralModal(false)} />}
            {openGetStarted && <GetStarted isOpen={openGetStarted} onClose={() => setOpenGetStarted(false)} />}
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

const getMaxWidth = () => {
    if (location.pathname === ROUTES.Markets.Profile) {
        return '974px';
    }
    if ([ROUTES.Markets.SpeedMarkets, ROUTES.Home].includes(location.pathname)) {
        return '1080px';
    }
    return '1440px';
};

const Container = styled(FlexDivRowCentered)<{ $maxWidth: string }>`
    width: 100%;
    max-width: ${(props) => props.$maxWidth};
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
`;

export default DappHeader;
