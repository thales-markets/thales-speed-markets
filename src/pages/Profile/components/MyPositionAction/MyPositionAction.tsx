import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import ApprovalModal from 'components/ApprovalModal/ApprovalModal';
import Button from 'components/Button/Button';
import CollateralSelector from 'components/CollateralSelector/CollateralSelector';
import TimeRemaining from 'components/TimeRemaining/TimeRemaining';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import Tooltip from 'components/Tooltip/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { CONNECTION_TIMEOUT_MS, PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { differenceInSeconds, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getSelectedCollateralIndex, getWalletAddress } from 'redux/modules/wallet';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { coinParser, formatCurrencyWithSign, roundNumberToDecimals } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { UserPosition } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import erc20Contract from 'utils/contracts/erc20Contract';
import { getCollateral, getCollaterals, getDefaultCollateral } from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId, getPriceServiceEndpoint } from 'utils/pyth';
import {
    refetchUserNotifications,
    refetchUserProfileQueries,
    refetchUserResolvedSpeedMarkets,
    refetchUserSpeedMarkets,
} from 'utils/queryConnector';
import snxJSConnector from 'utils/snxJSConnector';
import { delay } from 'utils/timer';

const ONE_HUNDRED_AND_THREE_PERCENT = 1.03;

type MyPositionActionProps = {
    position: UserPosition | UserOpenPositions;
    isProfileAction?: boolean;
    maxPriceDelayForResolvingSec?: number;
    isMultipleContainerRows?: boolean;
};

