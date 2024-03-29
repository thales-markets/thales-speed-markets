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
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/ui';
import { getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { coinParser, formatCurrencyWithSign, roundNumberToDecimals } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { SupportedNetwork } from 'types/network';
import { UserPosition } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import { getContarctAbi } from 'utils/contracts/abi';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import { getCollateral, getCollaterals, getDefaultCollateral } from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId, getPriceServiceEndpoint } from 'utils/pyth';
import {
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

    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address } = useAccount();
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
                const parsedAmount = coinParser(position.value.toString(), networkId);
                const allowance = await checkAllowance(
                    parsedAmount,
                    erc20Instance,
                    address as string,
                    addressToApprove
                );
                setAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };
        if (isConnected) {
            getAllowance();
        }
    }, [position.value, networkId, address, isConnected, hasAllowance, isAllowing, isDefaultCollateral, client]);

    const handleAllowance = async (approveAmount: bigint) => {
        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: erc20Contract.addresses[networkId],
            client: client as Client,
        }) as ViemContract;
        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());
        try {
            setIsAllowing(true);

            const hash = await erc20Instance.write.approve([addressToApprove, approveAmount]);
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
        const priceConnection = new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), {
            timeout: CONNECTION_TIMEOUT_MS,
        });

        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        try {
            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[networkId],
                client: client as Client,
            });

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
            const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

            const isEth = collateralAddress === ZERO_ADDRESS;

            const speedMarketsAMMContractWithSigner = getContract({
                abi: getContarctAbi(speedMarketsAMMContract, networkId),
                address: speedMarketsAMMContract.addresses[networkId],
                client: walletClient.data as Client,
            }) as ViemContract;

            const hash = isDefaultCollateral
                ? await speedMarketsAMMContractWithSigner.write.resolveMarket([position.market, priceUpdateData], {
                      value: updateFee,
                  })
                : await speedMarketsAMMContractWithSigner.write.resolveMarketWithOfframp(
                      [position.market, priceUpdateData, collateralAddress, isEth],
                      { value: updateFee }
                  );

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`speed-markets.user-positions.confirmation-message`), id));
                refetchUserNotifications(address as string, networkId);
                refetchUserSpeedMarkets(false, networkId, address as string);
                refetchUserResolvedSpeedMarkets(false, networkId, address as string);
                refetchUserProfileQueries(address as string, networkId);
                refetchBalances(address as string, networkId);
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
                    <Value $isUpperCase color={theme.error.textColor.primary}>
                        {t('common.loss')}
                    </Value>
                </ResultsContainer>
            );
        } else {
            return (
                <ResultsContainer $minWidth="180px">
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

export const ResultsContainer = styled(FlexDivCentered)<{ $minWidth?: string }>`
    gap: 4px;
    font-weight: 700;
    font-size: 13px;
    line-height: 100%;
    white-space: nowrap;
    min-width: ${(props) => (props.$minWidth ? props.$minWidth : '174px')};
`;

export const Label = styled.span<{ color?: string }>`
    color: ${(props) => (props.color ? props.color : props.theme.textColor.secondary)};
`;

export const Value = styled.span<{ color?: string; $isUpperCase?: boolean }>`
    color: ${(props) => props.color || props.theme.textColor.primary};
    ${(props) => (props.$isUpperCase ? 'text-transform: uppercase;' : '')}
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
