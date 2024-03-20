import SimpleLoader from 'components/SimpleLoader/SimpleLoader';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useUserResolvedChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserResolvedChainedSpeedMarketsDataQuery';
import useUserResolvedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserResolvedSpeedMarketsDataQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';
import { UserClosedPositions } from 'types/market';
import { RootState } from 'types/ui';
import ChainedPosition from '../ChainedPosition';
import ClosedPosition from '../ClosedPosition';
import { useAccount, useChainId, useClient } from 'wagmi';

const ClosedPositions: React.FC<{ isChained: boolean }> = ({ isChained }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { isConnected, address } = useAccount();

    const userResolvedSpeedMarketsDataQuery = useUserResolvedSpeedMarketsDataQuery(networkId, address as string, {
        enabled: isAppReady && isConnected && !isChained,
    });

    const lastTenUserResolvedPositions = useMemo(
        () =>
            userResolvedSpeedMarketsDataQuery.isSuccess && userResolvedSpeedMarketsDataQuery.data
                ? userResolvedSpeedMarketsDataQuery.data
                      .sort((a: any, b: any) => a.maturityDate - b.maturityDate)
                      .slice(-10)
                      .sort((a, b) => b.maturityDate - a.maturityDate)
                : [],
        [userResolvedSpeedMarketsDataQuery]
    );

    const userResolvedChainedSpeedMarketsDataQuery = useUserResolvedChainedSpeedMarketsDataQuery(
        { networkId, client },
        address as string,
        {
            enabled: isAppReady && isConnected && !!isChained,
        }
    );

    const lastTenUserResolvedChainedPositions = useMemo(
        () =>
            userResolvedChainedSpeedMarketsDataQuery.isSuccess && userResolvedChainedSpeedMarketsDataQuery.data
                ? userResolvedChainedSpeedMarketsDataQuery.data
                      .sort((a: any, b: any) => a.maturityDate - b.maturityDate)
                      .slice(-10)
                      .sort((a, b) => b.maturityDate - a.maturityDate)
                : [],
        [userResolvedChainedSpeedMarketsDataQuery]
    );

    const noPositions = isChained
        ? lastTenUserResolvedChainedPositions.length === 0
        : lastTenUserResolvedPositions.length === 0;
    const positions = noPositions ? dummyPositions : lastTenUserResolvedPositions;

    return (
        <Wrapper>
            <Header>
                <Title>{t('speed-markets.user-positions.your-closed-positions')}</Title>
            </Header>
            {userResolvedSpeedMarketsDataQuery.isLoading || userResolvedChainedSpeedMarketsDataQuery.isLoading ? (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
            ) : (
                <>
                    <PositionsWrapper noPositions={noPositions} isChained={isChained}>
                        {isChained && !noPositions
                            ? lastTenUserResolvedChainedPositions.map((position, index) => (
                                  <ChainedPosition position={position} key={`closedPosition${index}`} />
                              ))
                            : positions.map((position, index) => (
                                  <ClosedPosition position={position} key={`closedPosition${index}`} />
                              ))}
                    </PositionsWrapper>
                    {noPositions && (
                        <NoPositionsText>{t('speed-markets.user-positions.no-closed-positions')}</NoPositionsText>
                    )}
                </>
            )}
        </Wrapper>
    );
};

const dummyPositions: UserClosedPositions[] = [
    {
        market: '0x1',
        currencyKey: 'BTC',
        payout: 15,
        paid: 100,
        maturityDate: 1684483200000,
        strikePrice: '$ 25,000.00',
        strikePriceNum: 25000,
        side: Positions.UP,
        value: 0,
        finalPrice: 30000,
        isUserWinner: true,
    },
    {
        market: '0x2',
        currencyKey: 'BTC',
        payout: 10,
        paid: 200,
        maturityDate: 1684483200000,
        strikePrice: '$ 35,000.00',
        strikePriceNum: 35000,
        side: Positions.DOWN,
        value: 0,
        finalPrice: 30000,
        isUserWinner: true,
    },
];

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const PositionsWrapper = styled.div<{ noPositions?: boolean; isChained?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${(props) => (props.isChained ? '16' : '6')}px;
    overflow-y: auto;
    max-height: ${(props) => (props.isChained ? '624' : '560')}px;
    ${(props) => (props.noPositions ? 'filter: blur(10px);' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: row;
        overflow: auto;
    }
`;

const Header = styled(FlexDivRowCentered)`
    min-height: 37px;
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 13px;
    line-height: 100%;
    margin-left: 20px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-left: 5px;
    }
`;

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 200px;
    width: 100%;
`;

const NoPositionsText = styled.span`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 15px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.secondary};
    min-width: max-content;
`;

export default ClosedPositions;