const MyPositionAction: React.FC<MyPositionActionProps> = ({
    position,
    isProfileAction,
    maxPriceDelayForResolvingSec,
    isMultipleContainerRows,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;
    const collateralAddress = isMultiCollateralSupported
        ? snxJSConnector.multipleCollateral && snxJSConnector.multipleCollateral[selectedCollateral]?.address
        : snxJSConnector.collateral?.address;

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);

    useEffect(() => {
        if (isDefaultCollateral) {
            return;
        }

        const { speedMarketsAMMContract, collateral } = snxJSConnector;
        const erc20Instance = new ethers.Contract(
            collateral?.address || '',
            erc20Contract.abi,
            snxJSConnector.provider
        );
        const addressToApprove = speedMarketsAMMContract?.address || '';

        const getAllowance = async () => {
            try {
                const parsedAmount = coinParser(position.value.toString(), networkId);
                const allowance = await checkAllowance(parsedAmount, erc20Instance, walletAddress, addressToApprove);
                setAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };
        if (isWalletConnected && erc20Instance.provider) {
            getAllowance();
        }
    }, [position.value, networkId, walletAddress, isWalletConnected, hasAllowance, isAllowing, isDefaultCollateral]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { speedMarketsAMMContract, collateral } = snxJSConnector;
        const erc20Instance = new ethers.Contract(collateral?.address || '', erc20Contract.abi, snxJSConnector.signer);
        const addressToApprove = speedMarketsAMMContract?.address || '';

        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());
        try {
            setIsAllowing(true);

            const tx = (await erc20Instance.approve(addressToApprove, approveAmount)) as ethers.ContractTransaction;
            setOpenApprovalModal(false);
            const txResult = await tx.wait();
            if (txResult && txResult.transactionHash) {
                toast.update(id, getSuccessToastOptions(t(`common.transaction.successful`), id));
                setAllowance(true);
                setIsAllowing(false);
            }
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            setIsAllowing(false);
            setOpenApprovalModal(false);
        }
    };

    const handleResolve = async () => {
        const priceConnection = new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), {
            timeout: CONNECTION_TIMEOUT_MS,
        });

        const { speedMarketsAMMContract, signer } = snxJSConnector as any;
        if (speedMarketsAMMContract) {
            setIsSubmitting(true);
            const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

            const speedMarketsAMMContractWithSigner = speedMarketsAMMContract.connect(signer);
            try {
                const pythContract = new ethers.Contract(
                    PYTH_CONTRACT_ADDRESS[networkId],
                    PythInterfaceAbi as any,
                    (snxJSConnector as any).provider
                );

                const [priceFeedUpdateVaa, publishTime] = await priceConnection.getVaa(
                    getPriceId(networkId, position.currencyKey),
                    millisecondsToSeconds(position.maturityDate)
                );

                // check if price feed is not too late
                if (
                    maxPriceDelayForResolvingSec &&
                    differenceInSeconds(secondsToMilliseconds(publishTime), position.maturityDate) >
                        maxPriceDelayForResolvingSec
                ) {
                    await delay(800);
                    toast.update(id, getErrorToastOptions(t('speed-markets.user-positions.errors.price-stale'), id));
                    setIsSubmitting(false);
                    return;
                }

                const priceUpdateData = ['0x' + Buffer.from(priceFeedUpdateVaa, 'base64').toString('hex')];
                const updateFee = await pythContract.getUpdateFee(priceUpdateData);

                const isEth = collateralAddress === ZERO_ADDRESS;

                const tx: ethers.ContractTransaction = isDefaultCollateral
                    ? await speedMarketsAMMContractWithSigner.resolveMarket(position.market, priceUpdateData, {
                          value: updateFee,
                      })
                    : await speedMarketsAMMContractWithSigner.resolveMarketWithOfframp(
                          position.market,
                          priceUpdateData,
                          collateralAddress,
                          isEth,
                          { value: updateFee }
                      );

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t(`speed-markets.user-positions.confirmation-message`), id)
                    );
                    refetchUserNotifications(walletAddress, networkId);
                    refetchUserSpeedMarkets(false, networkId, walletAddress);
                    refetchUserResolvedSpeedMarkets(false, networkId, walletAddress);
                    refetchUserProfileQueries(walletAddress, networkId);
                }
            } catch (e) {
                console.log(e);
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            }
            setIsSubmitting(false);
        }
    };

    const getResolveButton = () => (
        <Button
            {...getDefaultButtonProps(isMobile)}
            disabled={isSubmitting}
            additionalStyles={additionalButtonStyle}
            backgroundColor={theme.button.textColor.quaternary}
            onClick={() => (hasAllowance || isDefaultCollateral ? handleResolve() : setOpenApprovalModal(true))}
        >
            {hasAllowance || isDefaultCollateral
                ? `${
                      isSubmitting
                          ? t('speed-markets.user-positions.claim-win-progress')
                          : t('speed-markets.user-positions.claim-win')
                  } ${formatCurrencyWithSign(USD_SIGN, position.value, 2)}`
                : isAllowing
                ? `${t('common.enable-wallet-access.approve-progress')} ${defaultCollateral}...`
                : t('common.enable-wallet-access.approve-swap', {
                      currencyKey: selectedCollateral,
                      defaultCurrency: defaultCollateral,
                  })}{' '}
        </Button>
    );

    const getButton = () => {
        if (position.claimable) {
            return hasAllowance || isDefaultCollateral ? (
                getResolveButton()
            ) : (
                <Tooltip
                    overlay={t('speed-markets.user-positions.approve-swap-tooltip', {
                        currencyKey: selectedCollateral,
                        defaultCurrency: defaultCollateral,
                    })}
                >
                    <div>{getResolveButton()}</div>
                </Tooltip>
            );
        } else if (position.finalPrice) {
            return (
                <ResultsContainer>
                    <Label>{t('common.result')}</Label>
                    <Value isUpperCase color={theme.error.textColor.primary}>
                        {t('common.loss')}
                    </Value>
                </ResultsContainer>
            );
        } else {
            return (
                <ResultsContainer minWidth="180px">
                    <Label>{t('speed-markets.user-positions.results')}</Label>
                    <TimeRemaining fontSize={13} end={position.maturityDate} showFullCounter showSecondsCounter />
                </ResultsContainer>
            );
        }
    };

    return (
        <>
            <FlexDivCentered>
                {getButton()}
                {isMultiCollateralSupported && position.claimable && (
                    <CollateralSelectorContainer>
                        <InLabel color={theme.button.textColor.quaternary}>{t('common.in')}</InLabel>
                        <CollateralSelector
                            collateralArray={getCollaterals(networkId)}
                            selectedItem={selectedCollateralIndex}
                            onChangeCollateral={() => {}}
                            disabled={isSubmitting || isAllowing}
                            additionalStyles={{
                                color: theme.button.textColor.quaternary,
                                position: !isMultipleContainerRows ? undefined : 'relative',
                            }}
                            isDropDownAbove={isMobile && !isProfileAction}
                        />
                    </CollateralSelectorContainer>
                )}
            </FlexDivCentered>
            {openApprovalModal && (
                <ApprovalModal
                    // add three percent to approval amount to take into account price changes
                    defaultAmount={roundNumberToDecimals(ONE_HUNDRED_AND_THREE_PERCENT * position.value)}
                    tokenSymbol={defaultCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

export const getDefaultButtonProps = (isMobile: boolean) => ({
    height: isMobile ? '24px' : '27px',
    fontSize: isMobile ? '12px' : '13px',
    padding: '0px 5px',
});

const additionalButtonStyle: CSSProperties = {
    minWidth: '180px',
    lineHeight: '100%',
    border: 'none',
};

export const ResultsContainer = styled(FlexDivCentered)<{ minWidth?: string }>`
    gap: 4px;
    font-weight: 700;
    font-size: 13px;
    line-height: 100%;
    white-space: nowrap;
    min-width: ${(props) => (props.minWidth ? props.minWidth : '174px')};
`;

export const Label = styled.span<{ color?: string }>`
    color: ${(props) => (props.color ? props.color : props.theme.textColor.secondary)};
`;

export const Value = styled.span<{ color?: string; isUpperCase?: boolean }>`
    color: ${(props) => props.color || props.theme.textColor.primary};
    ${(props) => (props.isUpperCase ? 'text-transform: uppercase;' : '')}
    font-weight: bold;
    line-height: 100%;
`;

export const CollateralSelectorContainer = styled(FlexDivCentered)`
    line-height: 15px;
    padding-right: 2px;
    text-transform: none;
`;

export const InLabel = styled(Label)`
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    margin-left: 5px;
    text-transform: uppercase;
`;

export default MyPositionAction;
