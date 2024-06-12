import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import TimeRemaining from 'components/TimeRemaining';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { ONE_HUNDRED_AND_THREE_PERCENT } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { differenceInSeconds, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import {
    Container,
    Label,
    ResultsContainer,
    TimeIcon,
    Value,
    getDefaultButtonProps,
} from 'pages/SpeedMarkets/components/MyPositionAction/MyPositionAction';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { coinParser, formatCurrencyWithSign, roundNumberToDecimals } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { RootState, ThemeInterface } from 'types/ui';
import { getCollateral, getCollaterals, getDefaultCollateral } from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceConnection, getPriceId, priceParser } from 'utils/pyth';
import {
    refetchActiveSpeedMarkets,
    refetchBalances,
    refetchUserResolvedSpeedMarkets,
    refetchUserSpeedMarkets,
} from 'utils/queryConnector';

import { getIsMobile } from 'redux/modules/ui';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { executeBiconomyTransaction } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { getUserLostAtSideIndex } from 'utils/speedAmm';
import { delay } from 'utils/timer';
import { Client, getContract } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type ChainedPositionActionProps = {
    position: UserChainedPosition;
    maxPriceDelayForResolvingSec?: number;
    isOverview?: boolean;
    isAdmin?: boolean;
    isSubmittingBatch?: boolean;
    isCollateralHidden?: boolean;
    setIsActionInProgress?: React.Dispatch<boolean>;
};

