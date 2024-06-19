import BtcCard from 'assets/images/flexCards/btc-card.png';
import EthCard from 'assets/images/flexCards/eth-card.png';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivRowCentered,
} from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { SharePositionData, SharePositionType } from 'types/flexCards';
import { ThemeInterface } from 'types/ui';
import { getSynthName } from 'utils/currency';
import LogoWithQR from '../LogoWithQR';

const SpeedMarketFlexCard: React.FC<SharePositionData> = ({
    type,
    positions,
    currencyKey,
    strikePrices,
    buyIn,
    payout,
    marketDuration,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const strikePrice = formatCurrencyWithSign(USD_SIGN, strikePrices ? strikePrices[0] : 0);

    const position = positions[0];

    const textColor =
        type === 'speed-potential'
            ? theme.flexCard.textColor.potential
            : type === 'speed-won'
            ? theme.flexCard.textColor.won
            : theme.flexCard.textColor.loss;

    return (
        <ContainerBorder $isWon={type === 'speed-won'}>
            <Container currencyKey={currencyKey} type={type}>
                <FlexDivColumn>
                    <LogoWithQR color={textColor} />
                    {type !== 'speed-loss' && (
                        <StatusContainer>
                            <StatusHeading color={textColor}>
                                {type === 'speed-potential'
                                    ? t('common.flex-card.potential-win')
                                    : t('common.flex-card.won')}
                            </StatusHeading>
                            <Status color={textColor}>{formatCurrencyWithSign(USD_SIGN, payout ?? 0)}</Status>
                        </StatusContainer>
                    )}
                </FlexDivColumn>
                <FlexDivRow>
                    <FlexDivRowCentered>
                        <CurrencyIcon
                            color={textColor}
                            className={`currency-icon currency-icon--${currencyKey.toLowerCase()}`}
                        />
                        <Asset>
                            <AssetName color={textColor}>{getSynthName(currencyKey)}</AssetName>
                            <Position color={textColor}>{`${currencyKey.toUpperCase()} ${position}`}</Position>
                        </Asset>
                    </FlexDivRowCentered>
                    <MarketDetailsContainer>
                        <FlexDivRowCentered>
                            <ItemName color={textColor}>{t('common.flex-card.strike-price')}</ItemName>
                            <Value color={textColor}>{strikePrice}</Value>
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <ItemName color={textColor}>{t('common.flex-card.market-duration')}</ItemName>
                            <Value color={textColor}>{marketDuration}</Value>
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <ItemName color={textColor}>{t('common.flex-card.buy-in')}</ItemName>
                            <Value color={textColor}>{formatCurrencyWithSign(USD_SIGN, buyIn)}</Value>
                        </FlexDivRowCentered>
                    </MarketDetailsContainer>
                </FlexDivRow>
                <Footer color={textColor}>{`${t('speed-markets.single')} ${t('common.markets')}`}</Footer>
                {type === 'speed-loss' && <LossWatermark>{t('common.loss')}</LossWatermark>}
            </Container>
        </ContainerBorder>
    );
};

const Container = styled(FlexDivColumnCentered)<{ currencyKey: string; type: SharePositionType }>`
    ${(props) =>
        props.type === 'speed-won'
            ? ''
            : `border: 10px solid ${
                  props.type === 'speed-potential'
                      ? props.theme.flexCard.background.potential
                      : props.theme.flexCard.background.loss
              };`}
    border-radius: 15px;

    width: ${(props) => (props.type === 'speed-won' ? '363px' : '383px')};
    height: ${(props) => (props.type === 'speed-won' ? '490px' : '510px')};

    padding: 10px;
    background: ${(props) => `url(${props.currencyKey === CRYPTO_CURRENCY_MAP.BTC ? BtcCard : EthCard})`};
    background-position: center;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 357px;
        height: 476px;
        background-size: cover;
    }
`;

export const ContainerBorder = styled.div<{ $isWon: boolean }>`
    ${(props) => (props.$isWon ? `background: ${props.theme.flexCard.background.won};` : '')}
    ${(props) => (props.$isWon ? 'padding: 10px;' : '')}
    ${(props) => (props.$isWon ? 'border-radius: 15px;' : '')}
`;

const MarketDetailsContainer = styled(FlexDivColumn)`
    max-width: 185px;
    gap: 5px;
`;

const ItemName = styled.span<{ color: string }>`
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 14px;
    font-weight: 400;
    text-transform: capitalize;
`;

const Value = styled.span<{ color: string }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 700;
    text-wrap: nowrap;
    font-size: 14px;
    color: ${(props) => props.color};
`;

export const StatusContainer = styled(FlexDiv)`
    width: 100%;
    flex-direction: column;
    margin-top: 10px;
`;

export const StatusHeading = styled.span<{ color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 35px;
    font-weight: 300;
    text-transform: uppercase;
    text-align: center;
    ::before {
        width: 13px;
        height: 13px;
        margin: 0px 5px;
        transform: rotate(45deg);
        content: '';
        display: inline-block;
        background-color: ${(props) => props.color};
    }
    ::after {
        width: 13px;
        margin: 0px 5px;
        height: 13px;
        transform: rotate(45deg);
        content: '';
        display: inline-block;
        background-color: ${(props) => props.color};
    }
`;

export const Status = styled.span<{ color: string }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 45px;
    font-weight: 800;
    text-align: center;
    color: ${(props) => props.color};
`;

const CurrencyIcon = styled.i<{ color: string }>`
    font-size: 40px;
    margin-right: 5px;
    color: ${(props) => props.color};
`;

const Asset = styled(FlexDivColumn)`
    gap: 5px;
`;

const AssetName = styled.span<{ color: string }>`
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 18px;
    font-weight: 400;
    text-transform: capitalize;
`;

const Position = styled.span<{ color: string }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    color: ${(props) => props.color};
    font-size: 18px;
    font-weight: 700;
`;

const Footer = styled(FlexDivCentered)<{ color: string }>`
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 1.1em;
    text-align: center;
    margin-top: 10px;
    padding-left: 16px;
    text-transform: uppercase;
    white-space: nowrap;
`;

export const LossWatermark = styled(FlexDivCentered)`
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    width: 295px;
    height: 110px;
    transform: rotate(-45deg);
    border: 10px solid ${(props) => props.theme.flexCard.background.loss};
    border-radius: 20px;
    font-size: 55px;
    font-weight: 700;
    letter-spacing: 16px;
    text-transform: uppercase;
    color: ${(props) => props.theme.flexCard.background.loss};
`;

export default SpeedMarketFlexCard;
