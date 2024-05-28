import CollateralSelector from 'components/CollateralSelector';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import MyPositionAction from 'pages/Profile/components/MyPositionAction';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/currency';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { refetchUserSpeedMarkets } from 'utils/queryConnector';
import { getColorPerPosition } from 'utils/style';
import { useAccount, useChainId } from 'wagmi';
import SharePositionModal from '../../SharePositionModal';

const CardPosition: React.FC<{ position: UserOpenPositions; currentPrices?: { [key: string]: number } }> = ({
    position,
    currentPrices,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const { address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));

    const [isMatured, setIsMatured] = useState(Date.now() > position.maturityDate);
    const [isActionInProgress, setIsActionInProgress] = useState(false);
    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(false);

    useInterval(() => {
        if (Date.now() > position.maturityDate) {
            if (!isMatured) {
                setIsMatured(true);
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

    const displayShare = position.claimable || !isMatured;

    return (
        <Container>
            <Info>
                <InfoColumn>
                    <InfoRow>
                        <Label>{t('common.market')}:</Label>
                        <Value>
                            {position.currencyKey} {formatCurrencyWithSign(USD_SIGN, position.strikePrice)}{' '}
                            <Value $color={getColorPerPosition(position.side, theme)}>{position.side}</Value>
                        </Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>
                            {isMatured
                                ? t('speed-markets.user-positions.price')
                                : t('speed-markets.user-positions.current-price')}
                            :
                        </Label>
                        <Value>
                            {isMatured ? (
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
                    </InfoRow>
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.end-time')}:</Label>
                        <Value>{formatShortDateWithFullTime(position.maturityDate)}</Value>
                    </InfoRow>
                </InfoColumn>
                <InfoColumn>
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.paid')}:</Label>
                        <Value>{formatCurrencyWithSign(USD_SIGN, position.paid)}</Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.payout')}:</Label>
                        <Value>{formatCurrencyWithSign(USD_SIGN, position.payout)}</Value>
                    </InfoRow>
                    <InfoRow>
                        <Label>{t('speed-markets.user-positions.claim-in')}:</Label>
                        <CollateralSelector
                            collateralArray={getCollaterals(networkId)}
                            selectedItem={selectedCollateralIndex}
                            onChangeCollateral={() => {}}
                            disabled={isActionInProgress}
                            isIconHidden
                            additionalStyles={{ margin: '0 0 0 5px' }}
                        />
                    </InfoRow>
                </InfoColumn>
            </Info>
            <Action>
                <MyPositionAction
                    position={position}
                    isCollateralHidden
                    setIsActionInProgress={setIsActionInProgress}
                />
                <ShareDiv>
                    {displayShare && (
                        <ShareIcon
                            className="icon-home icon-home--twitter-x"
                            disabled={false}
                            onClick={() => setOpenTwitterShareModal(true)}
                        />
                    )}
                </ShareDiv>
            </Action>
            {openTwitterShareModal && (
                <SharePositionModal
                    type={position.claimable ? 'resolved-speed' : 'potential-speed'}
                    positions={[position.side]}
                    currencyKey={position.currencyKey}
                    strikeDate={position.maturityDate}
                    strikePrices={[position.strikePrice]}
                    buyIn={position.paid}
                    payout={position.payout}
                    onClose={() => setOpenTwitterShareModal(false)}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 100%;
    min-height: 123px;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 8px;
    padding: 14px 10px;
`;

const Info = styled(FlexDivRow)`
    height: 100%;
`;

const InfoColumn = styled(FlexDivColumn)`
    gap: 6px;

    &:first-child {
        min-width: 214px;
    }
`;

const InfoRow = styled(FlexDivStart)`
    align-items: center;
`;

const Action = styled(FlexDivSpaceBetween)``;

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

const Value = styled(Text)<{ $color?: string }>`
    ${(props) => (props.$color ? `color: ${props.$color};` : '')}
    margin-left: 5px;
`;

const ShareDiv = styled.div`
    height: 20px;
`;

const ShareIcon = styled.i<{ disabled: boolean }>`
    color: ${(props) => props.theme.textColor.secondary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.5' : '1')};
    font-size: 20px;
    text-transform: none;
`;

export default CardPosition;
