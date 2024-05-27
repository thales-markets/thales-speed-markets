import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import MyPositionAction from 'pages/Profile/components/MyPositionAction';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivStart } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { refetchUserSpeedMarkets } from 'utils/queryConnector';
import { useAccount, useChainId } from 'wagmi';

const CardPosition: React.FC<{ position: UserOpenPositions; currentPrices?: { [key: string]: number } }> = ({
    position,
    currentPrices,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const { address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [isSpeedMarketMatured, setIsSpeedMarketMatured] = useState(Date.now() > position.maturityDate);

    useInterval(() => {
        if (Date.now() > position.maturityDate) {
            if (!isSpeedMarketMatured) {
                setIsSpeedMarketMatured(true);
            }
            if (!position.finalPrice) {
                refetchUserSpeedMarkets(
                    false,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
            }
        }
    }, secondsToMilliseconds(10));

    return (
        <Container>
            <Info>
                <InfoColumn>
                    <FlexDivStart>
                        <Label>{t('common.market')}:</Label>
                        <Value>
                            {position.currencyKey} {formatCurrencyWithSign(USD_SIGN, position.strikePrice)}{' '}
                            {position.side}
                        </Value>
                    </FlexDivStart>
                    <FlexDivStart>
                        <Label>
                            {isSpeedMarketMatured
                                ? t('speed-markets.user-positions.price')
                                : t('speed-markets.user-positions.current-price')}
                            :
                        </Label>
                        <Value>
                            {isSpeedMarketMatured ? (
                                position.finalPrice ? (
                                    formatCurrencyWithSign(USD_SIGN, position.finalPrice)
                                ) : (
                                    <>
                                        {'. . .'}
                                        <Tooltip overlay={t('speed-markets.tooltips.final-price-missing')} />
                                    </>
                                )
                            ) : (
                                formatCurrencyWithSign(
                                    USD_SIGN,
                                    currentPrices ? currentPrices[position.currencyKey] : 0
                                )
                            )}
                        </Value>
                    </FlexDivStart>
                    <FlexDivStart>
                        <Label>{t('speed-markets.user-positions.end-time')}:</Label>
                        <Value>{formatShortDateWithFullTime(position.maturityDate)}</Value>
                    </FlexDivStart>
                </InfoColumn>
                <InfoColumn>
                    <FlexDivStart>
                        <Label>{t('speed-markets.user-positions.paid')}:</Label>
                        <Value></Value>
                    </FlexDivStart>
                    <FlexDivStart>
                        <Label>{t('speed-markets.user-positions.payout')}:</Label>
                        <Value></Value>
                    </FlexDivStart>
                    <FlexDivStart>
                        <Label>{t('speed-markets.user-positions.claim-in')}:</Label>
                        <Value></Value>
                    </FlexDivStart>
                </InfoColumn>
            </Info>
            <Action>
                <MyPositionAction position={position} />
            </Action>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 100%;
    min-height: 123px;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 8px;
    padding: 15px 10px;
`;

const Info = styled(FlexDivRow)`
    height: 100%;
`;

const InfoColumn = styled(FlexDivColumn)`
    gap: 6px;

    &:first-child {
        min-width: 206px;
    }
`;

const Action = styled(FlexDivRow)``;

const Text = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 800;
    line-height: 13px;
`;

const Label = styled(Text)`
    color: ${(props) => props.theme.textColor.quinary};
    font-weight: 500;
`;

const Value = styled(Text)`
    margin-left: 5px;
`;

export default CardPosition;
