import OutsideClickHandler from 'components/OutsideClick';
import { DEFAULT_NETWORK } from 'constants/network';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { SupportedNetwork } from 'types/network';
import { isMobile } from 'utils/device';
import { SUPPORTED_NETWORK_IDS_MAP } from 'utils/network';
import { useChainId, useConfig, useSwitchChain } from 'wagmi';

const NetworkSwitch: React.FC = () => {
    const config = useConfig();
    const networkId = useChainId();
    const { switchChain } = useSwitchChain();

    const selectedNetwork = useMemo(
        () => SUPPORTED_NETWORK_IDS_MAP[networkId] || SUPPORTED_NETWORK_IDS_MAP[DEFAULT_NETWORK.networkId],
        [networkId]
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <NetworkInfoContainer>
            <OutsideClickHandler onOutsideClick={() => isDropdownOpen && setIsDropdownOpen(false)}>
                <SelectedNetworkContainer cursor={'pointer'}>
                    <NetworkItem $selectedItem={true} onClick={() => setIsDropdownOpen(!isDropdownOpen)} $noHover>
                        {React.createElement(selectedNetwork.icon, {
                            style: { marginRight: 5 },
                        })}
                        <NetworkName>{selectedNetwork.name}</NetworkName>
                        {<Icon className={isDropdownOpen ? `icon icon--caret-up` : `icon icon--caret-down`} />}
                    </NetworkItem>
                    {isDropdownOpen && (
                        <NetworkDropDown>
                            {Object.keys(SUPPORTED_NETWORK_IDS_MAP)
                                .map((key) => {
                                    return {
                                        id: Number(key) as SupportedNetwork,
                                        ...SUPPORTED_NETWORK_IDS_MAP[Number(key)],
                                    };
                                })
                                .sort((a, b) => a.order - b.order)
                                .map((network, index) => (
                                    <NetworkItem
                                        key={index}
                                        onClick={async () => {
                                            setIsDropdownOpen(!isDropdownOpen);

                                            await SUPPORTED_NETWORK_IDS_MAP[network.id].changeNetwork(
                                                network.id,
                                                () => {
                                                    switchChain?.({ chainId: network.id });
                                                }
                                            );
                                            if (isMobile() && config.state.chainId !== network.id) {
                                                config.setState((state) => ({
                                                    ...state,
                                                    chainId: network.id,
                                                }));
                                            }
                                        }}
                                    >
                                        {React.createElement(SUPPORTED_NETWORK_IDS_MAP[network.id].icon, {
                                            height: '18px',
                                            width: '18px',
                                            style: { marginRight: 5 },
                                        })}
                                        {SUPPORTED_NETWORK_IDS_MAP[network.id].name}
                                    </NetworkItem>
                                ))}
                        </NetworkDropDown>
                    )}
                </SelectedNetworkContainer>
            </OutsideClickHandler>
        </NetworkInfoContainer>
    );
};

const NetworkInfoContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const NetworkDropDown = styled.div`
    z-index: 9999;
    position: absolute;
    top: 30px;
    right: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background: ${(props) => props.theme.background.secondary};
    width: 136px;
    max-width: 136px;
    padding: 5px;
    justify-content: center;
    align-items: center;
    gap: 5px;
    @media (max-width: 500px) {
        width: 110px;
    }
`;

const SelectedNetworkContainer = styled.div<{ cursor: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 136px;
    width: 136px;
    color: ${(props) => props.theme.textColor.primary};
    cursor: ${(props) => props.cursor};
    flex-direction: column;
    z-index: 1;
    @media (max-width: 500px) {
        width: 110px;
    }
`;

const NetworkItem = styled.div<{ $selectedItem?: boolean; $noHover?: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    padding: ${(props) => (props.$selectedItem ? '4px 13px' : '6px')};
    font-size: 13px;
    border-radius: 8px;
    &:hover {
        background: ${(props) => (props.$noHover ? '' : props.theme.background.primary)};
    }
    svg {
        width: 16px;
        height: 16px;
    }
    @media (max-width: 500px) {
        ${(props) => (props.$selectedItem ? 'padding: 4px 7px' : '')}
    }
`;

const NetworkName = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
`;

const Icon = styled.i`
    margin-left: auto;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.primary};
`;

export default NetworkSwitch;
