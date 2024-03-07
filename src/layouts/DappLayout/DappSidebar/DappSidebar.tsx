import React from 'react';
import { buildHref } from 'utils/routes';
import logoSmallIcon from 'assets/images/logo-small-light.svg';
import logoIcon from 'assets/images/logo-light.svg';
import SPAAnchor from 'components/SPAAnchor';
import { useLocation } from 'react-router-dom';
import { getSupportedNetworksByRoute } from 'utils/network';
import { LINKS } from 'constants/links';
import styled from 'styled-components';
import ROUTES from 'constants/routes';
import { RootState } from 'types/ui';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsMobile } from 'redux/modules/ui';
import DappHeaderItem from '../components/DappHeaderItem';
import { ScreenSizeBreakpoint } from '../../../enums/ui';
import OutsideClickHandler from 'react-outside-click-handler';
import { useAccount, useChainId } from 'wagmi';

const DappSidebar: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { isConnected } = useAccount();
    const networkId = useChainId();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const showProfilePage = isConnected && getSupportedNetworksByRoute(ROUTES.Markets.Profile).includes(networkId);

    return (
        <OutsideClickHandler
            onOutsideClick={(e) => {
                isMobile && e.target instanceof HTMLElement && !e.target.className.includes('icon--nav-menu')
                    ? removeCollapse()
                    : {};
            }}
        >
            <SidebarHtml id="sidebar">
                <ItemsContainer onClick={removeCollapse}>
                    <SPAAnchor className="sidebar-logoSmall" href={buildHref(ROUTES.Markets.Home)}>
                        <LogoIcon width="38" height="42" src={logoSmallIcon} />
                    </SPAAnchor>
                    <SPAAnchor className="sidebar-logoBig" href={buildHref(ROUTES.Markets.Home)}>
                        <LogoIcon height="42" src={logoIcon} />
                    </SPAAnchor>

                    {getSupportedNetworksByRoute(ROUTES.Markets.SpeedMarkets).includes(networkId) && (
                        <DappHeaderItem
                            className={`${
                                [ROUTES.Markets.SpeedMarkets, ROUTES.Markets.SpeedMarketsOverview].includes(
                                    location.pathname
                                )
                                    ? 'selected'
                                    : ''
                            }`}
                            href={buildHref(ROUTES.Markets.SpeedMarkets)}
                            iconName="speed-markets"
                            label={t('common.sidebar.speed-markets')}
                        />
                    )}

                    {showProfilePage && (
                        <DappHeaderItem
                            className={`${location.pathname === ROUTES.Markets.Profile ? 'selected' : ''}`}
                            href={buildHref(ROUTES.Markets.Profile)}
                            iconName="profile"
                            label={t('common.sidebar.profile-label')}
                        />
                    )}

                    <Divider />
                    <DappHeaderItem
                        href={LINKS.Markets.Thales}
                        iconName="overtime-markets"
                        label={t('common.sidebar.sport-markets-label')}
                        onClick={(event: any) => {
                            event.preventDefault();
                            if (isMobile) {
                                window.location.replace(LINKS.Markets.Sport);
                            } else {
                                window.open(LINKS.Markets.Sport);
                            }
                        }}
                        simpleOnClick={true}
                    />
                </ItemsContainer>
            </SidebarHtml>
        </OutsideClickHandler>
    );
};

const removeCollapse = () => {
    const root = document.getElementById('root');
    const content = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    if (root?.classList.contains('collapse')) {
        sidebar?.classList.remove('collapse');
        content?.classList.remove('collapse');
        root?.classList.remove('collapse');
    }
};

const ItemsContainer = styled.div`
    transition: all 0.5s ease;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    margin-right: -10px;
    height: 100%;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-right: 0;
        gap: 20px;
        justify-content: center;
    }
`;

const SidebarHtml = styled.nav`
    transition: all 0.5s ease;
    transition: width 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    width: 72px;
    height: 100vh;
    z-index: 101;
    background: ${(props) => props.theme.background.secondary};
    padding: 35px 0;
    overflow: hidden;

    .sidebar-logoBig {
        display: none;
    }

    @media (min-width: ${ScreenSizeBreakpoint.SMALL}px) {
        &:hover {
            width: 300px;
            span {
                display: block;
            }
            i {
                display: block;
            }
            .sidebar-logoSmall {
                display: none;
            }
            .sidebar-logoBig {
                display: block;
            }
        }
    }

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 0;
        transition: width 0.3s ease-out;
        .sidebar-logoSmall {
            display: none;
        }
    }

    &.collapse {
        display: block;
        width: 275px;
        transition: width 0.5s ease-in;
        height: 100vh;
        left: 0;
        bottom: 0;
        padding-left: 20px;
        span {
            display: block;
        }
        li {
            max-width: 250px;
        }
    }

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const LogoIcon = styled.img`
    display: block;
    object-fit: contain;
    cursor: pointer;
    margin: auto;
    margin-top: 10px;
    margin-bottom: 25px;
`;

const Divider = styled.hr`
    width: 100%;
    border: none;
    border-top: 3px solid ${(props) => props.theme.borderColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

export default DappSidebar;
