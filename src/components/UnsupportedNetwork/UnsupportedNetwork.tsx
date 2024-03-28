import ArbitrumLogo from 'assets/images/arbitrum-circle-logo.svg?react';
import BaseLogo from 'assets/images/base-circle-logo.svg?react';
import BlastSepoliaLogo from 'assets/images/blast-sepolia-circle-logo.svg?react';
import OpLogo from 'assets/images/optimism-circle-logo.svg?react';
import PolygonLogo from 'assets/images/polygon-circle-logo.svg?react';
import ZkSyncLogo from 'assets/images/zksync-circle-logo.svg?react';
import Button from 'components/Button';
import { TEST_NETWORKS } from 'constants/network';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { RootState } from 'types/ui';
import { SUPPORTED_NETWORK_IDS_MAP } from 'utils/network';
import { useSwitchChain } from 'wagmi';

type UnsupportedNetworkProps = {
    supportedNetworks: NetworkId[];
};

const UnsupportedNetwork: React.FC<UnsupportedNetworkProps> = ({ supportedNetworks }) => {
    const { t } = useTranslation();
    const { switchChain } = useSwitchChain();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const supportedMainnetNetworks = supportedNetworks?.filter(
        (supportedNetwork) => !TEST_NETWORKS.includes(supportedNetwork)
    );

    const getButton = (networkId: NetworkId) => {
        let logo;
        let text;
        switch (networkId) {
            case NetworkId.OptimismMainnet:
                logo = <OpLogo />;
                text = t(`common.unsupported-network.button.optimism`);
                break;
            case NetworkId.PolygonMainnet:
                logo = <PolygonLogo />;
                text = t(`common.unsupported-network.button.polygon`);
                break;
            case NetworkId.Arbitrum:
                logo = <ArbitrumLogo />;
                text = t(`common.unsupported-network.button.arbitrum`);
                break;
            case NetworkId.Base:
                logo = <StyledBaseLogo />;
                text = t(`common.unsupported-network.button.base`);
                break;
            case NetworkId.ZkSync:
                logo = <ZkSyncLogo />;
                text = t(`common.unsupported-network.button.zkSync`);
                break;
            case NetworkId.BlastSepolia:
                logo = (
                    <BlastLogoWrapper>
                        <BlastSepoliaLogo />
                    </BlastLogoWrapper>
                );
                text = t(`common.unsupported-network.button.blast-sepolia`);
                break;
        }

        return (
            <Button
                width="250px"
                padding="0 18px"
                additionalStyles={{ textTransform: 'none' }}
                onClick={() =>
                    SUPPORTED_NETWORK_IDS_MAP[networkId].changeNetwork(
                        networkId,
                        () => switchChain?.({ chainId: networkId as SupportedNetwork }),
                        isMobile
                    )
                }
            >
                {logo}
                <ButtonText>{text}</ButtonText>
            </Button>
        );
    };

    return (
        <Container>
            <Wrapper>
                <Title>{t(`common.unsupported-network.title`)}</Title>
                <ExplanationText>{t(`common.unsupported-network.description`)}</ExplanationText>
                {supportedMainnetNetworks.map((supportedNetwork, index) => {
                    const isSecondInRow = (index + 1) % 2 === 0;
                    const prevNetwork = supportedMainnetNetworks[index - 1];
                    if (index < supportedMainnetNetworks.length - 1) {
                        // has next
                        if (isSecondInRow) {
                            return (
                                <ButtonWrapper key={index}>
                                    {getButton(prevNetwork)}
                                    {getButton(supportedNetwork)}
                                </ButtonWrapper>
                            );
                        }
                    } else {
                        // it is last
                        if (isSecondInRow) {
                            return (
                                <ButtonWrapper key={index}>
                                    {getButton(prevNetwork)}
                                    {getButton(supportedNetwork)}
                                </ButtonWrapper>
                            );
                        } else {
                            return <ButtonWrapper key={index}>{getButton(supportedNetwork)}</ButtonWrapper>;
                        }
                    }
                })}
            </Wrapper>
        </Container>
    );
};

const Container = styled.div`
    margin: 90px 0;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin: 0;
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    background: ${(props) => props.theme.background.primary};
    border: 1px solid ${(props) => props.theme.borderColor.secondary};
    border-radius: 8px;
    padding: 20px;
    max-width: 600px;
    text-align: center;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 5px;
        max-width: calc(100% - 10px);
    }
`;

const Title = styled.p`
    font-weight: 700;
    font-size: 22px;
    line-height: 25px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    margin: 20px 0;
`;

const ExplanationText = styled.p`
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    margin-bottom: 5px;
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin: 20px 0px;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        margin: 10px 0px;
        gap: 20px;
    }
`;

const ButtonText = styled.span`
    padding-left: 5px;
`;

const StyledBaseLogo = styled(BaseLogo)`
    width: 18px;
    height: 18px;
`;

const BlastLogoWrapper = styled.div`
    width: 18px;
    height: 18px;
    background: radial-gradient(${(props) => props.theme.background.primary} 60%, transparent 40%);
    border-radius: 50%;
`;

export default UnsupportedNetwork;
