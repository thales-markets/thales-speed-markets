import OutsideClickHandler from 'components/OutsideClick';
import React, { useState } from 'react';
import styled from 'styled-components';
import { NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { isMobile } from 'utils/device';
import { SUPPORTED_NETWORK_IDS_MAP } from 'utils/network';
import { useAccount, useChainId, useConfig, useSwitchChain } from 'wagmi';

const NetworkSwitcher: React.FC = () => {
    const config = useConfig();
    const networkId = useChainId();
    const { isConnected } = useAccount();

    const { switchChain } = useSwitchChain();
    const [dropDownOpen, setDropDownOpen] = useState(false);

    return (
        <OutsideClickHandler onOutsideClick={() => setDropDownOpen(false)}>
            <NetworkIconWrapper onClick={() => setDropDownOpen(!dropDownOpen)} isConnected={isConnected}>
                <AssetIcon
                    className={
                        (SUPPORTED_NETWORK_IDS_MAP[networkId] || SUPPORTED_NETWORK_IDS_MAP[NetworkId.OptimismMainnet])
                            .icon
                    }
                />

                <DownIcon className={`icon icon--arrow-down`} />
                {dropDownOpen && (
                    <NetworkDropDown>
                        {Object.keys(SUPPORTED_NETWORK_IDS_MAP)
                            .map((key) => {
                                const supportedNetorkId = Number(key) as SupportedNetwork;
                                return {
                                    id: supportedNetorkId,
                                    ...SUPPORTED_NETWORK_IDS_MAP[supportedNetorkId],
                                };
                            })
                            .sort((a, b) => a.order - b.order)
                            .map((network, index) => (
                                <NetworkWrapper
                                    key={index}
                                    onClick={async () => {
                                        setDropDownOpen(false);
                                        await SUPPORTED_NETWORK_IDS_MAP[network.id].changeNetwork(network.id, () => {
                                            switchChain?.({ chainId: network.id });
                                        });
                                        if (isMobile() && config.state.chainId !== network.id) {
                                            config.setState((state) => ({
                                                ...state,
                                                chainId: network.id,
                                            }));
                                        }
                                    }}
                                >
                                    {networkId === network.id && <NetworkSelectedIndicator />}
                                    <AssetIcon className={SUPPORTED_NETWORK_IDS_MAP[network.id].icon} />
                                    <NetworkText>{network.name}</NetworkText>
                                </NetworkWrapper>
                            ))}
                    </NetworkDropDown>
                )}
            </NetworkIconWrapper>
        </OutsideClickHandler>
    );
};

const NetworkIconWrapper = styled.div<{ isConnected: boolean }>`
    position: relative;
    height: 30px;
    border-radius: 20px;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    display: flex;
    justify-content: center;
    gap: 4px;
    align-items: center;
    max-width: 65px;
    min-width: 65px;
    background-color: ${(props) => props.theme.background.primary};
    cursor: pointer;
`;

const NetworkText = styled.span`
    position: relative;
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 700;
    font-size: 13px;
    line-height: 13px;
    cursor: pointer;
    color: ${(props) => props.theme.button.textColor.tertiary};
    text-align: left;
`;

const AssetIcon = styled.i`
    font-size: 22px;
    color: ${(props) => props.theme.button.textColor.tertiary};
`;

const DownIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.button.textColor.tertiary};
`;

const NetworkDropDown = styled.div`
    z-index: 1000;
    position: absolute;
    display: flex;
    top: 36px;
    left: -60px;
    flex-direction: column;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    background-color: ${(props) => props.theme.background.primary};
    border-radius: 20px;
    width: 130px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
`;

const NetworkWrapper = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    width: 100%;
    padding-left: 10px;
    &:hover {
        ${AssetIcon}, ${NetworkText} {
            color: ${(props) => props.theme.dropDown.textColor.secondary};
        }
    }
`;

const NetworkSelectedIndicator = styled.div`
    position: absolute;
    left: 7px;
    background: ${(props) => props.theme.button.textColor.tertiary};
    border-radius: 20px;
    width: 6px;
    height: 6px;
`;

export default NetworkSwitcher;