const ChainedPositionAction: React.FC<ChainedPositionActionProps> = ({
    position,
    maxPriceDelayForResolvingSec,
    isOverview,
    isAdmin,
    isSubmittingBatch,
    isCollateralHidden,
    setIsActionInProgress,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
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
        isSubmittingBatch !== undefined && setIsSubmitting(isSubmittingBatch);
    }, [isSubmittingBatch]);

    useEffect(() => {
        if (!position.isClaimable || isDefaultCollateral || isOverview) {
            return;
        }

        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: erc20Contract.addresses[networkId],
            client: client as Client,
        });
        const addressToApprove = chainedSpeedMarketsAMMContract.addresses[networkId];

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
        if (isConnected) {
            getAllowance();
        }
    }, [
        position.payout,
        position.isResolved,
        position.isClaimable,
        networkId,
        walletAddress,
        isBiconomy,
        isConnected,
        hasAllowance,
        isAllowing,
        isDefaultCollateral,
        isOverview,
        selectedCollateral,
        client,
    ]);

    // Update action in progress status
    useEffect(() => {
        if (setIsActionInProgress) {
            setIsActionInProgress(isAllowing || isSubmitting);
        }
    }, [isAllowing, isSubmitting, setIsActionInProgress]);

    const handleAllowance = async (approveAmount: bigint) => {
        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: collateralAddress,
            client: client as Client,
        });
        const addressToApprove = chainedSpeedMarketsAMMContract?.addresses[networkId];

        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());
        try {
            setIsAllowing(true);
            let hash;
            if (isBiconomy) {
                hash = await executeBiconomyTransaction(networkId, collateralAddress, erc20Instance, 'approve', [
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
            } else {
                console.log('Transaction status', txReceipt.status);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
                setIsAllowing(false);
                setOpenApprovalModal(false);
            }
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            setIsAllowing(false);
            setOpenApprovalModal(false);
        }
    };

    const handleResolve = async () => {
        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        const chainedSpeedMarketsAMMContractWithSigner = getContract({
            abi: chainedSpeedMarketsAMMContract.abi,
            address: chainedSpeedMarketsAMMContract.addresses[networkId],
            client: walletClient.data as Client,
        }) as ViemContract;
        try {
            let hash;
            const fetchUntilFinalPriceEndIndex = getUserLostAtSideIndex(position) + 1;
            if (isAdmin) {
                const manualFinalPrices: number[] = position.finalPrices
                    .slice(0, fetchUntilFinalPriceEndIndex)
                    .map((finalPrice) => Number(priceParser(finalPrice)));
                if (isBiconomy) {
                    hash = executeBiconomyTransaction(
                        networkId,
                        collateralAddress,
                        chainedSpeedMarketsAMMContractWithSigner,
                        'resolveMarketManually',
                        [position.market, manualFinalPrices]
                    );
                } else {
                    hash = await chainedSpeedMarketsAMMContractWithSigner.write.resolveMarketManually([
                        position.market,
                        manualFinalPrices,
                    ]);
                }
            } else {
                const priceConnection = getPriceConnection(networkId);

                const pythContract = getContract({
                    abi: PythInterfaceAbi,
                    address: PYTH_CONTRACT_ADDRESS[networkId],
                    client: client as Client,
                }) as ViemContract;

                let promises = [];
                const pythPriceId = getPriceId(networkId, position.currencyKey);
                const strikeTimesToFetchPrice = position.strikeTimes.slice(0, fetchUntilFinalPriceEndIndex);
                for (let i = 0; i < strikeTimesToFetchPrice.length; i++) {
                    promises.push(
                        priceConnection.getPriceUpdatesAtTimestamp(millisecondsToSeconds(position.strikeTimes[i]), [
                            pythPriceId,
                        ])
                    );
                }
                const priceFeedUpdateVaas = await Promise.all(promises);

                const priceUpdateDataArray: string[][] = [];
                promises = [];
                for (let i = 0; i < strikeTimesToFetchPrice.length; i++) {
                    const priceUpdate = priceFeedUpdateVaas[i];
                    const publishTime = priceUpdate.parsed
                        ? secondsToMilliseconds(Number(priceUpdate.parsed[0].price.publish_time))
                        : Number.POSITIVE_INFINITY;

                    // check if price feed is not too late
                    if (
                        maxPriceDelayForResolvingSec &&
                        differenceInSeconds(publishTime, position.strikeTimes[i]) > maxPriceDelayForResolvingSec
                    ) {
                        await delay(800);
                        toast.update(
                            id,
                            getErrorToastOptions(t('speed-markets.user-positions.errors.price-stale'), id)
                        );
                        setIsSubmitting(false);
                        return;
                    }

                    const priceUpdateData = priceUpdate.binary.data.map((vaa: string) => '0x' + vaa);
                    priceUpdateDataArray.push(priceUpdateData);
                    promises.push(pythContract.read.getUpdateFee([priceUpdateData]));
                }

                const updateFees = await Promise.all(promises);
                const totalUpdateFee = updateFees.reduce((a: bigint, b: bigint) => a + b, BigInt(0));

                const isEth = collateralAddress === ZERO_ADDRESS;

                if (isBiconomy) {
                    if (isDefaultCollateral) {
                        hash = await executeBiconomyTransaction(
                            networkId,
                            collateralAddress,
                            chainedSpeedMarketsAMMContractWithSigner,
                            'resolveMarket',
                            [position.market, priceUpdateDataArray],
                            totalUpdateFee
                        );
                    } else {
                        hash = await executeBiconomyTransaction(
                            networkId,
                            collateralAddress,
                            chainedSpeedMarketsAMMContractWithSigner,
                            'resolveMarketWithOfframp',
                            [position.market, priceUpdateDataArray, collateralAddress, isEth],
                            totalUpdateFee
                        );
                    }
                } else {
                    hash = isDefaultCollateral
                        ? await chainedSpeedMarketsAMMContractWithSigner.write.resolveMarket(
                              [position.market, priceUpdateDataArray],
                              {
                                  value: totalUpdateFee,
                              }
                          )
                        : await chainedSpeedMarketsAMMContractWithSigner.write.resolveMarketWithOfframp(
                              [position.market, priceUpdateDataArray, collateralAddress, isEth],
                              { value: totalUpdateFee }
                          );
                }
            }

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`speed-markets.user-positions.confirmation-message`), id));
                if (isOverview) {
                    refetchActiveSpeedMarkets(true, networkId);
                } else {
                    refetchUserSpeedMarkets(
                        true,
                        networkId,
                        (isBiconomy ? biconomyConnector.address : walletAddress) as string
                    );
                    refetchUserResolvedSpeedMarkets(
                        true,
                        networkId,
                        (isBiconomy ? biconomyConnector.address : walletAddress) as string
                    );
                    refetchBalances((isBiconomy ? biconomyConnector.address : walletAddress) as string, networkId);
                }
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

    const getResolveButton = () => {
        const additionalButtonStyle: CSSProperties = {
            lineHeight: '100%',
            border: 'none',
        };

        return (
            <Button
                {...getDefaultButtonProps(isMobile)}
                minWidth={isOverview && !isMobile ? '150px' : getDefaultButtonProps(isMobile).minWidth}
                disabled={isSubmitting || (isOverview && !position.canResolve)}
                additionalStyles={additionalButtonStyle}
                onClick={() =>
                    hasAllowance || isDefaultCollateral || isOverview ? handleResolve() : setOpenApprovalModal(true)
                }
            >
                {hasAllowance || isDefaultCollateral || isOverview
                    ? `${
                          isSubmitting
                              ? isOverview
                                  ? isSubmittingBatch
                                      ? t('speed-markets.overview.resolve')
                                      : t(`speed-markets.overview.resolve-progress`)
                                  : t('speed-markets.user-positions.claim-win-progress')
                              : isOverview
                              ? isAdmin
                                  ? `${t('common.admin')} ${t('speed-markets.overview.resolve')}`
                                  : t('speed-markets.overview.resolve')
                              : t('speed-markets.user-positions.claim-win')
                      }${isOverview ? '' : ' ' + formatCurrencyWithSign(USD_SIGN, position.payout, 2)}`
                    : isAllowing
                    ? `${t('common.enable-wallet-access.approve-progress')} ${defaultCollateral}...`
                    : t('common.enable-wallet-access.approve-swap', {
                          currencyKey: selectedCollateral,
                          defaultCurrency: defaultCollateral,
                      })}{' '}
            </Button>
        );
    };

    const getActionStatus = () => {
        if (!position.isResolved) {
            if (position.isClaimable) {
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
            } else if (position.resolveIndex !== undefined) {
                return isOverview ? (
                    getResolveButton()
                ) : (
                    <ResultsContainer>
                        <TimeRemaining
                            end={position.strikeTimes[position.resolveIndex]}
                            showFullCounter
                            showSecondsCounter
                        >
                            <TimeIcon className="icon icon--time" />
                            <Label>{t('common.results')}</Label>
                        </TimeRemaining>
                    </ResultsContainer>
                );
            } else {
                const firstHigherTimeIndex = position.strikeTimes.findIndex((t) => t > Date.now());
                const strikeTimeIndex =
                    firstHigherTimeIndex > -1 ? firstHigherTimeIndex : position.strikeTimes.length - 1;

                return isOverview ? (
                    getResolveButton()
                ) : (
                    <ResultsContainer>
                        <TimeRemaining end={position.strikeTimes[strikeTimeIndex]} showFullCounter showSecondsCounter>
                            <Label>
                                <TimeIcon className="icon icon--time" />
                                {Date.now() > position.maturityDate
                                    ? t('common.results')
                                    : t('speed-markets.user-positions.next-result-in')}
                            </Label>
                        </TimeRemaining>
                    </ResultsContainer>
                );
            }
        } else {
            return (
                <ResultsContainer>
                    <Value $isUpperCase color={position.isUserWinner ? theme.status.won : theme.status.loss}>
                        {position.isUserWinner ? t('common.won') : t('common.loss')}
                    </Value>
                </ResultsContainer>
            );
        }
    };

    return (
        <>
            <Container
                $isFullWidth={!position.isClaimable || !!isOverview}
                $alignCenter={!position.isClaimable && !isOverview && position.canResolve}
            >
                {!isOverview && !isCollateralHidden && isMultiCollateralSupported && position.isClaimable && (
                    <CollateralSelector
                        collateralArray={getCollaterals(networkId)}
                        selectedItem={selectedCollateralIndex}
                        onChangeCollateral={() => {}}
                        disabled={isSubmitting || isAllowing}
                        isIconHidden
                        additionalStyles={{ margin: '0 12px 0 0' }}
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

export default ChainedPositionAction;
