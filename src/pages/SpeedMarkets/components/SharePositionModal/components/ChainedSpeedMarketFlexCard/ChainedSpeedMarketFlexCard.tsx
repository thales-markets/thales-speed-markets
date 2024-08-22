import ZeusCard from 'assets/images/flexCards/zeus-card.png';
import { USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { Icon } from 'pages/SpeedMarkets/components/SelectPosition/styled-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { formatCurrencyWithSign, truncToDecimals } from 'thales-utils';
import { SharePositionData } from 'types/flexCards';
import { RootState, ThemeInterface } from 'types/ui';
import { isUserWinner } from 'utils/speedAmm';
import {
    ContainerBorder,
    LogoIcon,
    LogoWrapper,
    LossWatermark,
    Status,
    StatusContainer,
    StatusHeading,
} from '../SpeedMarketFlexCard/SpeedMarketFlexCard';

const ChainedSpeedMarketFlexCard: React.FC<SharePositionData> = ({
    type,
    currencyKey,
    positions,
    strikePrices,
    finalPrices,
    buyIn,
    payout,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isWonType = type === 'chained-speed-won';

    const userStatusByDirection = positions.map(
        (position, i) => finalPrices && strikePrices && isUserWinner(position, strikePrices[i], finalPrices[i])
    );

    const profit = truncToDecimals(payout / buyIn);

    const textColor = isWonType ? theme.flexCard.textColor.won : theme.flexCard.textColor.loss;

    return (
        <ContainerBorder $isWon={isWonType}>
            <Container $isWon={isWonType}>
                <FlexDivColumn>
                    <LogoWrapper>
                        <LogoIcon $color={textColor} className="network-icon  network-icon--speed-full-logo" />
                    </LogoWrapper>
                    {isWonType && (
                        <StatusContainer>
                            <StatusHeading color={textColor}>{t('common.flex-card.won')}</StatusHeading>
                            <Status color={textColor}>{formatCurrencyWithSign(USD_SIGN, payout ?? 0)}</Status>
                        </StatusContainer>
                    )}
                </FlexDivColumn>
                <ContentWrapper isWon={isWonType}>
                    <HeaderRow>
                        <DirectionsHeaderLabel color={textColor} width={isMobile ? 88 : 75} $isLeft>
                            {t('common.direction')}
                        </DirectionsHeaderLabel>
                        <DirectionsHeaderLabel color={textColor} width={isMobile ? 94 : 95}>
                            {t('common.strike-price')}
                        </DirectionsHeaderLabel>
                        <DirectionsHeaderLabel color={textColor} width={isMobile ? 78 : 95} padding="0 0 0 12px">
                            {t('speed-markets.user-positions.final-price')}
                        </DirectionsHeaderLabel>
                        <DirectionsHeaderLabel color={textColor} width={42}>
                            {t('common.result')}
                        </DirectionsHeaderLabel>
                    </HeaderRow>
                    {positions.map((position, index) => {
                        return (
                            <DirectionRow key={index} color={textColor} isLast={index === positions.length - 1}>
                                <Text width={8} color={textColor}>
                                    {index + 1}
                                </Text>
                                <FlexDivCentered>
                                    <Icon
                                        size={20}
                                        color={textColor}
                                        className={`icon icon--caret-${position.toLowerCase()}`}
                                    />
                                    <Text width={50} color={textColor} $isLeft $isBold padding="0 0 0 5px">
                                        {position}
                                    </Text>
                                </FlexDivCentered>
                                <Text width={105} color={textColor}>
                                    {strikePrices && strikePrices[index]
                                        ? `${currencyKey} ${formatCurrencyWithSign(USD_SIGN, strikePrices[index])}`
                                        : '-'}
                                </Text>
                                <Text width={105} color={textColor}>
                                    {finalPrices && finalPrices[index]
                                        ? `${currencyKey} ${formatCurrencyWithSign(USD_SIGN, finalPrices[index])}`
                                        : '-'}
                                </Text>
                                <Text width={25} color={textColor} $isLeft>
                                    {userStatusByDirection[index] === undefined ? (
                                        '-'
                                    ) : (
                                        <Icon
                                            size={20}
                                            color={textColor}
                                            className={`icon icon--${
                                                userStatusByDirection[index] ? 'correct' : 'wrong'
                                            }`}
                                        />
                                    )}
                                </Text>
                            </DirectionRow>
                        );
                    })}
                    <FlexDivRow>
                        <Text color={textColor} $isBold>
                            {`${t('common.flex-card.buy-in')}: ${formatCurrencyWithSign(USD_SIGN, buyIn)}`}
                        </Text>
                        <Text color={textColor} $isBold>{`${
                            isWonType ? t('speed-markets.profit') : t('speed-markets.potential-profit')
                        }: ${profit}x`}</Text>
                    </FlexDivRow>
                </ContentWrapper>
                <Footer color={textColor}>{`${t('speed-markets.chained.label')} ${t('common.markets')}`}</Footer>
                {!isWonType && <LossWatermark>{t('common.loss')}</LossWatermark>}
            </Container>
        </ContainerBorder>
    );
};

const Container = styled(FlexDivColumnCentered)<{ $isWon: boolean }>`
    ${(props) => (props.$isWon ? '' : `border: 10px solid ${props.theme.flexCard.background.loss};`)}
    border-radius: 15px;

    width: ${(props) => (props.$isWon ? '363px' : '383px')};
    height: ${(props) => (props.$isWon ? '490px' : '510px')};

    padding: 10px;
    background: url(${ZeusCard});
    background-position: center;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: ${(props) => (props.$isWon ? '347px' : '357px')};
        height: ${(props) => (props.$isWon ? '466px' : '476px')};

        ${(props) => (!props.$isWon ? 'border-width: 5px;' : '')}

        background-size: cover;
    }
`;

const ContentWrapper = styled(FlexDivColumn)<{ isWon: boolean }>`
    width: 100%;
    justify-content: end;
`;

const HeaderRow = styled(FlexDivRow)`
    padding-left: 20px;
`;

const DirectionsHeaderLabel = styled.span<{ color: string; width?: number; padding?: string; $isLeft?: boolean }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 12px;
    font-weight: 500;
    color: ${(props) => props.color};
    text-align: ${(props) => (props.$isLeft ? 'left' : 'center')};
    text-transform: capitalize;
    width: ${(props) => (props.width ? `${props.width}px` : 'initial')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
`;

const DirectionRow = styled(FlexDivRow)<{ color: string; isLast?: boolean }>`
    border-bottom: ${(props) => (props.isLast ? 'solid' : 'dashed')} 2px;
    border-color: ${(props) => props.color};
    padding-left: 5px;
`;

const Text = styled.span<{
    color: string;
    width?: number;
    $isBold?: boolean;
    $isUppercase?: boolean;
    padding?: string;
    $isLeft?: boolean;
}>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 13px;
    font-weight: ${(props) => (props.$isBold ? 800 : 500)};
    line-height: 230%;
    color: ${(props) => props.color};
    width: ${(props) => (props.width ? `${props.width}px` : 'initial')};
    text-align: ${(props) => (props.$isLeft ? 'left' : 'center')};
    padding: ${(props) => (props.padding ? props.padding : '0')};
    text-transform: ${(props) => (props.$isUppercase ? 'uppercase' : 'capitalize')};
    text-wrap: nowrap;
`;

const Footer = styled(FlexDivCentered)<{ color: string }>`
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 1em;
    text-align: center;
    margin-top: 10px;
    padding-left: 14px;
    text-transform: uppercase;
    white-space: nowrap;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        letter-spacing: 0.9em;
    }
`;

export default ChainedSpeedMarketFlexCard;
