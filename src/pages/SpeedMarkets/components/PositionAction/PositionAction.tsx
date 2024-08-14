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
import { PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { differenceInSeconds, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { coinParser, formatCurrencyWithSign, roundNumberToDecimals } from 'thales-utils';
import { UserPosition } from 'types/market';
import { SupportedNetwork } from 'types/network';
import { RootState, ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import { executeBiconomyTransaction } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import { getContractAbi } from 'utils/contracts/abi';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import { getCollateral, getCollaterals, getDefaultCollateral } from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceConnection, getPriceId, priceParser } from 'utils/pyth';
import {
    refetchActiveSpeedMarkets,
    refetchBalances,
    refetchUserNotifications,
    refetchUserProfileQueries,
    refetchUserResolvedSpeedMarkets,
    refetchUserSpeedMarkets,
} from 'utils/queryConnector';
import { delay } from 'utils/timer';
import { Client, getContract } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

const ONE_HUNDRED_AND_THREE_PERCENT = 1.03;

type PositionActionProps = {
    position: UserPosition;
    maxPriceDelayForResolvingSec?: number;
    isCollateralHidden?: boolean;
    isOverview?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
    setIsActionInProgress?: React.Dispatch<boolean>;
};

const PositionAction: React.FC<PositionActionProps> = ({
    position,
    maxPriceDelayForResolvingSec,
    isCollateralHidden,
    isOverview,
    isAdmin,
    isSubmittingBatch,
    setIsActionInProgress,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
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
        ? multipleCollateral[selectedCollateral].addresses[networkId]
        : erc20Contract.addresses[networkId];

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);

    // Update action in progress status
    useEffect(() => {
        if (setIsActionInProgress) {
            setIsActionInProgress(isAllowing || isSubmitting);
        }
    }, [isAllowing, isSubmitting, setIsActionInProgress]);

    useEffect(() => {
        isSubmittingBatch && setIsSubmitting(isSubmittingBatch);
    }, [isSubmittingBatch]);

    useEffect(() => {
        if (isDefaultCollateral) {
            return;
        }

        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: erc20Contract.addresses[networkId],
            client: client as Client,
        }) as ViemContract;
        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const getAllowance = async () => {
            try {
                const parsedAmount = coinParser(position.payout.toString(), networkId);
                const allowance = await checkAllowance(
                    parsedAmount,
                    erc20Instance,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string,
                    addressToApprove
                );
                setAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };

        if (isOverview) {
            setAllowance(true);
        } else if (isConnected) {
            getAllowance();
        }
    }, [
        isOverview,
        position.payout,
        networkId,
        walletAddress,
        isBiconomy,
        isConnected,
        hasAllowance,
        isAllowing,
        isDefaultCollateral,
        client,
    ]);

    const handleAllowance = async (approveAmount: bigint) => {
        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: erc20Contract.addresses[networkId],
            client: walletClient.data as Client,
        }) as ViemContract;

        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());
        try {
            setIsAllowing(true);
            let hash;
            if (isBiconomy) {
                hash = await executeBiconomyTransaction(networkId, erc20Instance.address, erc20Instance, 'approve', [
                    addressToApprove,
                    approveAmount,
                ]);
            } else {
                hash = await erc20Instance.write.approve([addressToApprove, approveAmount]);
            }
            setOpenApprovalModal(false);
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });
            if (txReceipt.status === 'success') {
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
        const priceConnection = getPriceConnection(networkId);

        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        try {
            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[networkId],
                client: client as Client,
            });

            const priceFeedUpdate = await priceConnection.getPriceUpdatesAtTimestamp(
                millisecondsToSeconds(position.maturityDate),
                [getPriceId(networkId, position.currencyKey)]
            );

            const publishTime = priceFeedUpdate.parsed
                ? secondsToMilliseconds(priceFeedUpdate.parsed[0].price.publish_time)
                : Number.POSITIVE_INFINITY;

            // check if price feed is not too late
            if (
                maxPriceDelayForResolvingSec &&
                differenceInSeconds(publishTime, position.maturityDate) > maxPriceDelayForResolvingSec
            ) {
                await delay(800);
                toast.update(id, getErrorToastOptions(t('speed-markets.user-positions.errors.price-stale'), id));
                setIsSubmitting(false);
                return;
            }

            const priceUpdateData = priceFeedUpdate.binary.data.map((vaa: string) => '0x' + vaa);
            const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

            const isEth = collateralAddress === ZERO_ADDRESS;

            const speedMarketsAMMContractWithSigner = getContract({
                abi: getContractAbi(speedMarketsAMMContract, networkId),
                address: speedMarketsAMMContract.addresses[networkId],
                client: walletClient.data as Client,
            }) as ViemContract;

            let hash;
            if (isBiconomy) {
                hash = isDefaultCollateral
                    ? await executeBiconomyTransaction(
                          networkId,
                          collateralAddress,
                          speedMarketsAMMContractWithSigner,
                          'resolveMarket',
                          [position.market, priceUpdateData]
                      )
                    : await executeBiconomyTransaction(
                          networkId,
                          collateralAddress,
                          speedMarketsAMMContractWithSigner,
                          'resolveMarketWithOfframp',
                          [position.market, priceUpdateData, collateralAddress, isEth],
                          undefined,
                          isEth
                      );
            } else {
                hash = isDefaultCollateral
                    ? await speedMarketsAMMContractWithSigner.write.resolveMarket([position.market, priceUpdateData], {
                          value: updateFee,
                      })
                    : await speedMarketsAMMContractWithSigner.write.resolveMarketWithOfframp(
                          [position.market, priceUpdateData, collateralAddress, isEth],
                          { value: updateFee }
                      );
            }
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`speed-markets.user-positions.confirmation-message`), id));
                refetchUserNotifications((isBiconomy ? biconomyConnector.address : walletAddress) as string, networkId);
                refetchUserSpeedMarkets(
                    false,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
                refetchUserResolvedSpeedMarkets(
                    false,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
                refetchUserProfileQueries(
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string,
                    networkId
                );
                refetchBalances((isBiconomy ? biconomyConnector.address : walletAddress) as string, networkId);
            } else {
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
        }
        setIsSubmitting(false);
    };

    const handleOverviewResolve = async () => {
        const priceConnection = getPriceConnection(networkId);

        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        const speedMarketsAMMContractWithSigner = getContract({
            abi: getContractAbi(speedMarketsAMMContract, networkId),
            address: speedMarketsAMMContract.addresses[networkId],
            client: walletClient.data as Client,
        }) as ViemContract;
        try {
            let hash;
            if (isAdmin) {
                if (isBiconomy) {
                    hash = await executeBiconomyTransaction(
                        networkId,
                        collateralAddress,
                        speedMarketsAMMContractWithSigner,
                        'resolveMarketManually',
                        [position.market, Number(priceParser(position.finalPrice || 0))]
                    );
                } else {
                    hash = await speedMarketsAMMContractWithSigner.write.resolveMarketManually([
                        position.market,
                        Number(priceParser(position.finalPrice || 0)),
                    ]);
                }
            } else {
                const pythContract = getContract({
                    abi: PythInterfaceAbi,
                    address: PYTH_CONTRACT_ADDRESS[networkId],
                    client: client as Client,
                }) as ViemContract;

                const priceFeedUpdate = await priceConnection.getPriceUpdatesAtTimestamp(
                    millisecondsToSeconds(position.maturityDate),
                    [getPriceId(networkId, position.currencyKey)]
                );

                const publishTime = priceFeedUpdate.parsed
                    ? secondsToMilliseconds(priceFeedUpdate.parsed[0].price.publish_time)
                    : Number.POSITIVE_INFINITY;

                // check if price feed is not too late
                if (
                    maxPriceDelayForResolvingSec &&
                    differenceInSeconds(publishTime, position.maturityDate) > maxPriceDelayForResolvingSec
                ) {
                    await delay(800);
                    toast.update(id, getErrorToastOptions(t('speed-markets.user-positions.errors.price-stale'), id));
                    setIsSubmitting(false);
                    return;
                }

                const priceUpdateData = priceFeedUpdate.binary.data.map((vaa: string) => '0x' + vaa);
                const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

                if (isBiconomy) {
                    hash = await executeBiconomyTransaction(
                        networkId,
                        collateralAddress,
                        speedMarketsAMMContractWithSigner,
                        'resolveMarket',
                        [position.market, priceUpdateData]
                    );
                } else {
                    hash = await speedMarketsAMMContractWithSigner.write.resolveMarket(
                        [position.market, priceUpdateData],
                        {
                            value: updateFee,
                        }
                    );
                }
            }

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`speed-markets.overview.confirmation-message`), id));
                refetchActiveSpeedMarkets(false, networkId);
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
        }
        setIsSubmitting(false);
    };

    const getResolveButton = () => (
        <Button
            {...getDefaultButtonProps(isMobile)}
            additionalStyles={additionalButtonStyle}
            disabled={isSubmitting}
            onClick={() => (hasAllowance || isDefaultCollateral ? handleResolve() : setOpenApprovalModal(true))}
        >
            {hasAllowance || isDefaultCollateral
                ? `${
                      isSubmitting
                          ? t('speed-markets.user-positions.claim-win-progress')
                          : t('speed-markets.user-positions.claim-win')
                  } ${formatCurrencyWithSign(USD_SIGN, position.payout, 2)}`
                : isAllowing
                ? `${t('common.enable-wallet-access.approve-progress')} ${defaultCollateral}...`
                : t('common.enable-wallet-access.approve-swap', {
                      currencyKey: selectedCollateral,
                      defaultCurrency: defaultCollateral,
                  })}{' '}
        </Button>
    );

    const getActionStatus = () => {
        if (isOverview) {
            return (
                <>
                    {position.maturityDate > Date.now() ? (
                        <ResultsContainer>
                            <TimeRemaining end={position.maturityDate} showFullCounter showSecondsCounter>
                                <TimeIcon className="icon icon--time" />
                                <Label>{t('speed-markets.user-positions.result-in')}</Label>
                            </TimeRemaining>
                        </ResultsContainer>
                    ) : (
                        <Button
                            {...getDefaultButtonProps(isMobile)}
                            minWidth="150px"
                            additionalStyles={additionalButtonStyle}
                            disabled={isSubmitting || !position.finalPrice || !isConnected}
                            onClick={() => handleOverviewResolve()}
                        >
                            {isSubmitting && !isSubmittingBatch
                                ? t(`speed-markets.overview.resolve-progress`)
                                : isAdmin
                                ? `${t('common.admin')} ${t('speed-markets.overview.resolve')}`
                                : t('speed-markets.overview.resolve')}
                        </Button>
                    )}
                </>
            );
        } else if (position.isClaimable) {
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
        } else if (Date.now() > position.maturityDate) {
            return (
                <ResultsContainer>
                    <Value $color={position.finalPrice ? theme.status.loss : undefined} $isUpperCase>
                        {position.finalPrice ? t('common.loss') : t('speed-markets.user-positions.waiting-price')}
                    </Value>
                </ResultsContainer>
            );
        } else {
            return (
                <ResultsContainer>
                    <TimeRemaining end={position.maturityDate} showFullCounter showSecondsCounter>
                        <TimeIcon className="icon icon--time" />
                        <Label>{t('speed-markets.user-positions.result-in')}</Label>
                    </TimeRemaining>
                </ResultsContainer>
            );
        }
    };

    return (
        <>
            <Container
                $isFullWidth={!position.isClaimable || !!isOverview}
                $alignCenter={!position.isClaimable && !isOverview && Date.now() < position.maturityDate}
            >
                {!isOverview && !isCollateralHidden && isMultiCollateralSupported && position.isClaimable && (
                    <CollateralSelector
                        collateralArray={getCollaterals(networkId)}
                        selectedItem={selectedCollateralIndex}
                        onChangeCollateral={() => {}}
                        disabled={isSubmitting || isAllowing}
                        isIconHidden
                        additionalStyles={{ margin: '0 12px 0 0' }}
                        invertCollors
                    />
                )}
                {getActionStatus()}
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    // add three percent to approval amount to take into account price changes
                    defaultAmount={roundNumberToDecimals(ONE_HUNDRED_AND_THREE_PERCENT * position.payout)}
                    tokenSymbol={defaultCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

export const Container = styled(FlexDivCentered)<{
    $isFullWidth: boolean;
    $alignCenter: boolean;
}>`
    white-space: pre;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        ${(props) => (props.$isFullWidth ? 'width: 100%;' : '')}
        ${(props) => (props.$alignCenter ? 'padding-left: 20px;' : '')}
    }
`;

export const getDefaultButtonProps = (isMobile: boolean) => ({
    minWidth: isMobile ? '282px' : '180px',
    height: '30px',
    fontSize: '13px',
});

const additionalButtonStyle: CSSProperties = {
    lineHeight: '100%',
    border: 'none',
};

export const ResultsContainer = styled(FlexDivCentered)`
    gap: 4px;
    font-weight: 800;
    font-size: 13px;
    line-height: 100%;
    white-space: nowrap;
    min-width: 174px;
`;

export const TimeIcon = styled.i`
    font-weight: normal;
    margin-right: 5px;
    margin-bottom: 1px;
`;

export const Label = styled.span`
    padding-right: 5px;
`;

export const Value = styled.span<{ $color?: string; $isUpperCase?: boolean }>`
    color: ${(props) => props.$color || props.theme.textColor.secondary};
    ${(props) => (props.$isUpperCase ? 'text-transform: uppercase;' : '')}
    font-weight: 700;
    line-height: 100%;
`;

export const CollateralSelectorContainer = styled(FlexDivCentered)`
    line-height: 15px;
    padding-right: 2px;
    text-transform: none;
`;

export default PositionAction;
